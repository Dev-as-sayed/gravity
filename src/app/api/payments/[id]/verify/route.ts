// src/app/api/payments/[id]/verify/route.ts
import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { authenticate } from "@/lib/apiAuthenticator";
import { sendResponse } from "@/lib/sendResponse";

// POST /api/payments/[id]/verify - Verify manual payment
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    const auth = await authenticate(req, "ADMIN", "SUPER_ADMIN");

    if (!auth.success) {
      return sendResponse({
        success: false,
        message: auth.error || "Unauthorized",
        status: auth.status || 401,
      });
    }

    const body = await req.json();

    const payment = await prisma.payment.findUnique({
      where: { id },
      include: { enrollment: true },
    });

    if (!payment) {
      return sendResponse({
        success: false,
        message: "Payment not found",
        status: 404,
      });
    }

    if (payment.status !== "PENDING") {
      return sendResponse({
        success: false,
        message: "Payment is already processed",
        status: 400,
      });
    }

    const verifiedPayment = await prisma.$transaction(async (tx) => {
      const updated = await tx.payment.update({
        where: { id },
        data: {
          status: body.approve ? "COMPLETED" : "FAILED",
          verifiedBy: auth.user.id,
          verifiedAt: new Date(),
          notes: body.notes,
        },
      });

      if (body.approve) {
        await tx.enrollment.update({
          where: { id: payment.enrollmentId },
          data: {
            paidAmount: { increment: payment.paidAmount },
            dueAmount: payment.enrollment.dueAmount - payment.paidAmount,
            paymentStatus:
              payment.enrollment.paidAmount + payment.paidAmount >=
              payment.enrollment.totalFees
                ? "COMPLETED"
                : "PARTIAL",
          },
        });
      }

      return updated;
    });

    return sendResponse({
      success: true,
      message: body.approve
        ? "Payment verified successfully"
        : "Payment rejected",
      data: verifiedPayment,
    });
  } catch (error) {
    console.error("Error verifying payment:", error);
    return sendResponse({
      success: false,
      message: "Internal server error",
      status: 500,
    });
  }
}
