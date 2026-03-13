// src/app/api/students/[id]/progress/route.ts
import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { authenticate } from "@/lib/apiAuthenticator";
import { sendResponse } from "@/lib/sendResponse";

// GET /api/students/[id]/progress - Get student progress
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    // Authenticate - ADMIN, SUPER_ADMIN, or the student themselves
    const auth = await authenticate(req, "ADMIN", "SUPER_ADMIN");

    if (!auth.success && auth.user?.studentId !== params.id) {
      return sendResponse({
        success: false,
        message: "Unauthorized",
        status: 401,
      });
    }

    const { id } = params;

    // Get student progress data
    const [
      quizPerformance,
      examPerformance,
      attendance,
      assignments,
      progressHistory,
    ] = await Promise.all([
      // Quiz performance
      prisma.quizResult.findMany({
        where: { studentId: id },
        include: {
          quiz: {
            select: {
              title: true,
              subject: true,
              difficulty: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
        take: 20,
      }),

      // Exam performance
      prisma.examResult.findMany({
        where: { studentId: id },
        include: {
          exam: {
            select: {
              title: true,
              subject: true,
              type: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
        take: 20,
      }),

      // Attendance stats
      prisma.attendance.aggregate({
        where: { studentId: id },
        _count: true,
        _sum: {
          duration: true,
        },
      }),

      // Assignment completion
      prisma.assignmentSubmission.findMany({
        where: { studentId: id },
        include: {
          assignment: {
            select: {
              title: true,
              totalMarks: true,
            },
          },
        },
        orderBy: { submittedAt: "desc" },
      }),

      // Progress history
      prisma.studentProgress.findMany({
        where: { studentId: id },
        orderBy: { updatedAt: "desc" },
      }),
    ]);

    // Calculate averages
    const avgQuizScore =
      quizPerformance.reduce((acc, curr) => acc + curr.percentage, 0) /
        quizPerformance.length || 0;
    const avgExamScore =
      examPerformance.reduce((acc, curr) => acc + curr.percentage, 0) /
        examPerformance.length || 0;

    // Get subject-wise performance
    const subjectPerformance: Record<string, { total: number; count: number }> =
      {};

    quizPerformance.forEach((result) => {
      const subject = result.quiz.subject || "Unknown";
      if (!subjectPerformance[subject]) {
        subjectPerformance[subject] = { total: 0, count: 0 };
      }
      subjectPerformance[subject].total += result.percentage;
      subjectPerformance[subject].count += 1;
    });

    examPerformance.forEach((result) => {
      const subject = result.exam.subject || "Unknown";
      if (!subjectPerformance[subject]) {
        subjectPerformance[subject] = { total: 0, count: 0 };
      }
      subjectPerformance[subject].total += result.percentage;
      subjectPerformance[subject].count += 1;
    });

    const subjectAverages = Object.entries(subjectPerformance).map(
      ([subject, data]) => ({
        subject,
        average: data.total / data.count,
      }),
    );

    return sendResponse({
      success: true,
      message: "Student progress fetched successfully",
      data: {
        overview: {
          totalQuizzes: quizPerformance.length,
          totalExams: examPerformance.length,
          totalAttendance: attendance._count || 0,
          totalAssignments: assignments.length,
          avgQuizScore: Math.round(avgQuizScore * 10) / 10,
          avgExamScore: Math.round(avgExamScore * 10) / 10,
        },
        quizPerformance,
        examPerformance,
        assignments,
        subjectPerformance: subjectAverages,
        progressHistory,
      },
    });
  } catch (error) {
    console.error("Error fetching student progress:", error);
    return sendResponse({
      success: false,
      message: "Internal server error",
      status: 500,
    });
  }
}
