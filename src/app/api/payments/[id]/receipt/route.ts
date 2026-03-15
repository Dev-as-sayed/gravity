// src/app/api/payments/[id]/receipt/route.ts
import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { authenticate } from "@/lib/apiAuthenticator";
import { sendResponse } from "@/lib/sendResponse";

// GET /api/payments/[id]/receipt - Get payment receipt
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
        student: true,
        enrollment: {
          include: {
            batch: {
              select: {
                name: true,
                subject: true,
                price: true,
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
        message: "You don't have permission to view this receipt",
        status: 403,
      });
    }

    // Generate receipt data
    const receipt = {
      invoiceNumber: payment.invoiceNumber,
      paymentDate: payment.paymentDate,
      studentName: payment.student.name,
      studentEmail: payment.student.email,
      studentPhone: payment.student.phone,
      studentAddress: payment.student.address,
      batchName: payment.enrollment.batch.name,
      batchSubject: payment.enrollment.batch.subject,
      amount: payment.amount,
      tax: payment.tax || 0,
      totalAmount: payment.totalAmount || payment.amount,
      paidAmount: payment.paidAmount,
      method: payment.method,
      status: payment.status,
      transactionId: payment.transactionId,
      cardLast4: payment.cardLast4,
      cardBrand: payment.cardBrand,
      upiId: payment.upiId,
      bankName: payment.bankName,
    };

    return sendResponse({
      success: true,
      message: "Receipt fetched successfully",
      data: receipt,
    });
  } catch (error) {
    console.error("Error fetching receipt:", error);
    return sendResponse({
      success: false,
      message: "Internal server error",
      status: 500,
    });
  }
}
