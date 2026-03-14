// src/app/api/enrollments/bulk/route.ts
import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { authenticate } from "@/lib/apiAuthenticator";
import { sendResponse } from "@/lib/sendResponse";

// POST /api/enrollments/bulk - Bulk operations on enrollments
export async function POST(req: NextRequest) {
  try {
    const auth = await authenticate(req, "ADMIN", "SUPER_ADMIN");

    if (!auth.success) {
      return sendResponse({
        success: false,
        message: auth.error || "Unauthorized",
        status: auth.status || 401,
      });
    }

    const body = await req.json();
    const { enrollmentIds, action } = body;

    if (
      !enrollmentIds ||
      !Array.isArray(enrollmentIds) ||
      enrollmentIds.length === 0
    ) {
      return sendResponse({
        success: false,
        message: "enrollmentIds array is required",
        status: 400,
      });
    }

    const validActions = ["approve", "reject", "complete", "drop", "delete"];
    if (!action || !validActions.includes(action)) {
      return sendResponse({
        success: false,
        message: `Invalid action. Must be one of: ${validActions.join(", ")}`,
        status: 400,
      });
    }

    let result;

    switch (action) {
      case "approve":
        result = await prisma.enrollment.updateMany({
          where: { id: { in: enrollmentIds } },
          data: {
            status: "APPROVED",
            approvedAt: new Date(),
          },
        });
        break;

      case "reject":
        result = await prisma.enrollment.updateMany({
          where: { id: { in: enrollmentIds } },
          data: {
            status: "REJECTED",
            rejectedAt: new Date(),
            rejectedReason: body.reason,
          },
        });
        break;

      case "complete":
        result = await prisma.enrollment.updateMany({
          where: { id: { in: enrollmentIds } },
          data: {
            status: "COMPLETED",
            completedAt: new Date(),
          },
        });
        break;

      case "drop":
        result = await prisma.enrollment.updateMany({
          where: { id: { in: enrollmentIds } },
          data: {
            status: "DROPPED",
            droppedAt: new Date(),
            droppedReason: body.reason,
          },
        });

        // Update batch enrollment counts
        const enrollments = await prisma.enrollment.findMany({
          where: { id: { in: enrollmentIds } },
          select: { batchId: true },
        });

        for (const enrollment of enrollments) {
          await prisma.batch.update({
            where: { id: enrollment.batchId },
            data: {
              currentEnrollments: { decrement: 1 },
            },
          });
        }
        break;

      case "delete":
        // Get batch IDs before deletion
        const enrollmentsToDelete = await prisma.enrollment.findMany({
          where: { id: { in: enrollmentIds } },
          select: { batchId: true },
        });

        // Delete enrollments and update batch counts
        await prisma.$transaction(async (tx) => {
          await tx.installment.deleteMany({
            where: { enrollmentId: { in: enrollmentIds } },
          });

          await tx.payment.deleteMany({
            where: { enrollmentId: { in: enrollmentIds } },
          });

          await tx.enrollment.deleteMany({
            where: { id: { in: enrollmentIds } },
          });

          for (const enrollment of enrollmentsToDelete) {
            await tx.batch.update({
              where: { id: enrollment.batchId },
              data: {
                currentEnrollments: { decrement: 1 },
              },
            });
          }
        });

        return sendResponse({
          success: true,
          message: `${enrollmentIds.length} enrollments deleted successfully`,
        });
    }

    return sendResponse({
      success: true,
      message: `${result.count} enrollments ${action}d successfully`,
      data: { count: result.count },
    });
  } catch (error) {
    console.error("Error in bulk enrollment operation:", error);
    return sendResponse({
      success: false,
      message: "Internal server error",
      status: 500,
    });
  }
}
