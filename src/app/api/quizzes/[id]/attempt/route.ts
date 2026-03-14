// src/app/api/quizzes/[id]/attempt/route.ts
import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { authenticate } from "@/lib/apiAuthenticator";
import { sendResponse } from "@/lib/sendResponse";

// GET /api/quizzes/[id]/attempt - Get student's attempts for a quiz
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    const auth = await authenticate(req, "STUDENT");

    if (!auth.success || !auth.user?.studentId) {
      return sendResponse({
        success: false,
        message: "Only students can view attempts",
        status: 401,
      });
    }

    const attempts = await prisma.quizAttempt.findMany({
      where: {
        quizId: id,
        studentId: auth.user.studentId,
      },
      orderBy: { createdAt: "desc" },
      include: {
        quizResult: true,
      },
    });

    return sendResponse({
      success: true,
      message: "Attempts fetched successfully",
      data: attempts,
    });
  } catch (error) {
    console.error("Error fetching attempts:", error);
    return sendResponse({
      success: false,
      message: "Internal server error",
      status: 500,
    });
  }
}

// POST /api/quizzes/[id]/attempt - Start a new quiz attempt
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    const auth = await authenticate(req, "STUDENT");

    if (!auth.success || !auth.user?.studentId) {
      return sendResponse({
        success: false,
        message: "Only students can attempt quizzes",
        status: 401,
      });
    }

    const quiz = await prisma.quiz.findUnique({
      where: { id },
      include: {
        questions: true,
      },
    });

    if (!quiz) {
      return sendResponse({
        success: false,
        message: "Quiz not found",
        status: 404,
      });
    }

    // Check if quiz is available
    if (quiz.status !== "PUBLISHED") {
      return sendResponse({
        success: false,
        message: "This quiz is not available",
        status: 400,
      });
    }

    // Check time restrictions
    const now = new Date();
    if (quiz.startTime && now < quiz.startTime) {
      return sendResponse({
        success: false,
        message: "Quiz has not started yet",
        status: 400,
      });
    }
    if (quiz.endTime && now > quiz.endTime) {
      return sendResponse({
        success: false,
        message: "Quiz has ended",
        status: 400,
      });
    }

    // Check attempt limit
    const attemptCount = await prisma.quizAttempt.count({
      where: {
        quizId: id,
        studentId: auth.user.studentId,
      },
    });

    if (!quiz.allowRetake && attemptCount >= 1) {
      return sendResponse({
        success: false,
        message: "You have already attempted this quiz",
        status: 400,
      });
    }

    if (quiz.allowRetake && attemptCount >= quiz.maxAttempts) {
      return sendResponse({
        success: false,
        message: `Maximum attempts (${quiz.maxAttempts}) reached`,
        status: 400,
      });
    }

    // Create new attempt
    const attempt = await prisma.quizAttempt.create({
      data: {
        quizId: id,
        studentId: auth.user.studentId,
        attemptNumber: attemptCount + 1,
        startTime: new Date(),
      },
    });

    return sendResponse({
      success: true,
      message: "Quiz attempt started",
      data: {
        attemptId: attempt.id,
        timeLimit: quiz.timeLimit,
        questions: quiz.questions.map((q) => ({
          id: q.id,
          text: q.text,
          type: q.type,
          options: q.options,
          marks: q.marks,
          negativeMarks: q.negativeMarks,
          order: q.order,
        })),
      },
      status: 201,
    });
  } catch (error) {
    console.error("Error starting quiz attempt:", error);
    return sendResponse({
      success: false,
      message: "Internal server error",
      status: 500,
    });
  }
}
