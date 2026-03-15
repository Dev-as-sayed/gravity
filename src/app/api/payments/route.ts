// src/app/api/payments/route.ts
import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { authenticate } from "@/lib/apiAuthenticator";
import { sendResponse } from "@/lib/sendResponse";

// GET /api/payments - Get all payments with filters
export async function GET(req: NextRequest) {
  try {
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

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const status = searchParams.get("status");
    const method = searchParams.get("method");
    const studentId = searchParams.get("studentId");
    const enrollmentId = searchParams.get("enrollmentId");
    const fromDate = searchParams.get("fromDate");
    const toDate = searchParams.get("toDate");
    const minAmount = searchParams.get("minAmount");
    const maxAmount = searchParams.get("maxAmount");
    const transactionId = searchParams.get("transactionId");

    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {};

    if (status) where.status = status;
    if (method) where.method = method;
    if (studentId) where.studentId = studentId;
    if (enrollmentId) where.enrollmentId = enrollmentId;
    if (transactionId) where.transactionId = transactionId;

    if (fromDate || toDate) {
      where.paymentDate = {};
      if (fromDate) where.paymentDate.gte = new Date(fromDate);
      if (toDate) where.paymentDate.lte = new Date(toDate);
    }

    if (minAmount || maxAmount) {
      where.amount = {};
      if (minAmount) where.amount.gte = parseFloat(minAmount);
      if (maxAmount) where.amount.lte = parseFloat(maxAmount);
    }

    // If user is student, only show their payments
    if (auth.user?.role === "STUDENT" && auth.user.studentId) {
      where.studentId = auth.user.studentId;
    }

    // If user is teacher, only show payments from their batches
    if (auth.user?.role === "TEACHER" && auth.user.teacherId) {
      where.enrollment = {
        batch: {
          teacherId: auth.user.teacherId,
        },
      };
    }

    const [payments, total] = await Promise.all([
      prisma.payment.findMany({
        where,
        skip,
        take: limit,
        orderBy: { paymentDate: "desc" },
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
            select: {
              id: true,
              batchId: true,
              batch: {
                select: {
                  id: true,
                  name: true,
                  subject: true,
                },
              },
              totalFees: true,
              paidAmount: true,
              dueAmount: true,
            },
          },
        },
      }),
      prisma.payment.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return sendResponse({
      success: true,
      message: "Payments fetched successfully",
      data: payments,
      meta: {
        page,
        limit,
        total,
        totalPages,
      },
    });
  } catch (error) {
    console.error("Error fetching payments:", error);
    return sendResponse({
      success: false,
      message: "Internal server error",
      status: 500,
    });
  }
}

// POST /api/payments - Create a new payment
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

    // Validate required fields
    if (!body.enrollmentId || !body.studentId || !body.amount || !body.method) {
      return sendResponse({
        success: false,
        message:
          "Missing required fields: enrollmentId, studentId, amount, method",
        status: 400,
      });
    }

    // Check if enrollment exists
    const enrollment = await prisma.enrollment.findUnique({
      where: { id: body.enrollmentId },
      include: { batch: true },
    });

    if (!enrollment) {
      return sendResponse({
        success: false,
        message: "Enrollment not found",
        status: 404,
      });
    }

    // Generate invoice number
    const invoiceNumber = `INV-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    // Calculate total with tax
    const tax = body.tax || 0;
    const totalAmount = body.amount + tax;

    // Create payment
    const payment = await prisma.payment.create({
      data: {
        enrollmentId: body.enrollmentId,
        studentId: body.studentId,
        amount: body.amount,
        paidAmount: body.paidAmount || body.amount,
        dueAmount: body.dueAmount,
        tax,
        totalAmount,
        method: body.method,
        status: body.status || "PENDING",
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
        paymentDate: body.paymentDate ? new Date(body.paymentDate) : new Date(),
        dueDate: body.dueDate ? new Date(body.dueDate) : null,
        receiptUrl: body.receiptUrl,
        invoiceNumber,
        notes: body.notes,
        metadata: body.metadata,
      },
      include: {
        student: {
          select: {
            id: true,
            name: true,
          },
        },
        enrollment: {
          select: {
            id: true,
            batch: {
              select: {
                name: true,
              },
            },
          },
        },
      },
    });

    // Update enrollment paid amount
    await prisma.enrollment.update({
      where: { id: body.enrollmentId },
      data: {
        paidAmount: { increment: body.paidAmount || body.amount },
        dueAmount:
          enrollment.totalFees -
          (enrollment.paidAmount + (body.paidAmount || body.amount)),
        paymentStatus:
          enrollment.paidAmount + (body.paidAmount || body.amount) >=
          enrollment.totalFees
            ? "COMPLETED"
            : "PARTIAL",
      },
    });

    return sendResponse({
      success: true,
      message: "Payment created successfully",
      data: payment,
      status: 201,
    });
  } catch (error) {
    console.error("Error creating payment:", error);
    return sendResponse({
      success: false,
      message: "Internal server error",
      status: 500,
    });
  }
}
