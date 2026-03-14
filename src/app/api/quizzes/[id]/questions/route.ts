// src/app/api/quizzes/[id]/questions/route.ts
import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { authenticate } from "@/lib/apiAuthenticator";
import { sendResponse } from "@/lib/sendResponse";

// GET /api/quizzes/[id]/questions - Get all questions for a quiz
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

    const questions = await prisma.question.findMany({
      where: { quizId: id },
      orderBy: { order: "asc" },
    });

    return sendResponse({
      success: true,
      message: "Questions fetched successfully",
      data: questions,
    });
  } catch (error) {
    console.error("Error fetching questions:", error);
    return sendResponse({
      success: false,
      message: "Internal server error",
      status: 500,
    });
  }
}

// POST /api/quizzes/[id]/questions - Add questions to quiz
export async function POST(
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

    const quiz = await prisma.quiz.findUnique({
      where: { id },
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

    // If single question
    if (!Array.isArray(body)) {
      const question = await prisma.question.create({
        data: {
          quizId: id,
          text: body.text,
          type: body.type,
          options: body.options,
          correctAnswer: body.correctAnswer,
          explanation: body.explanation,
          marks: body.marks || 1,
          negativeMarks: body.negativeMarks || 0,
          matchPairs: body.matchPairs,
          imageUrl: body.imageUrl,
          audioUrl: body.audioUrl,
          difficulty: body.difficulty,
          topic: body.topic,
          order: body.order || 0,
        },
      });

      return sendResponse({
        success: true,
        message: "Question added successfully",
        data: question,
        status: 201,
      });
    }

    // Bulk create questions
    const questions = await prisma.$transaction(
      body.map((q, index) =>
        prisma.question.create({
          data: {
            quizId: id,
            text: q.text,
            type: q.type,
            options: q.options,
            correctAnswer: q.correctAnswer,
            explanation: q.explanation,
            marks: q.marks || 1,
            negativeMarks: q.negativeMarks || 0,
            matchPairs: q.matchPairs,
            imageUrl: q.imageUrl,
            audioUrl: q.audioUrl,
            difficulty: q.difficulty,
            topic: q.topic,
            order: q.order || index,
          },
        }),
      ),
    );

    return sendResponse({
      success: true,
      message: `${questions.length} questions added successfully`,
      data: questions,
      status: 201,
    });
  } catch (error) {
    console.error("Error adding questions:", error);
    return sendResponse({
      success: false,
      message: "Internal server error",
      status: 500,
    });
  }
}
