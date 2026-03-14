// src/app/api/quizzes/stats/route.ts
import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { authenticate } from "@/lib/apiAuthenticator";
import { sendResponse } from "@/lib/sendResponse";

// GET /api/quizzes/stats - Get quiz statistics
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

    // Create a properly typed where condition
    const isTeacher = auth.user?.role === "TEACHER";
    const teacherId = isTeacher ? auth.user.teacherId : undefined;

    const whereCondition: any = {};
    if (teacherId) {
      whereCondition.teacherId = teacherId;
    }

    const [
      totalQuizzes,
      publishedQuizzes,
      draftQuizzes,
      totalAttempts,
      averageScore,
      popularSubjects,
      difficultyDistribution,
    ] = await Promise.all([
      // Total quizzes
      prisma.quiz.count({
        where: whereCondition,
      }),

      // Published quizzes
      prisma.quiz.count({
        where: {
          ...whereCondition,
          status: "PUBLISHED",
        },
      }),

      // Draft quizzes
      prisma.quiz.count({
        where: {
          ...whereCondition,
          status: "DRAFT",
        },
      }),

      // Total attempts
      prisma.quizAttempt.count({
        where: teacherId ? { quiz: { teacherId } } : {},
      }),

      // Average score
      prisma.quizResult.aggregate({
        where: teacherId ? { quiz: { teacherId } } : {},
        _avg: { percentage: true },
      }),

      // Popular subjects
      prisma.quiz.groupBy({
        by: ["subject"],
        where: whereCondition,
        _count: true,
        orderBy: {
          _count: { subject: "desc" },
        },
        take: 5,
      }),

      // Difficulty distribution
      prisma.quiz.groupBy({
        by: ["difficulty"],
        where: whereCondition,
        _count: true,
      }),
    ]);

    return sendResponse({
      success: true,
      message: "Quiz statistics fetched successfully",
      data: {
        total: totalQuizzes,
        published: publishedQuizzes,
        draft: draftQuizzes,
        attempts: totalAttempts,
        averageScore: averageScore._avg?.percentage || 0,
        popularSubjects,
        difficultyDistribution,
        completionRate:
          totalQuizzes > 0
            ? Math.round((publishedQuizzes / totalQuizzes) * 100)
            : 0,
      },
    });
  } catch (error) {
    console.error("Error fetching quiz statistics:", error);
    return sendResponse({
      success: false,
      message: "Internal server error",
      status: 500,
    });
  }
}
