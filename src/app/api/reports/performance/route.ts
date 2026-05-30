// src/app/api/reports/performance/route.ts
import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { authenticate } from "@/lib/apiAuthenticator";
import { sendResponse } from "@/lib/sendResponse";

// GET /api/reports/performance - Performance report
export async function GET(req: NextRequest) {
  try {
    const auth = await authenticate(req, "TEACHER", "MODERATOR");

    if (!auth.success) {
      return sendResponse({
        success: false,
        message: auth.error || "Unauthorized",
        status: auth.status || 401,
      });
    }

    const { searchParams } = new URL(req.url);
    const studentId = searchParams.get("studentId");
    const batchId = searchParams.get("batchId");
    const examId = searchParams.get("examId");
    const fromDate = searchParams.get("fromDate");
    const toDate = searchParams.get("toDate");

    const examWhere: any = {};
    const quizWhere: any = {};

    if (studentId) {
      examWhere.studentId = studentId;
      quizWhere.studentId = studentId;
    }
    if (examId) examWhere.examId = examId;
    if (batchId) {
      examWhere.exam = { batchId };
      quizWhere.quiz = { batchId };
    }

    if (fromDate || toDate) {
      examWhere.createdAt = {};
      quizWhere.createdAt = {};
      if (fromDate) {
        examWhere.createdAt.gte = new Date(fromDate);
        quizWhere.createdAt.gte = new Date(fromDate);
      }
      if (toDate) {
        examWhere.createdAt.lte = new Date(toDate);
        quizWhere.createdAt.lte = new Date(toDate);
      }
    }

    if (auth.user?.role === "TEACHER" && auth.user.teacherId) {
      examWhere.exam = { ...examWhere.exam, teacherId: auth.user.teacherId };
      quizWhere.quiz = { ...quizWhere.quiz, teacherId: auth.user.teacherId };
    }

    const [examResults, quizResults] = await Promise.all([
      prisma.examResult.findMany({
        where: examWhere,
        orderBy: { createdAt: "desc" },
        include: {
          exam: { select: { id: true, title: true, fullMarks: true } },
          student: { select: { id: true, name: true, class: true } },
        },
      }),
      prisma.quizResult.findMany({
        where: quizWhere,
        orderBy: { createdAt: "desc" },
        include: {
          quiz: { select: { id: true, title: true } },
          student: { select: { id: true, name: true, class: true } },
        },
      }),
    ]);

    const examStats = examResults.length > 0
      ? {
          total: examResults.length,
          averagePercentage:
            examResults.reduce((sum, r) => sum + r.percentage, 0) /
            examResults.length,
          highestPercentage: Math.max(...examResults.map((r) => r.percentage)),
          lowestPercentage: Math.min(...examResults.map((r) => r.percentage)),
        }
      : null;

    const quizAvg = quizResults.length > 0
      ? quizResults.reduce((sum, r) => {
          const score = r.totalMarks > 0
            ? (r.obtainedMarks / r.totalMarks) * 100
            : 0;
          return sum + score;
        }, 0) / quizResults.length
      : 0;

    return sendResponse({
      success: true,
      message: "Performance report fetched successfully",
      data: {
        examResults,
        quizResults,
        summary: {
          exams: examStats,
          quizzes: {
            total: quizResults.length,
            averagePercentage: Math.round(quizAvg * 100) / 100,
          },
          totalAssessments: examResults.length + quizResults.length,
        },
      },
    });
  } catch (error) {
    console.error("Error fetching performance report:", error);
    return sendResponse({
      success: false,
      message: "Internal server error",
      status: 500,
    });
  }
}
