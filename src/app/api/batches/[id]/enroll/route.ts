// src/app/api/batches/[id]/enroll/route.ts
import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { authenticate } from "@/lib/apiAuthenticator";
import { sendResponse } from "@/lib/sendResponse";

// POST /api/batches/[id]/enroll - Enroll in a batch
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const auth = await authenticate(req, "STUDENT");

    if (!auth.success || !auth.user?.studentId) {
      return sendResponse({
        success: false,
        message: "Only students can enroll",
        status: 401,
      });
    }

    const { id } = params;
    const body = await req.json();

    // Check if batch exists and is open for enrollment
    const batch = await prisma.batch.findUnique({
      where: { id },
    });

    if (!batch) {
      return sendResponse({
        success: false,
        message: "Batch not found",
        status: 404,
      });
    }

    if (!batch.enrollmentOpen || !batch.isActive) {
      return sendResponse({
        success: false,
        message: "Batch is not open for enrollment",
        status: 400,
      });
    }

    if (batch.maxStudents && batch.currentEnrollments >= batch.maxStudents) {
      return sendResponse({
        success: false,
        message: "Batch is full",
        status: 400,
      });
    }

    // Check if already enrolled
    const existingEnrollment = await prisma.enrollment.findUnique({
      where: {
        studentId_batchId: {
          studentId: auth.user.studentId,
          batchId: id,
        },
      },
    });

    if (existingEnrollment) {
      return sendResponse({
        success: false,
        message: "Already enrolled in this batch",
        status: 400,
      });
    }

    // Create enrollment
    const enrollment = await prisma.$transaction(async (tx) => {
      const enrollment = await tx.enrollment.create({
        data: {
          studentId: !auth.user.studentId,
          batchId: id,
          status: body.autoApprove ? "APPROVED" : "PENDING",
          totalFees: batch.price,
          paidAmount: 0,
          dueAmount: batch.price,
          metadata: body.metadata,
        },
      });

      await tx.batch.update({
        where: { id },
        data: {
          currentEnrollments: { increment: 1 },
        },
      });

      return enrollment;
    });

    return sendResponse({
      success: true,
      message: "Enrollment successful",
      data: enrollment,
      status: 201,
    });
  } catch (error) {
    console.error("Error enrolling in batch:", error);
    return sendResponse({
      success: false,
      message: "Internal server error",
      status: 500,
    });
  }
}

// GET /api/batches/[id]/enrollments - Get batch enrollments
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const auth = await authenticate(req, "ADMIN", "SUPER_ADMIN", "TEACHER");

    if (!auth.success) {
      return sendResponse({
        success: false,
        message: auth.error || "Unauthorized",
        status: auth.status || 401,
      });
    }

    const { id } = params;

    // Check if batch exists
    const batch = await prisma.batch.findUnique({
      where: { id },
    });

    if (!batch) {
      return sendResponse({
        success: false,
        message: "Batch not found",
        status: 404,
      });
    }

    // Check permission if user is teacher
    if (
      auth.user?.role === "TEACHER" &&
      batch.teacherId !== auth.user.teacherId
    ) {
      return sendResponse({
        success: false,
        message: "You don't have permission to view enrollments",
        status: 403,
      });
    }

    // Get enrollments
    const enrollments = await prisma.enrollment.findMany({
      where: { batchId: id },
      include: {
        student: {
          select: {
            id: true,
            name: true,
            profileImage: true,
          },
        },
        payments: true,
      },
      orderBy: { appliedAt: "desc" },
    });

    return sendResponse({
      success: true,
      message: "Enrollments fetched successfully",
      data: enrollments,
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
