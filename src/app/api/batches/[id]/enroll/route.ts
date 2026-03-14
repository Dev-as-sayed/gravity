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
    const auth = await authenticate(
      req,
      "STUDENT",
      "ADMIN",
      "SUPER_ADMIN",
      "TEACHER",
      "MODERATOR",
    );

    if (!auth.success) {
      return sendResponse({
        success: false,
        message: "Authentication required",
        status: 401,
      });
    }

    const { id } = params;
    const body = await req.json();

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

    // Handle different user roles
    let studentId: string | null = null;

    // If user is a student, use their studentId
    if (auth.user?.role === "STUDENT") {
      studentId = auth.user.studentId || null;

      if (!studentId) {
        return sendResponse({
          success: false,
          message: "Student profile not found",
          status: 400,
        });
      }

      // For students, check if batch is open for enrollment
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
    }
    // For admins, teachers, moderators - they need to provide a studentId
    else if (
      ["ADMIN", "SUPER_ADMIN", "TEACHER", "MODERATOR"].includes(
        auth.user?.role || "",
      )
    ) {
      studentId = body.studentId;

      if (!studentId) {
        return sendResponse({
          success: false,
          message: "studentId is required in request body",
          status: 400,
        });
      }

      // Verify that the student exists
      const student = await prisma.student.findUnique({
        where: { id: studentId },
      });

      if (!student) {
        return sendResponse({
          success: false,
          message: "Student not found",
          status: 404,
        });
      }

      // Optional: Allow admins to override enrollment rules
      if (body.forceEnroll !== true) {
        if (!batch.enrollmentOpen || !batch.isActive) {
          return sendResponse({
            success: false,
            message: "Batch is not open for enrollment",
            status: 400,
          });
        }

        if (
          batch.maxStudents &&
          batch.currentEnrollments >= batch.maxStudents
        ) {
          return sendResponse({
            success: false,
            message: "Batch is full",
            status: 400,
          });
        }
      }
    } else {
      return sendResponse({
        success: false,
        message: "Invalid user role for enrollment",
        status: 403,
      });
    }

    // Check if already enrolled
    const existingEnrollment = await prisma.enrollment.findUnique({
      where: {
        studentId_batchId: {
          studentId: studentId,
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
          studentId: studentId,
          batchId: id,
          status: body.autoApprove ? "APPROVED" : "PENDING",
          totalFees: batch.price,
          paidAmount: body.initialPayment || 0,
          dueAmount: batch.price - (body.initialPayment || 0),
          metadata: {
            ...body.metadata,
            enrolledBy: auth.user?.id,
            enrolledByRole: auth.user?.role,
            forceEnroll: body.forceEnroll || false,
          },
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
