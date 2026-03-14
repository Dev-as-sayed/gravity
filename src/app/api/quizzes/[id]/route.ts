// src/app/api/quizzes/[id]/route.ts
import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { authenticate } from "@/lib/apiAuthenticator";
import { sendResponse } from "@/lib/sendResponse";

// GET /api/quizzes/[id] - Get single quiz
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

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

    const quiz = await prisma.quiz.findUnique({
      where: { id },
      include: {
        teacher: {
          select: {
            id: true,
            name: true,
            qualification: true,
            profileImage: true,
          },
        },
        batch: {
          select: {
            id: true,
            name: true,
            subject: true,
          },
        },
        questions: {
          orderBy: { order: "asc" },
        },
        _count: {
          select: {
            questions: true,
            attempts: true,
            quizResults: true,
          },
        },
      },
    });

    if (!quiz) {
      return sendResponse({
        success: false,
        message: "Quiz not found",
        status: 404,
      });
    }

    // Check permissions
    if (
      auth.user?.role === "TEACHER" &&
      quiz.teacherId !== auth.user.teacherId
    ) {
      return sendResponse({
        success: false,
        message: "You don't have permission to view this quiz",
        status: 403,
      });
    }

    // For students, check if they can access
    if (auth.user?.role === "STUDENT") {
      if (quiz.status !== "PUBLISHED") {
        return sendResponse({
          success: false,
          message: "This quiz is not available",
          status: 403,
        });
      }

      // Check if student is enrolled in the batch
      if (quiz.batchId && auth.user.studentId) {
        const enrollment = await prisma.enrollment.findFirst({
          where: {
            studentId: auth.user.studentId,
            batchId: quiz.batchId,
            status: "APPROVED",
          },
        });
        if (!enrollment) {
          return sendResponse({
            success: false,
            message: "You are not enrolled in this batch",
            status: 403,
          });
        }
      }
    }

    return sendResponse({
      success: true,
      message: "Quiz fetched successfully",
      data: quiz,
    });
  } catch (error) {
    console.error("Error fetching quiz:", error);
    return sendResponse({
      success: false,
      message: "Internal server error",
      status: 500,
    });
  }
}

// PUT /api/quizzes/[id] - Update quiz
export async function PUT(
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

    const body = await req.json();

    const existingQuiz = await prisma.quiz.findUnique({
      where: { id },
    });

    if (!existingQuiz) {
      return sendResponse({
        success: false,
        message: "Quiz not found",
        status: 404,
      });
    }

    // Check permission
    if (
      auth.user?.role === "TEACHER" &&
      existingQuiz.teacherId !== auth.user.teacherId
    ) {
      return sendResponse({
        success: false,
        message: "You don't have permission to update this quiz",
        status: 403,
      });
    }

    const updatedQuiz = await prisma.quiz.update({
      where: { id },
      data: {
        title: body.title,
        description: body.description,
        timeLimit: body.timeLimit,
        totalMarks: body.totalMarks,
        passingMarks: body.passingMarks,
        negativeMarking: body.negativeMarking,
        status: body.status,
        difficulty: body.difficulty,
        subject: body.subject,
        topics: body.topics,
        showResult: body.showResult,
        showAnswer: body.showAnswer,
        showExplanation: body.showExplanation,
        showLeaderboard: body.showLeaderboard,
        allowRetake: body.allowRetake,
        maxAttempts: body.maxAttempts,
        startTime: body.startTime ? new Date(body.startTime) : null,
        endTime: body.endTime ? new Date(body.endTime) : null,
      },
    });

    return sendResponse({
      success: true,
      message: "Quiz updated successfully",
      data: updatedQuiz,
    });
  } catch (error) {
    console.error("Error updating quiz:", error);
    return sendResponse({
      success: false,
      message: "Internal server error",
      status: 500,
    });
  }
}

// DELETE /api/quizzes/[id] - Delete quiz
export async function DELETE(
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

    const existingQuiz = await prisma.quiz.findUnique({
      where: { id },
      include: {
        questions: true,
        attempts: true,
      },
    });

    if (!existingQuiz) {
      return sendResponse({
        success: false,
        message: "Quiz not found",
        status: 404,
      });
    }

    // Check permission
    if (
      auth.user?.role === "TEACHER" &&
      existingQuiz.teacherId !== auth.user.teacherId
    ) {
      return sendResponse({
        success: false,
        message: "You don't have permission to delete this quiz",
        status: 403,
      });
    }

    // Check if quiz has attempts
    if (existingQuiz.attempts.length > 0) {
      return sendResponse({
        success: false,
        message: "Cannot delete quiz with existing attempts",
        status: 400,
      });
    }

    // Delete quiz and related questions
    await prisma.$transaction([
      prisma.question.deleteMany({
        where: { quizId: id },
      }),
      prisma.quiz.delete({
        where: { id },
      }),
    ]);

    return sendResponse({
      success: true,
      message: "Quiz deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting quiz:", error);
    return sendResponse({
      success: false,
      message: "Internal server error",
      status: 500,
    });
  }
}
