// src/app/api/guardians/bulk/route.ts
import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { authenticate } from "@/lib/apiAuthenticator";
import { sendResponse } from "@/lib/sendResponse";

// POST /api/guardians/bulk - Bulk operations on guardians
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
    const { guardianIds, action } = body;

    if (
      !guardianIds ||
      !Array.isArray(guardianIds) ||
      guardianIds.length === 0
    ) {
      return sendResponse({
        success: false,
        message: "guardianIds array is required",
        status: 400,
      });
    }

    if (!action || !["activate", "deactivate", "delete"].includes(action)) {
      return sendResponse({
        success: false,
        message:
          "Invalid action. Must be 'activate', 'deactivate', or 'delete'",
        status: 400,
      });
    }

    let result;

    switch (action) {
      case "activate":
      case "deactivate":
        const isActive = action === "activate";

        // Get all guardian user IDs
        const guardians = await prisma.guardian.findMany({
          where: { id: { in: guardianIds } },
          select: { userId: true },
        });

        const userIds = guardians.map((g) => g.userId);

        // Update user active status
        result = await prisma.user.updateMany({
          where: { id: { in: userIds } },
          data: { isActive },
        });

        return sendResponse({
          success: true,
          message: `${result.count} guardians ${action}d successfully`,
          data: { count: result.count },
        });

      case "delete":
        // Check if guardians can be deleted (no students)
        const guardiansWithStudents = await prisma.guardian.findMany({
          where: {
            id: { in: guardianIds },
            students: { some: {} },
          },
          select: { id: true, name: true },
        });

        if (guardiansWithStudents.length > 0) {
          return sendResponse({
            success: false,
            message: "Cannot delete guardians with associated students",
            data: { guardians: guardiansWithStudents },
            status: 400,
          });
        }

        // Get all guardian user IDs
        const guardiansToDelete = await prisma.guardian.findMany({
          where: { id: { in: guardianIds } },
          select: { userId: true },
        });

        const userIdsToDelete = guardiansToDelete.map((g) => g.userId);

        // Delete guardians and users
        await prisma.$transaction([
          prisma.guardian.deleteMany({
            where: { id: { in: guardianIds } },
          }),
          prisma.user.deleteMany({
            where: { id: { in: userIdsToDelete } },
          }),
        ]);

        return sendResponse({
          success: true,
          message: `${guardianIds.length} guardians deleted successfully`,
        });

      default:
        return sendResponse({
          success: false,
          message: "Invalid action",
          status: 400,
        });
    }
  } catch (error) {
    console.error("Error in bulk guardian operation:", error);
    return sendResponse({
      success: false,
      message: "Internal server error",
      status: 500,
    });
  }
}
