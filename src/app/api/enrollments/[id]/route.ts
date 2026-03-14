// src/app/api/enrollments/[id]/route.ts
import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { authenticate } from "@/lib/apiAuthenticator";
import { sendResponse } from "@/lib/sendResponse";

// GET /api/enrollments/[id]/progress - Get enrollment progress
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
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

    // Await the params before using
    const { id } = await params;

    const enrollment = await prisma.enrollment.findUnique({
      where: { id },
      include: {
        student: {
          select: {
            id: true,
            name: true,
          },
        },
        batch: {
          select: {
            id: true,
            name: true,
            totalClasses: true,
          },
        },
      },
    });

    if (!enrollment) {
      return sendResponse({
        success: false,
        message: "Enrollment not found",
        status: 404,
      });
    }

    // Get attendance for this student in this batch
    const attendance = await prisma.attendance.findMany({
      where: {
        studentId: enrollment.studentId,
        batchId: enrollment.batchId,
      },
      orderBy: { date: "desc" },
    });

    // Get quiz results
    const quizResults = await prisma.quizResult.findMany({
      where: { studentId: enrollment.studentId },
      include: {
        quiz: {
          select: {
            title: true,
            subject: true,
            totalMarks: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 10,
    });

    // Get exam results
    const examResults = await prisma.examResult.findMany({
      where: { studentId: enrollment.studentId },
      include: {
        exam: {
          select: {
            title: true,
            subject: true,
            fullMarks: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 10,
    });

    // Calculate progress metrics
    const attendedClasses = attendance.filter(
      (a) => a.status === "PRESENT",
    ).length;
    const totalClasses = enrollment.batch.totalClasses || 0;
    const attendancePercentage =
      totalClasses > 0 ? Math.round((attendedClasses / totalClasses) * 100) : 0;

    const avgQuizScore =
      quizResults.length > 0
        ? quizResults.reduce((sum, r) => sum + r.percentage, 0) /
          quizResults.length
        : 0;

    const avgExamScore =
      examResults.length > 0
        ? examResults.reduce((sum, r) => sum + r.percentage, 0) /
          examResults.length
        : 0;

    return sendResponse({
      success: true,
      message: "Enrollment progress fetched successfully",
      data: {
        enrollment: {
          id: enrollment.id,
          status: enrollment.status,
          progressPercentage: enrollment.progressPercentage,
          classesAttended: enrollment.classesAttended,
          totalClasses: enrollment.totalClasses,
          assignmentsDone: enrollment.assignmentsDone,
          averageScore: enrollment.averageScore,
        },
        metrics: {
          attendance: {
            total: attendance.length,
            present: attendedClasses,
            percentage: attendancePercentage,
            history: attendance,
          },
          quizzes: {
            total: quizResults.length,
            averageScore: avgQuizScore,
            results: quizResults,
          },
          exams: {
            total: examResults.length,
            averageScore: avgExamScore,
            results: examResults,
          },
        },
        summary: {
          attendancePercentage,
          quizAverage: avgQuizScore,
          examAverage: avgExamScore,
          overallProgress: enrollment.progressPercentage,
        },
      },
    });
  } catch (error) {
    console.error("Error fetching enrollment progress:", error);
    return sendResponse({
      success: false,
      message: "Internal server error",
      status: 500,
    });
  }
}

// PUT /api/enrollments/[id] - Update enrollment
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  console.log("hit enrollment api ");
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
    const body = await req.json();

    const existingEnrollment = await prisma.enrollment.findUnique({
      where: { id },
    });

    if (!existingEnrollment) {
      return sendResponse({
        success: false,
        message: "Enrollment not found",
        status: 404,
      });
    }

    // Helper function to convert string to number or keep as is
    const toNumber = (value: any): number | undefined => {
      if (value === undefined || value === null) return undefined;
      if (typeof value === "string") {
        const num = parseFloat(value);
        return isNaN(num) ? undefined : num;
      }
      return value;
    };

    // Prepare update data with proper type conversions
    const updateData: any = {
      status: body.status,
      paymentStatus: body.paymentStatus,
      totalFees: toNumber(body.totalFees),
      paidAmount: toNumber(body.paidAmount),
      dueAmount: toNumber(body.dueAmount),
      progressPercentage: toNumber(body.progressPercentage),
      classesAttended: toNumber(body.classesAttended),
      totalClasses: toNumber(body.totalClasses),
      assignmentsDone: toNumber(body.assignmentsDone),
      averageScore: toNumber(body.averageScore),
    };

    // Only include optional fields if they exist
    if (body.couponCode !== undefined) updateData.couponCode = body.couponCode;
    if (body.discountAmount !== undefined)
      updateData.discountAmount = toNumber(body.discountAmount);
    if (body.scholarshipAmount !== undefined)
      updateData.scholarshipAmount = toNumber(body.scholarshipAmount);
    if (body.scholarshipReason !== undefined)
      updateData.scholarshipReason = body.scholarshipReason;
    if (body.installmentPlan !== undefined)
      updateData.installmentPlan = body.installmentPlan;
    if (body.metadata !== undefined) updateData.metadata = body.metadata;

    // Add timestamps based on status
    if (body.status === "APPROVED") {
      updateData.approvedAt = new Date();
    } else if (body.status === "REJECTED") {
      updateData.rejectedAt = new Date();
      if (body.rejectedReason) updateData.rejectedReason = body.rejectedReason;
    } else if (body.status === "COMPLETED") {
      updateData.completedAt = new Date();
    } else if (body.status === "DROPPED") {
      updateData.droppedAt = new Date();
      if (body.droppedReason) updateData.droppedReason = body.droppedReason;
    }

    const updatedEnrollment = await prisma.enrollment.update({
      where: { id },
      data: updateData,
      include: {
        student: true,
        batch: true,
      },
    });

    return sendResponse({
      success: true,
      message: "Enrollment updated successfully",
      data: updatedEnrollment,
    });
  } catch (error) {
    console.error("Error updating enrollment:", error);
    return sendResponse({
      success: false,
      message: "Internal server error",
      status: 500,
    });
  }
}

// DELETE /api/enrollments/[id] - Delete enrollment
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const auth = await authenticate(req, "ADMIN", "SUPER_ADMIN");

    if (!auth.success) {
      return sendResponse({
        success: false,
        message: auth.error || "Unauthorized",
        status: auth.status || 401,
      });
    }

    const { id } = params;

    const enrollment = await prisma.enrollment.findUnique({
      where: { id },
      include: {
        payments: true,
        installments: true,
      },
    });

    if (!enrollment) {
      return sendResponse({
        success: false,
        message: "Enrollment not found",
        status: 404,
      });
    }

    // Delete enrollment and related records
    await prisma.$transaction(async (tx) => {
      // Delete related installments
      await tx.installment.deleteMany({
        where: { enrollmentId: id },
      });

      // Delete related payments
      await tx.payment.deleteMany({
        where: { enrollmentId: id },
      });

      // Update batch enrollment count
      await tx.batch.update({
        where: { id: enrollment.batchId },
        data: {
          currentEnrollments: { decrement: 1 },
        },
      });

      // Delete enrollment
      await tx.enrollment.delete({
        where: { id },
      });
    });

    return sendResponse({
      success: true,
      message: "Enrollment deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting enrollment:", error);
    return sendResponse({
      success: false,
      message: "Internal server error",
      status: 500,
    });
  }
}

// PATCH /api/enrollments/[id]/status - Update enrollment status
export async function PATCH(
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
    const body = await req.json();

    const enrollment = await prisma.enrollment.findUnique({
      where: { id },
    });

    if (!enrollment) {
      return sendResponse({
        success: false,
        message: "Enrollment not found",
        status: 404,
      });
    }

    const updateData: any = {
      status: body.status,
    };

    // Set timestamps based on status
    switch (body.status) {
      case "APPROVED":
        updateData.approvedAt = new Date();
        break;
      case "REJECTED":
        updateData.rejectedAt = new Date();
        updateData.rejectedReason = body.reason;
        break;
      case "COMPLETED":
        updateData.completedAt = new Date();
        break;
      case "DROPPED":
        updateData.droppedAt = new Date();
        updateData.droppedReason = body.reason;
        break;
    }

    const updatedEnrollment = await prisma.enrollment.update({
      where: { id },
      data: updateData,
    });

    return sendResponse({
      success: true,
      message: `Enrollment status updated to ${body.status}`,
      data: updatedEnrollment,
    });
  } catch (error) {
    console.error("Error updating enrollment status:", error);
    return sendResponse({
      success: false,
      message: "Internal server error",
      status: 500,
    });
  }
}
