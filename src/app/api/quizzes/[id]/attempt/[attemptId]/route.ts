// src/app/api/quizzes/[id]/attempt/[attemptId]/route.ts
import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { authenticate } from "@/lib/apiAuthenticator";
import { sendResponse } from "@/lib/sendResponse";

// GET /api/quizzes/[id]/attempt/[attemptId] - Get attempt with questions
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; attemptId: string }> },
) {
  try {
    const { id, attemptId } = await params;

    const auth = await authenticate(req, "STUDENT");

    if (!auth.success || !auth.user?.studentId) {
      return sendResponse({
        success: false,
        message: "Unauthorized",
        status: 401,
      });
    }

    const attempt = await prisma.quizAttempt.findUnique({
      where: { id: attemptId },
      include: {
        quiz: {
          include: {
            questions: {
              orderBy: { order: "asc" },
            },
          },
        },
      },
    });

    if (!attempt || attempt.quizId !== id) {
      return sendResponse({
        success: false,
        message: "Attempt not found",
        status: 404,
      });
    }

    if (attempt.studentId !== auth.user.studentId) {
      return sendResponse({
        success: false,
        message: "Unauthorized",
        status: 403,
      });
    }

    return sendResponse({
      success: true,
      message: "Attempt fetched successfully",
      data: {
        id: attempt.id,
        attemptNumber: attempt.attemptNumber,
        startTime: attempt.startTime,
        endTime: attempt.endTime,
        isCompleted: attempt.isCompleted,
        score: attempt.score,
        percentage: attempt.percentage,
        isPassed: attempt.isPassed,
        answers: attempt.answers,
        quiz: {
          id: attempt.quiz.id,
          title: attempt.quiz.title,
          timeLimit: attempt.quiz.timeLimit,
          totalMarks: attempt.quiz.totalMarks,
          passingMarks: attempt.quiz.passingMarks,
          negativeMarking: attempt.quiz.negativeMarking,
          showResult: attempt.quiz.showResult,
          showAnswer: attempt.quiz.showAnswer,
          showExplanation: attempt.quiz.showExplanation,
          questions: attempt.quiz.questions.map((q) => ({
            id: q.id,
            text: q.text,
            type: q.type,
            options: q.options,
            marks: q.marks,
            negativeMarks: q.negativeMarks,
            order: q.order,
            imageUrl: q.imageUrl,
            // Only reveal correct answer if quiz is completed and showAnswer is true
            correctAnswer: attempt.isCompleted && attempt.quiz.showAnswer
              ? q.correctAnswer
              : undefined,
            explanation: attempt.isCompleted && attempt.quiz.showExplanation
              ? q.explanation
              : undefined,
          })),
        },
      },
    });
  } catch (error) {
    console.error("Error fetching attempt:", error);
    return sendResponse({
      success: false,
      message: "Internal server error",
      status: 500,
    });
  }
}

// PUT /api/quizzes/[id]/attempt/[attemptId] - Save answer or abandon attempt
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; attemptId: string }> },
) {
  try {
    const { id, attemptId } = await params;

    const auth = await authenticate(req, "STUDENT");

    if (!auth.success || !auth.user?.studentId) {
      return sendResponse({
        success: false,
        message: "Unauthorized",
        status: 401,
      });
    }

    const attempt = await prisma.quizAttempt.findUnique({
      where: { id: attemptId },
    });

    if (!attempt || attempt.quizId !== id) {
      return sendResponse({
        success: false,
        message: "Attempt not found",
        status: 404,
      });
    }

    if (attempt.studentId !== auth.user.studentId) {
      return sendResponse({
        success: false,
        message: "Unauthorized",
        status: 403,
      });
    }

    if (attempt.isCompleted) {
      return sendResponse({
        success: false,
        message: "This attempt has already been submitted",
        status: 400,
      });
    }

    const body = await req.json();
    const { action, answers } = body;

    if (action === "abandon") {
      const updated = await prisma.quizAttempt.update({
        where: { id: attemptId },
        data: {
          answers: answers || attempt.answers,
          isCompleted: true,
          endTime: new Date(),
        },
      });

      return sendResponse({
        success: true,
        message: "Quiz abandoned",
        data: updated,
      });
    }

    // Save progressive answers
    if (answers) {
      await prisma.quizAttempt.update({
        where: { id: attemptId },
        data: { answers },
      });
    }

    return sendResponse({
      success: true,
      message: "Answers saved",
    });
  } catch (error) {
    console.error("Error updating attempt:", error);
    return sendResponse({
      success: false,
      message: "Internal server error",
      status: 500,
    });
  }
}
