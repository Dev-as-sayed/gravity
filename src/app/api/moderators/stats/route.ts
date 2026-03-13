// src/app/api/moderators/stats/route.ts
import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { authenticate } from "@/lib/apiAuthenticator";
import { sendResponse } from "@/lib/sendResponse";

// GET /api/moderators/stats - Get moderator statistics (Admin only)
export async function GET(req: NextRequest) {
  try {
    // Authenticate - only ADMIN and SUPER_ADMIN can access
    const auth = await authenticate(req, "ADMIN", "SUPER_ADMIN");

    if (!auth.success) {
      return sendResponse({
        success: false,
        message: auth.error || "Unauthorized",
        status: auth.status || 401,
      });
    }

    // Get statistics
    const [
      totalModerators,
      activeModerators,
      inactiveModerators,
      moderatorsWithBatches,
      moderatorsWithoutBatches,
      recentRegistrations,
      topModerators,
    ] = await Promise.all([
      // Total moderators
      prisma.moderator.count(),

      // Active moderators
      prisma.moderator.count({
        where: { user: { isActive: true } },
      }),

      // Inactive moderators
      prisma.moderator.count({
        where: { user: { isActive: false } },
      }),

      // Moderators with batches
      prisma.moderator.count({
        where: { batches: { some: {} } },
      }),

      // Moderators without batches
      prisma.moderator.count({
        where: { batches: { none: {} } },
      }),

      // Recent registrations (last 30 days)
      prisma.moderator.count({
        where: {
          createdAt: {
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
          },
        },
      }),

      // Top moderators by actions
      prisma.moderator.findMany({
        orderBy: {
          actionsTaken: "desc",
        },
        take: 5,
        select: {
          id: true,
          name: true,
          actionsTaken: true,
          resolvedIssues: true,
          _count: {
            select: {
              batches: true,
            },
          },
          user: {
            select: {
              email: true,
            },
          },
        },
      }),
    ]);

    // Get assignment statistics
    const assignmentStats = await prisma.moderator.groupBy({
      by: ["assignedBy"],
      _count: true,
    });

    return sendResponse({
      success: true,
      message: "Moderator statistics fetched successfully",
      data: {
        total: totalModerators,
        active: activeModerators,
        inactive: inactiveModerators,
        withBatches: moderatorsWithBatches,
        withoutBatches: moderatorsWithoutBatches,
        topModerators,
        recentRegistrations,
        assignmentStats,
        coverageRate:
          totalModerators > 0
            ? Math.round((moderatorsWithBatches / totalModerators) * 100)
            : 0,
        completionRate:
          totalModerators > 0
            ? Math.round((activeModerators / totalModerators) * 100)
            : 0,
      },
    });
  } catch (error) {
    console.error("Error fetching moderator statistics:", error);
    return sendResponse({
      success: false,
      message: "Internal server error",
      status: 500,
    });
  }
}
