// src/app/api/exams/stats/route.ts
import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { authenticate } from "@/lib/apiAuthenticator";
import { sendResponse } from "@/lib/sendResponse";

// GET /api/exams/stats - Get exam statistics
export async function GET(req: NextRequest) {
  try {
    const auth = await authenticate(req, "ADMIN", "SUPER_ADMIN", "TEACHER");

    if (!auth.success) {
      return sendResponse({
        success: false,
        message: auth.error || "Unauthorized",
        status: auth.status || 401,
      });
    }

    const isTeacher = auth.user?.role === "TEACHER";
    const teacherId = isTeacher ? auth.user.teacherId : undefined;

    const whereCondition: any = {};
    if (teacherId) {
      whereCondition.teacherId = teacherId;
    }

    const [
      totalExams,
      upcomingExams,
      ongoingExams,
      completedExams,
      draftExams,
      publishedResults,
      totalStudents,
      averageMarks,
      popularSubjects,
    ] = await Promise.all([
      // Total exams
      prisma.exam.count({ where: whereCondition }),

      // Upcoming exams
      prisma.exam.count({
        where: {
          ...whereCondition,
          examDate: { gt: new Date() },
          status: { not: "DRAFT" },
        },
      }),

      // Ongoing exams
      prisma.exam.count({
        where: {
          ...whereCondition,
          startTime: { lte: new Date() },
          endTime: { gte: new Date() },
          status: { not: "DRAFT" },
        },
      }),

      // Completed exams
      prisma.exam.count({
        where: {
          ...whereCondition,
          endTime: { lt: new Date() },
        },
      }),

      // Draft exams
      prisma.exam.count({
        where: {
          ...whereCondition,
          status: "DRAFT",
        },
      }),

      // Published results
      prisma.exam.count({
        where: {
          ...whereCondition,
          isResultPublished: true,
        },
      }),

      // Total students appeared
      prisma.examResult.count({
        where: teacherId ? { exam: { teacherId } } : {},
      }),

      // Average marks
      prisma.examResult.aggregate({
        where: teacherId ? { exam: { teacherId } } : {},
        _avg: { percentage: true },
      }),

      // Popular subjects
      prisma.exam.groupBy({
        by: ["subject"],
        where: whereCondition,
        _count: true,
        orderBy: {
          _count: { subject: "desc" },
        },
        take: 5,
      }),
    ]);

    return sendResponse({
      success: true,
      message: "Exam statistics fetched successfully",
      data: {
        total: totalExams,
        upcoming: upcomingExams,
        ongoing: ongoingExams,
        completed: completedExams,
        draft: draftExams,
        publishedResults,
        totalStudents,
        averageMarks: averageMarks._avg?.percentage || 0,
        popularSubjects,
        completionRate:
          totalExams > 0 ? Math.round((completedExams / totalExams) * 100) : 0,
      },
    });
  } catch (error) {
    console.error("Error fetching exam statistics:", error);
    return sendResponse({
      success: false,
      message: "Internal server error",
      status: 500,
    });
  }
}
