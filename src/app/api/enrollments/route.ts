// src/app/api/enrollments/route.ts
import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { authenticate } from "@/lib/apiAuthenticator";
import { sendResponse } from "@/lib/sendResponse";

// GET /api/enrollments - Get all enrollments with filters
export async function GET(req: NextRequest) {
  try {
    const auth = await authenticate(
      req,
      "ADMIN",
      "SUPER_ADMIN",
      "TEACHER",
      "MODERATOR",
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
    const batchId = searchParams.get("batchId");
    const studentId = searchParams.get("studentId");
    const paymentStatus = searchParams.get("paymentStatus");
    const fromDate = searchParams.get("fromDate");
    const toDate = searchParams.get("toDate");

    const skip = (page - 1) * limit;

    const where: any = {};

    if (status) where.status = status;
    if (batchId) where.batchId = batchId;
    if (studentId) where.studentId = studentId;
    if (paymentStatus) where.paymentStatus = paymentStatus;

    if (fromDate || toDate) {
      where.appliedAt = {};
      if (fromDate) where.appliedAt.gte = new Date(fromDate);
      if (toDate) where.appliedAt.lte = new Date(toDate);
    }

    // If teacher, only show enrollments from their batches
    if (auth.user?.role === "TEACHER") {
      where.batch = { teacherId: auth.user.teacherId };
    }

    const [enrollments, total] = await Promise.all([
      prisma.enrollment.findMany({
        where,
        skip,
        take: limit,
        orderBy: { appliedAt: "desc" },
        include: {
          student: {
            select: {
              id: true,
              name: true,
              profileImage: true,
              class: true,
            },
          },
          batch: {
            select: {
              id: true,
              name: true,
              subject: true,
              mode: true,
              price: true,
            },
          },
          payments: {
            orderBy: { paymentDate: "desc" },
          },
          installments: true,
        },
      }),
      prisma.enrollment.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return sendResponse({
      success: true,
      message: "Enrollments fetched successfully",
      data: enrollments,
      meta: {
        page,
        limit,
        total,
        totalPages,
      },
    });
  } catch (error) {
    console.error("Error fetching enrollments:", error);
    return sendResponse({
      success: false,
      message: "Internal server error",
      status: 500,
    });
  }
}
