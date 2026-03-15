// src/app/api/payments/[id]/route.ts
import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { authenticate } from "@/lib/apiAuthenticator";
import { sendResponse } from "@/lib/sendResponse";

// GET /api/payments/[id] - Get single payment
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    const auth = await authenticate(
      req,
      "ADMIN",
      "SUPER_ADMIN",
      "TEACHER",
      "STUDENT",
    );

    if (!auth.success) {
      return sendResponse({
        success: false,
        message: auth.error || "Unauthorized",
        status: auth.status || 401,
      });
    }

    const payment = await prisma.payment.findUnique({
      where: { id },
      include: {
        student: {
          select: {
            id: true,
            name: true,
            profileImage: true,
            class: true,
          },
        },
        enrollment: {
          include: {
            batch: {
              include: {
                teacher: {
                  select: {
                    id: true,
                    name: true,
                    qualification: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!payment) {
      return sendResponse({
        success: false,
        message: "Payment not found",
        status: 404,
      });
    }

    // Check permissions
    if (
      auth.user?.role === "STUDENT" &&
      payment.studentId !== auth.user.studentId
    ) {
      return sendResponse({
        success: false,
        message: "You don't have permission to view this payment",
        status: 403,
      });
    }

    if (
      auth.user?.role === "TEACHER" &&
      payment.enrollment.batch.teacherId !== auth.user.teacherId
    ) {
      return sendResponse({
        success: false,
        message: "You don't have permission to view this payment",
        status: 403,
      });
    }

    return sendResponse({
      success: true,
      message: "Payment fetched successfully",
      data: payment,
    });
  } catch (error) {
    console.error("Error fetching payment:", error);
    return sendResponse({
      success: false,
      message: "Internal server error",
      status: 500,
    });
  }
}

// PUT /api/payments/[id] - Update payment
export async function PUT(
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

    const existingPayment = await prisma.payment.findUnique({
      where: { id },
      include: { enrollment: true },
    });

    if (!existingPayment) {
      return sendResponse({
        success: false,
        message: "Payment not found",
        status: 404,
      });
    }

    // Calculate old paid amount difference
    const oldPaidAmount = existingPayment.paidAmount;
    const newPaidAmount = body.paidAmount || existingPayment.paidAmount;
    const paidDifference = newPaidAmount - oldPaidAmount;

    const updatedPayment = await prisma.$transaction(async (tx) => {
      const payment = await tx.payment.update({
        where: { id },
        data: {
          amount: body.amount,
          paidAmount: body.paidAmount,
          dueAmount: body.dueAmount,
          tax: body.tax,
          totalAmount: body.totalAmount,
          method: body.method,
          status: body.status,
          transactionId: body.transactionId,
          paymentGateway: body.paymentGateway,
          gatewayResponse: body.gatewayResponse,
          cardLast4: body.cardLast4,
          cardBrand: body.cardBrand,
          upiId: body.upiId,
          bankName: body.bankName,
          manualReference: body.manualReference,
          verifiedBy: body.verifiedBy,
          verifiedAt: body.verifiedAt ? new Date(body.verifiedAt) : null,
          paymentDate: body.paymentDate
            ? new Date(body.paymentDate)
            : undefined,
          dueDate: body.dueDate ? new Date(body.dueDate) : null,
          receiptUrl: body.receiptUrl,
          notes: body.notes,
          metadata: body.metadata,
        },
      });

      // Update enrollment paid amount if payment amount changed
      if (paidDifference !== 0) {
        await tx.enrollment.update({
          where: { id: existingPayment.enrollmentId },
          data: {
            paidAmount: { increment: paidDifference },
            dueAmount:
              existingPayment.enrollment.totalFees -
              (existingPayment.enrollment.paidAmount + paidDifference),
            paymentStatus:
              existingPayment.enrollment.paidAmount + paidDifference >=
              existingPayment.enrollment.totalFees
                ? "COMPLETED"
                : "PARTIAL",
          },
        });
      }

      return payment;
    });

    return sendResponse({
      success: true,
      message: "Payment updated successfully",
      data: updatedPayment,
    });
  } catch (error) {
    console.error("Error updating payment:", error);
    return sendResponse({
      success: false,
      message: "Internal server error",
      status: 500,
    });
  }
}

// DELETE /api/payments/[id] - Delete payment
export async function DELETE(
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

    const existingPayment = await prisma.payment.findUnique({
      where: { id },
      include: { enrollment: true },
    });

    if (!existingPayment) {
      return sendResponse({
        success: false,
        message: "Payment not found",
        status: 404,
      });
    }

    await prisma.$transaction(async (tx) => {
      // Update enrollment paid amount
      await tx.enrollment.update({
        where: { id: existingPayment.enrollmentId },
        data: {
          paidAmount: { decrement: existingPayment.paidAmount },
          dueAmount:
            existingPayment.enrollment.dueAmount + existingPayment.paidAmount,
          paymentStatus: "PARTIAL",
        },
      });

      // Delete payment
      await tx.payment.delete({
        where: { id },
      });
    });

    return sendResponse({
      success: true,
      message: "Payment deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting payment:", error);
    return sendResponse({
      success: false,
      message: "Internal server error",
      status: 500,
    });
  }
}
