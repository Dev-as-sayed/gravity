import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { authenticate } from "@/lib/apiAuthenticator";
import { sendResponse } from "@/lib/sendResponse";

// GET /api/quizzes/[id]/analytics - Get quiz analytics
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    const auth = await authenticate(req, "ADMIN", "SUPER_ADMIN", "TEACHER");

    if (!auth.success) {
      return sendResponse({
        success: false,
        message: auth.error || "Unauthorized",
        status: auth.status || 401,
      });
    }

    const [
      totalAttempts,
      averageScore,
      passRate,
      questionAnalysis,
      timeAnalysis,
    ] = await Promise.all([
      // Total attempts
      prisma.quizAttempt.count({
        where: { quizId: id, isCompleted: true },
      }),

      // Average score
      prisma.quizResult.aggregate({
        where: { quizId: id },
        _avg: { percentage: true },
      }),

      // Pass rate
      prisma.quizResult.count({
        where: {
          quizId: id,
          attempt: {
            isPassed: true,
          },
        },
      }),

      // Question-wise analysis
      prisma.$queryRaw`
        SELECT 
          q.id,
          q.text,
          COUNT(qa.id) as attempt_count,
          AVG(CASE WHEN qa.answers->q.id->>'correct' = 'true' THEN 1 ELSE 0 END) as correct_rate
        FROM "Question" q
        LEFT JOIN "QuizAttempt" qa ON q.quizId = qa."quizId"
        WHERE q."quizId" = ${id}
        GROUP BY q.id, q.text
      `,

      // Time analysis
      prisma.$queryRaw`
        SELECT 
          AVG(EXTRACT(EPOCH FROM (qa."endTime" - qa."startTime"))) as avg_time_seconds,
          MIN(EXTRACT(EPOCH FROM (qa."endTime" - qa."startTime"))) as min_time_seconds,
          MAX(EXTRACT(EPOCH FROM (qa."endTime" - qa."startTime"))) as max_time_seconds
        FROM "QuizAttempt" qa
        WHERE qa."quizId" = ${id} AND qa."isCompleted" = true
      `,
    ]);

    return sendResponse({
      success: true,
      message: "Quiz analytics fetched successfully",
      data: {
        totalAttempts,
        averageScore: averageScore._avg?.percentage || 0,
        passRate: totalAttempts > 0 ? (passRate / totalAttempts) * 100 : 0,
        questionAnalysis,
        timeAnalysis: timeAnalysis[0],
      },
    });
  } catch (error) {
    console.error("Error fetching quiz analytics:", error);
    return sendResponse({
      success: false,
      message: "Internal server error",
      status: 500,
    });
  }
}
