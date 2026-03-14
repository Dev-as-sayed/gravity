// src/app/api/quizzes/[id]/attempt/[attemptId]/submit/route.ts
import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { authenticate } from "@/lib/apiAuthenticator";
import { sendResponse } from "@/lib/sendResponse";

// POST /api/quizzes/[id]/attempt/[attemptId]/submit - Submit quiz answers
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; attemptId: string }> },
) {
  try {
    const { id, attemptId } = await params;

    const auth = await authenticate(req, "STUDENT");

    if (!auth.success || !auth.user?.studentId) {
      return sendResponse({
        success: false,
        message: "Only students can submit quizzes",
        status: 401,
      });
    }

    const body = await req.json();

    const attempt = await prisma.quizAttempt.findUnique({
      where: { id: attemptId },
      include: {
        quiz: {
          include: {
            questions: true,
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

    if (attempt.isCompleted) {
      return sendResponse({
        success: false,
        message: "This attempt has already been submitted",
        status: 400,
      });
    }

    // Calculate score
    let totalScore = 0;
    const questionMap = new Map(attempt.quiz.questions.map((q) => [q.id, q]));
    const answers = body.answers || [];

    const questionWiseAnalysis: any = {};

    answers.forEach((answer: any) => {
      const question = questionMap.get(answer.questionId);
      if (!question) return;

      let isCorrect = false;
      if (question.type === "MCQ") {
        isCorrect = question.correctAnswer === answer.selectedOption;
      } else if (question.type === "TRUE_FALSE") {
        isCorrect = question.correctAnswer === answer.selectedValue;
      } else if (question.type === "MATCHING") {
        // Implement matching logic
        isCorrect =
          JSON.stringify(question.correctAnswer) ===
          JSON.stringify(answer.matchedPairs);
      }

      const score = isCorrect ? question.marks : -question.negativeMarks;
      totalScore += score;

      questionWiseAnalysis[answer.questionId] = {
        correct: isCorrect,
        score,
        selectedAnswer: answer,
        correctAnswer: question.correctAnswer,
      };
    });

    const percentage = (totalScore / attempt.quiz.totalMarks) * 100;
    const isPassed = attempt.quiz.passingMarks
      ? totalScore >= attempt.quiz.passingMarks
      : true;

    // Update attempt
    const updatedAttempt = await prisma.$transaction(async (tx) => {
      const updated = await tx.quizAttempt.update({
        where: { id: attemptId },
        data: {
          endTime: new Date(),
          answers: body.answers,
          score: totalScore,
          percentage,
          isPassed,
          isCompleted: true,
          questionWiseAnalysis,
        },
      });

      // Create quiz result
      const result = await tx.quizResult.create({
        data: {
          attemptId: updated.id,
          studentId: auth.user.studentId,
          quizId: id,
          totalMarks: attempt.quiz.totalMarks,
          obtainedMarks: totalScore,
          percentage,
          rank: 0, // Will be updated later
          totalParticipants: 0, // Will be updated later
        },
      });

      return { updated, result };
    });

    return sendResponse({
      success: true,
      message: "Quiz submitted successfully",
      data: {
        score: totalScore,
        percentage,
        isPassed,
        result: updatedAttempt.result,
      },
    });
  } catch (error) {
    console.error("Error submitting quiz:", error);
    return sendResponse({
      success: false,
      message: "Internal server error",
      status: 500,
    });
  }
}
