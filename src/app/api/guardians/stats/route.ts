// src/app/api/guardians/stats/route.ts
import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { authenticate } from "@/lib/apiAuthenticator";
import { sendResponse } from "@/lib/sendResponse";

// GET /api/guardians/stats - Get guardian statistics (Admin only)
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
      totalGuardians,
      activeGuardians,
      inactiveGuardians,
      guardiansByRelationship,
      guardiansWithStudents,
      guardiansWithoutStudents,
      recentRegistrations,
    ] = await Promise.all([
      // Total guardians
      prisma.guardian.count(),

      // Active guardians
      prisma.guardian.count({
        where: { user: { isActive: true } },
      }),

      // Inactive guardians
      prisma.guardian.count({
        where: { user: { isActive: false } },
      }),

      // Guardians by relationship
      prisma.guardian.groupBy({
        by: ["relationship"],
        _count: true,
      }),

      // Guardians with students
      prisma.guardian.count({
        where: { students: { some: {} } },
      }),

      // Guardians without students
      prisma.guardian.count({
        where: { students: { none: {} } },
      }),

      // Recent registrations (last 30 days)
      prisma.guardian.count({
        where: {
          createdAt: {
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
          },
        },
      }),
    ]);

    // Get top guardians by number of students
    const topGuardians = await prisma.guardian.findMany({
      where: {
        students: { some: {} },
      },
      orderBy: {
        students: {
          _count: "desc",
        },
      },
      take: 5,
      select: {
        id: true,
        name: true,
        relationship: true,
        _count: {
          select: {
            students: true,
          },
        },
        user: {
          select: {
            email: true,
          },
        },
      },
    });

    return sendResponse({
      success: true,
      message: "Guardian statistics fetched successfully",
      data: {
        total: totalGuardians,
        active: activeGuardians,
        inactive: inactiveGuardians,
        byRelationship: guardiansByRelationship,
        withStudents: guardiansWithStudents,
        withoutStudents: guardiansWithoutStudents,
        topGuardians,
        recentRegistrations,
        coverageRate:
          totalGuardians > 0
            ? Math.round((guardiansWithStudents / totalGuardians) * 100)
            : 0,
        completionRate:
          totalGuardians > 0
            ? Math.round((activeGuardians / totalGuardians) * 100)
            : 0,
      },
    });
  } catch (error) {
    console.error("Error fetching guardian statistics:", error);
    return sendResponse({
      success: false,
      message: "Internal server error",
      status: 500,
    });
  }
}
