// src/app/api/payments/[id]/refund/route.ts
import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { authenticate } from "@/lib/apiAuthenticator";
import { sendResponse } from "@/lib/sendResponse";

// POST /api/payments/[id]/refund - Refund payment
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

    if (payment.status !== "COMPLETED") {
      return sendResponse({
        success: false,
        message: "Only completed payments can be refunded",
        status: 400,
      });
    }

    const refundAmount = body.amount || payment.amount;

    if (refundAmount > payment.amount) {
      return sendResponse({
        success: false,
        message: "Refund amount cannot exceed payment amount",
        status: 400,
      });
    }

    const refundedPayment = await prisma.$transaction(async (tx) => {
      const updated = await tx.payment.update({
        where: { id },
        data: {
          status: refundAmount === payment.amount ? "REFUNDED" : "PARTIAL",
          refundAmount,
          refundReason: body.reason,
          refundedAt: new Date(),
          refundId: body.refundId,
        },
      });

      await tx.enrollment.update({
        where: { id: payment.enrollmentId },
        data: {
          paidAmount: { decrement: refundAmount },
          dueAmount: payment.enrollment.dueAmount + refundAmount,
          paymentStatus: "PARTIAL",
        },
      });

      return updated;
    });

    return sendResponse({
      success: true,
      message: "Payment refunded successfully",
      data: refundedPayment,
    });
  } catch (error) {
    console.error("Error refunding payment:", error);
    return sendResponse({
      success: false,
      message: "Internal server error",
      status: 500,
    });
  }
}
