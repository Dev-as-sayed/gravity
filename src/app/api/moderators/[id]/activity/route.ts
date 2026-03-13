// src/app/api/moderators/[id]/activity/route.ts
import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { authenticate } from "@/lib/apiAuthenticator";
import { sendResponse } from "@/lib/sendResponse";

// GET /api/moderators/[id]/activity - Get moderator activity
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    // Authenticate - ADMIN, SUPER_ADMIN can view
    const auth = await authenticate(req, "ADMIN", "SUPER_ADMIN");

    if (!auth.success) {
      return sendResponse({
        success: false,
        message: auth.error || "Unauthorized",
        status: auth.status || 401,
      });
    }

    const { id } = params;

    const moderator = await prisma.moderator.findUnique({
      where: { id },
      include: {
        // FIXED: Use include instead of select to get user id
        user: {
          select: {
            id: true,
            lastLogin: true,
          },
        },
      },
    });

    if (!moderator) {
      return sendResponse({
        success: false,
        message: "Moderator not found",
        status: 404,
      });
    }

    // Get recent activity from user activity logs - FIXED: Check if user exists
    const recentActivity = moderator.user?.id
      ? await prisma.userActivity.findMany({
          where: {
            userId: moderator.user.id,
          },
          orderBy: {
            createdAt: "desc",
          },
          take: 20,
        })
      : [];

    // Get moderation actions - FIXED: Check if user exists
    const moderationActions = moderator.user?.id
      ? await prisma.auditLog.findMany({
          where: {
            userId: moderator.user.id,
            action: {
              in: [
                "MODERATE_POST",
                "HIDE_COMMENT",
                "RESOLVE_DOUBT",
                "APPROVE_NOTE",
              ],
            },
          },
          orderBy: {
            createdAt: "desc",
          },
          take: 20,
        })
      : [];

    return sendResponse({
      success: true,
      message: "Moderator activity fetched successfully",
      data: {
        moderator: {
          id: moderator.id,
          name: moderator.name,
          lastActive: moderator.lastActive,
          actionsTaken: moderator.actionsTaken,
          resolvedIssues: moderator.resolvedIssues,
          lastLogin: moderator.user?.lastLogin,
        },
        recentActivity,
        moderationActions,
        activitySummary: {
          totalActions: moderator.actionsTaken,
          totalResolved: moderator.resolvedIssues,
          resolutionRate:
            moderator.actionsTaken > 0
              ? Math.round(
                  (moderator.resolvedIssues / moderator.actionsTaken) * 100,
                )
              : 0,
        },
      },
    });
  } catch (error) {
    console.error("Error fetching moderator activity:", error);
    return sendResponse({
      success: false,
      message: "Internal server error",
      status: 500,
    });
  }
}

// PATCH /api/moderators/[id]/activity - Update moderator activity
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    // Authenticate - only ADMIN and SUPER_ADMIN can update
    const auth = await authenticate(req, "ADMIN", "SUPER_ADMIN");

    if (!auth.success) {
      return sendResponse({
        success: false,
        message: auth.error || "Unauthorized",
        status: auth.status || 401,
      });
    }

    const { id } = params;
    const body = await req.json();

    // Check if moderator exists
    const moderator = await prisma.moderator.findUnique({
      where: { id },
    });

    if (!moderator) {
      return sendResponse({
        success: false,
        message: "Moderator not found",
        status: 404,
      });
    }

    // Update moderator activity
    const updatedModerator = await prisma.moderator.update({
      where: { id },
      data: {
        lastActive: new Date(),
        ...(body.incrementActions && {
          actionsTaken: { increment: body.incrementActions },
        }),
        ...(body.incrementResolved && {
          resolvedIssues: { increment: body.incrementResolved },
        }),
      },
    });

    return sendResponse({
      success: true,
      message: "Moderator activity updated successfully",
      data: updatedModerator,
    });
  } catch (error) {
    console.error("Error updating moderator activity:", error);
    return sendResponse({
      success: false,
      message: "Internal server error",
      status: 500,
    });
  }
}
