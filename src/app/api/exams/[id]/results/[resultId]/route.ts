// src/app/api/exams/[examId]/results/[resultId]/route.ts
import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { authenticate } from "@/lib/apiAuthenticator";
import { sendResponse } from "@/lib/sendResponse";

// GET /api/exams/[examId]/results/[resultId] - Get single result
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ examId: string; resultId: string }> },
) {
  try {
    const { examId, resultId } = await params;

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

    const result = await prisma.examResult.findFirst({
      where: {
        id: resultId,
        examId,
      },
      include: {
        student: {
          select: {
            id: true,
            name: true,
            profileImage: true,
            class: true,
            rollNumber: true,
          },
        },
        exam: {
          select: {
            title: true,
            subject: true,
            fullMarks: true,
            passMarks: true,
          },
        },
      },
    });

    if (!result) {
      return sendResponse({
        success: false,
        message: "Result not found",
        status: 404,
      });
    }

    // Check permission
    if (
      auth.user?.role === "STUDENT" &&
      result.studentId !== auth.user.studentId
    ) {
      return sendResponse({
        success: false,
        message: "You don't have permission to view this result",
        status: 403,
      });
    }

    return sendResponse({
      success: true,
      message: "Exam result fetched successfully",
      data: result,
    });
  } catch (error) {
    console.error("Error fetching exam result:", error);
    return sendResponse({
      success: false,
      message: "Internal server error",
      status: 500,
    });
  }
}

// PUT /api/exams/[examId]/results/[resultId] - Update result
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ examId: string; resultId: string }> },
) {
  try {
    const { examId, resultId } = await params;

    const auth = await authenticate(req, "ADMIN", "SUPER_ADMIN", "TEACHER");

    if (!auth.success) {
      return sendResponse({
        success: false,
        message: auth.error || "Unauthorized",
        status: auth.status || 401,
      });
    }

    const body = await req.json();

    const result = await prisma.examResult.findFirst({
      where: {
        id: resultId,
        examId,
      },
    });

    if (!result) {
      return sendResponse({
        success: false,
        message: "Result not found",
        status: 404,
      });
    }

    const updatedResult = await prisma.examResult.update({
      where: { id: resultId },
      data: {
        obtainedMarks: body.obtainedMarks,
        percentage: body.percentage,
        grade: body.grade,
        subjectWiseMarks: body.subjectWiseMarks,
        topicWiseMarks: body.topicWiseMarks,
        feedback: body.feedback,
        remarks: body.remarks,
        answerScript: body.answerScript,
        answerScriptUrl: body.answerScriptUrl,
        reviewedBy: auth.user.id,
        gradedAt: new Date(),
      },
    });

    return sendResponse({
      success: true,
      message: "Exam result updated successfully",
      data: updatedResult,
    });
  } catch (error) {
    console.error("Error updating exam result:", error);
    return sendResponse({
      success: false,
      message: "Internal server error",
      status: 500,
    });
  }
}

// POST /api/exams/[examId]/results/[resultId]/recheck - Request recheck
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ examId: string; resultId: string }> },
) {
  try {
    const { examId, resultId } = await params;

    const auth = await authenticate(req, "STUDENT");

    if (!auth.success || !auth.user?.studentId) {
      return sendResponse({
        success: false,
        message: "Only students can request recheck",
        status: 401,
      });
    }

    const body = await req.json();

    const result = await prisma.examResult.findFirst({
      where: {
        id: resultId,
        examId,
        studentId: auth.user.studentId,
      },
    });

    if (!result) {
      return sendResponse({
        success: false,
        message: "Result not found",
        status: 404,
      });
    }

    const exam = await prisma.exam.findUnique({
      where: { id: examId },
    });

    if (!exam?.allowRecheck) {
      return sendResponse({
        success: false,
        message: "Recheck is not allowed for this exam",
        status: 400,
      });
    }

    const updatedResult = await prisma.examResult.update({
      where: { id: resultId },
      data: {
        recheckRequested: true,
        recheckResult: body.reason,
        recheckFee: exam.recheckFee,
        recheckPaid: false,
      },
    });

    return sendResponse({
      success: true,
      message: "Recheck requested successfully",
      data: updatedResult,
    });
  } catch (error) {
    console.error("Error requesting recheck:", error);
    return sendResponse({
      success: false,
      message: "Internal server error",
      status: 500,
    });
  }
}
