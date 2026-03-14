// src/app/api/quizzes/[quizId]/questions/[questionId]/route.ts
import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { authenticate } from "@/lib/apiAuthenticator";
import { sendResponse } from "@/lib/sendResponse";

// GET /api/quizzes/[quizId]/questions/[questionId] - Get single question
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ quizId: string; questionId: string }> },
) {
  try {
    const { quizId, questionId } = await params;

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

    const question = await prisma.question.findFirst({
      where: {
        id: questionId,
        quizId,
      },
    });

    if (!question) {
      return sendResponse({
        success: false,
        message: "Question not found",
        status: 404,
      });
    }

    return sendResponse({
      success: true,
      message: "Question fetched successfully",
      data: question,
    });
  } catch (error) {
    console.error("Error fetching question:", error);
    return sendResponse({
      success: false,
      message: "Internal server error",
      status: 500,
    });
  }
}

// PUT /api/quizzes/[quizId]/questions/[questionId] - Update question
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ quizId: string; questionId: string }> },
) {
  try {
    const { quizId, questionId } = await params;

    const auth = await authenticate(req, "ADMIN", "SUPER_ADMIN", "TEACHER");

    if (!auth.success) {
      return sendResponse({
        success: false,
        message: auth.error || "Unauthorized",
        status: auth.status || 401,
      });
    }

    const body = await req.json();

    const quiz = await prisma.quiz.findUnique({
      where: { id: quizId },
    });

    if (!quiz) {
      return sendResponse({
        success: false,
        message: "Quiz not found",
        status: 404,
      });
    }

    // Check permission
    if (
      auth.user?.role === "TEACHER" &&
      quiz.teacherId !== auth.user.teacherId
    ) {
      return sendResponse({
        success: false,
        message: "You don't have permission to modify this quiz",
        status: 403,
      });
    }

    const question = await prisma.question.update({
      where: { id: questionId },
      data: {
        text: body.text,
        type: body.type,
        options: body.options,
        correctAnswer: body.correctAnswer,
        explanation: body.explanation,
        marks: body.marks,
        negativeMarks: body.negativeMarks,
        matchPairs: body.matchPairs,
        imageUrl: body.imageUrl,
        audioUrl: body.audioUrl,
        difficulty: body.difficulty,
        topic: body.topic,
        order: body.order,
      },
    });

    return sendResponse({
      success: true,
      message: "Question updated successfully",
      data: question,
    });
  } catch (error) {
    console.error("Error updating question:", error);
    return sendResponse({
      success: false,
      message: "Internal server error",
      status: 500,
    });
  }
}

// DELETE /api/quizzes/[quizId]/questions/[questionId] - Delete question
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ quizId: string; questionId: string }> },
) {
  try {
    const { quizId, questionId } = await params;

    const auth = await authenticate(req, "ADMIN", "SUPER_ADMIN", "TEACHER");

    if (!auth.success) {
      return sendResponse({
        success: false,
        message: auth.error || "Unauthorized",
        status: auth.status || 401,
      });
    }

    const quiz = await prisma.quiz.findUnique({
      where: { id: quizId },
    });

    if (!quiz) {
      return sendResponse({
        success: false,
        message: "Quiz not found",
        status: 404,
      });
    }

    // Check permission
    if (
      auth.user?.role === "TEACHER" &&
      quiz.teacherId !== auth.user.teacherId
    ) {
      return sendResponse({
        success: false,
        message: "You don't have permission to modify this quiz",
        status: 403,
      });
    }

    await prisma.question.delete({
      where: { id: questionId },
    });

    return sendResponse({
      success: true,
      message: "Question deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting question:", error);
    return sendResponse({
      success: false,
      message: "Internal server error",
      status: 500,
    });
  }
}
