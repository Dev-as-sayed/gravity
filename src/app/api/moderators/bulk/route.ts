// src/app/api/moderators/bulk/route.ts
import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { authenticate } from "@/lib/apiAuthenticator";
import { sendResponse } from "@/lib/sendResponse";

// POST /api/moderators/bulk - Bulk operations on moderators
export async function POST(req: NextRequest) {
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

    const body = await req.json();
    const { moderatorIds, action } = body;

    if (
      !moderatorIds ||
      !Array.isArray(moderatorIds) ||
      moderatorIds.length === 0
    ) {
      return sendResponse({
        success: false,
        message: "moderatorIds array is required",
        status: 400,
      });
    }

    if (
      !action ||
      !["activate", "deactivate", "delete", "assignBatches"].includes(action)
    ) {
      return sendResponse({
        success: false,
        message:
          "Invalid action. Must be 'activate', 'deactivate', 'delete', or 'assignBatches'",
        status: 400,
      });
    }

    let result;

    switch (action) {
      case "activate":
      case "deactivate":
        const isActive = action === "activate";

        // Get all moderator user IDs
        const moderators = await prisma.moderator.findMany({
          where: { id: { in: moderatorIds } },
          select: { userId: true },
        });

        const userIds = moderators.map((m) => m.userId);

        // Update user active status
        result = await prisma.user.updateMany({
          where: { id: { in: userIds } },
          data: { isActive },
        });

        return sendResponse({
          success: true,
          message: `${result.count} moderators ${action}d successfully`,
          data: { count: result.count },
        });

      case "delete":
        // Get all moderator user IDs
        const moderatorsToDelete = await prisma.moderator.findMany({
          where: { id: { in: moderatorIds } },
          select: { userId: true },
        });

        const userIdsToDelete = moderatorsToDelete.map((m) => m.userId);

        // Remove moderators from batches first - FIXED: Use updateMany with disconnect for each batch
        for (const modId of moderatorIds) {
          await prisma.batch.updateMany({
            where: { moderators: { some: { id: modId } } },
            data: {
              // You can't directly update relations in updateMany
              // Instead, we need to handle this differently
            },
          });
        }

        // Better approach: Get all batches that have these moderators and update them individually
        const batchesWithModerators = await prisma.batch.findMany({
          where: { moderators: { some: { id: { in: moderatorIds } } } },
          select: { id: true, moderators: { select: { id: true } } },
        });

        // Update each batch to remove the moderators
        for (const batch of batchesWithModerators) {
          const remainingModerators = batch.moderators.filter(
            (m) => !moderatorIds.includes(m.id),
          );

          await prisma.batch.update({
            where: { id: batch.id },
            data: {
              moderators: {
                set: remainingModerators.map((m) => ({ id: m.id })),
              },
            },
          });
        }

        // Delete moderators and users
        await prisma.$transaction([
          prisma.moderator.deleteMany({
            where: { id: { in: moderatorIds } },
          }),
          prisma.user.deleteMany({
            where: { id: { in: userIdsToDelete } },
          }),
        ]);

        return sendResponse({
          success: true,
          message: `${moderatorIds.length} moderators deleted successfully`,
        });

      case "assignBatches":
        const { batchIds } = body;

        if (!batchIds || !Array.isArray(batchIds) || batchIds.length === 0) {
          return sendResponse({
            success: false,
            message: "batchIds array is required for assignBatches action",
            status: 400,
          });
        }

        // Assign batches to moderators - FIXED: Use Promise.all instead of transaction with array of operations
        await Promise.all(
          moderatorIds.map((modId) =>
            prisma.moderator.update({
              where: { id: modId },
              data: {
                batches: {
                  connect: batchIds.map((batchId) => ({ id: batchId })),
                },
              },
            }),
          ),
        );

        return sendResponse({
          success: true,
          message: `Batches assigned to ${moderatorIds.length} moderators successfully`,
        });

      default:
        return sendResponse({
          success: false,
          message: "Invalid action",
          status: 400,
        });
    }
  } catch (error) {
    console.error("Error in bulk moderator operation:", error);
    return sendResponse({
      success: false,
      message: "Internal server error",
      status: 500,
    });
  }
}
