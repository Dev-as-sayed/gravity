// src/app/api/students/bulk/route.ts
import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { authenticate } from "@/lib/apiAuthenticator";
import { sendResponse } from "@/lib/sendResponse";

// POST /api/students/bulk - Bulk operations on students
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
    const { studentIds, action } = body;

    if (!studentIds || !Array.isArray(studentIds) || studentIds.length === 0) {
      return sendResponse({
        success: false,
        message: "studentIds array is required",
        status: 400,
      });
    }

    if (
      !action ||
      !["activate", "deactivate", "delete", "assignGuardian"].includes(action)
    ) {
      return sendResponse({
        success: false,
        message:
          "Invalid action. Must be 'activate', 'deactivate', 'delete', or 'assignGuardian'",
        status: 400,
      });
    }

    let result;

    switch (action) {
      case "activate":
      case "deactivate":
        const isActive = action === "activate";

        // Get all student user IDs
        const students = await prisma.student.findMany({
          where: { id: { in: studentIds } },
          select: { userId: true },
        });

        const userIds = students.map((s) => s.userId);

        // Update user active status
        result = await prisma.user.updateMany({
          where: { id: { in: userIds } },
          data: { isActive },
        });

        return sendResponse({
          success: true,
          message: `${result.count} students ${action}d successfully`,
          data: { count: result.count },
        });

      case "delete":
        // Check if students can be deleted (no enrollments/payments)
        const studentsWithRecords = await prisma.student.findMany({
          where: {
            id: { in: studentIds },
            OR: [{ enrollments: { some: {} } }, { payments: { some: {} } }],
          },
          select: { id: true, name: true },
        });

        if (studentsWithRecords.length > 0) {
          return sendResponse({
            success: false,
            message:
              "Cannot delete students with existing enrollments or payments",
            data: { students: studentsWithRecords },
            status: 400,
          });
        }

        // Get all student user IDs
        const studentsToDelete = await prisma.student.findMany({
          where: { id: { in: studentIds } },
          select: { userId: true },
        });

        const userIdsToDelete = studentsToDelete.map((s) => s.userId);

        // Delete students and users
        await prisma.$transaction([
          prisma.student.deleteMany({
            where: { id: { in: studentIds } },
          }),
          prisma.user.deleteMany({
            where: { id: { in: userIdsToDelete } },
          }),
        ]);

        return sendResponse({
          success: true,
          message: `${studentIds.length} students deleted successfully`,
        });

      case "assignGuardian":
        const { guardianId } = body;

        if (!guardianId) {
          return sendResponse({
            success: false,
            message: "guardianId is required for assignGuardian action",
            status: 400,
          });
        }

        // Check if guardian exists
        const guardian = await prisma.guardian.findUnique({
          where: { id: guardianId },
        });

        if (!guardian) {
          return sendResponse({
            success: false,
            message: "Guardian not found",
            status: 400,
          });
        }

        // Assign guardian to students
        result = await prisma.student.updateMany({
          where: { id: { in: studentIds } },
          data: { guardianId },
        });

        return sendResponse({
          success: true,
          message: `Guardian assigned to ${result.count} students successfully`,
          data: { count: result.count },
        });

      default:
        return sendResponse({
          success: false,
          message: "Invalid action",
          status: 400,
        });
    }
  } catch (error) {
    console.error("Error in bulk student operation:", error);
    return sendResponse({
      success: false,
      message: "Internal server error",
      status: 500,
    });
  }
}
