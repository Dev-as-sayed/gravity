// src/app/api/enrollments/[id]/progress/route.ts
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

// PATCH /api/enrollments/[id]/progress - Update enrollment progress
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

    const updatedEnrollment = await prisma.enrollment.update({
      where: { id },
      data: {
        progressPercentage: body.progressPercentage,
        classesAttended: body.classesAttended,
        totalClasses: body.totalClasses,
        assignmentsDone: body.assignmentsDone,
        averageScore: body.averageScore,
      },
    });

    return sendResponse({
      success: true,
      message: "Progress updated successfully",
      data: updatedEnrollment,
    });
  } catch (error) {
    console.error("Error updating progress:", error);
    return sendResponse({
      success: false,
      message: "Internal server error",
      status: 500,
    });
  }
}
