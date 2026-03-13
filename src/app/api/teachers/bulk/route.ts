// src/app/api/teachers/bulk/route.ts
import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { authenticate } from "@/lib/apiAuthenticator";
import { sendResponse } from "@/lib/sendResponse";

// POST /api/teachers/bulk - Bulk operations on teachers
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
    const { teacherIds, action } = body;

    if (!teacherIds || !Array.isArray(teacherIds) || teacherIds.length === 0) {
      return sendResponse({
        success: false,
        message: "teacherIds array is required",
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

        // Get all teacher user IDs
        const teachers = await prisma.teacher.findMany({
          where: { id: { in: teacherIds } },
          select: { userId: true },
        });

        const userIds = teachers.map((t) => t.userId);

        // Update user active status
        result = await prisma.user.updateMany({
          where: { id: { in: userIds } },
          data: { isActive },
        });

        return sendResponse({
          success: true,
          message: `${result.count} teachers ${action}d successfully`,
          data: { count: result.count },
        });

      case "delete":
        // Check if teachers can be deleted (no courses/batches)
        const teachersWithContent = await prisma.teacher.findMany({
          where: {
            id: { in: teacherIds },
            OR: [{ courses: { some: {} } }, { batches: { some: {} } }],
          },
          select: { id: true, name: true },
        });

        if (teachersWithContent.length > 0) {
          return sendResponse({
            success: false,
            message: "Cannot delete teachers with existing courses or batches",
            data: { teachers: teachersWithContent },
            status: 400,
          });
        }

        // Get all teacher user IDs
        const teachersToDelete = await prisma.teacher.findMany({
          where: { id: { in: teacherIds } },
          select: { userId: true },
        });

        const userIdsToDelete = teachersToDelete.map((t) => t.userId);

        // Delete teachers and users
        await prisma.$transaction([
          prisma.teacher.deleteMany({
            where: { id: { in: teacherIds } },
          }),
          prisma.user.deleteMany({
            where: { id: { in: userIdsToDelete } },
          }),
        ]);

        return sendResponse({
          success: true,
          message: `${teacherIds.length} teachers deleted successfully`,
        });

      default:
        return sendResponse({
          success: false,
          message: "Invalid action",
          status: 400,
        });
    }
  } catch (error) {
    console.error("Error in bulk teacher operation:", error);
    return sendResponse({
      success: false,
      message: "Internal server error",
      status: 500,
    });
  }
}
