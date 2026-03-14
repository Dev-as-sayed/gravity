// src/app/api/exams/[id]/route.ts
import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { authenticate } from "@/lib/apiAuthenticator";
import { sendResponse } from "@/lib/sendResponse";

// GET /api/exams/[id] - Get single exam
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

    const exam = await prisma.exam.findUnique({
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
        results:
          auth.user?.role !== "STUDENT"
            ? {
                take: 10,
                orderBy: { percentage: "desc" },
                include: {
                  student: {
                    select: {
                      id: true,
                      name: true,
                      profileImage: true,
                    },
                  },
                },
              }
            : false,
        _count: {
          select: {
            results: true,
          },
        },
      },
    });

    if (!exam) {
      return sendResponse({
        success: false,
        message: "Exam not found",
        status: 404,
      });
    }

    // Check permissions
    if (
      auth.user?.role === "TEACHER" &&
      exam.teacherId !== auth.user.teacherId
    ) {
      return sendResponse({
        success: false,
        message: "You don't have permission to view this exam",
        status: 403,
      });
    }

    // For students, check if they are enrolled
    if (auth.user?.role === "STUDENT" && exam.batchId && auth.user.studentId) {
      const enrollment = await prisma.enrollment.findFirst({
        where: {
          studentId: auth.user.studentId,
          batchId: exam.batchId,
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

    return sendResponse({
      success: true,
      message: "Exam fetched successfully",
      data: exam,
    });
  } catch (error) {
    console.error("Error fetching exam:", error);
    return sendResponse({
      success: false,
      message: "Internal server error",
      status: 500,
    });
  }
}

// PUT /api/exams/[id] - Update exam
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

    const existingExam = await prisma.exam.findUnique({
      where: { id },
    });

    if (!existingExam) {
      console.log("Exam not found with ID:", id);
      return sendResponse({
        success: false,
        message: "Exam not found",
        status: 404,
      });
    }

    // Check permission
    if (
      auth.user?.role === "TEACHER" &&
      existingExam.teacherId !== auth.user.teacherId
    ) {
      return sendResponse({
        success: false,
        message: "You don't have permission to update this exam",
        status: 403,
      });
    }

    // Prepare update data with proper type handling
    const updateData: any = {
      title: body.title,
      description: body.description,
      type: body.type,
      subject: body.subject,
      fullMarks:
        body.fullMarks !== undefined
          ? parseInt(body.fullMarks.toString())
          : undefined,
      passMarks:
        body.passMarks !== undefined
          ? parseInt(body.passMarks.toString())
          : null,
      examDate: body.examDate ? new Date(body.examDate) : undefined,
      startTime: body.startTime ? new Date(body.startTime) : undefined,
      endTime: body.endTime ? new Date(body.endTime) : undefined,
      duration:
        body.duration !== undefined
          ? parseInt(body.duration.toString())
          : undefined,
      lateEntryAllowed: body.lateEntryAllowed,
      earlyExitAllowed: body.earlyExitAllowed,
      gradingType: body.gradingType,
      questionPaper: body.questionPaper,
      answerSheet: body.answerSheet,
      instructions: body.instructions,
      allowReview: body.allowReview,
      showRank: body.showRank,
      showPercentile: body.showPercentile,
      allowRecheck: body.allowRecheck,
      recheckFee:
        body.recheckFee !== undefined
          ? parseFloat(body.recheckFee.toString())
          : null,
      status: body.status,
    };

    // Only include teacherId and batchId if they are provided
    if (body.teacherId) {
      updateData.teacherId = body.teacherId;
    }
    if (body.batchId !== undefined) {
      updateData.batchId = body.batchId || null;
    }

    const updatedExam = await prisma.exam.update({
      where: { id },
      data: updateData,
      include: {
        teacher: {
          select: {
            id: true,
            name: true,
            qualification: true,
          },
        },
        batch: {
          select: {
            id: true,
            name: true,
            subject: true,
          },
        },
      },
    });

    console.log("Exam updated successfully:", updatedExam.id);

    return sendResponse({
      success: true,
      message: "Exam updated successfully",
      data: updatedExam,
    });
  } catch (error) {
    console.error("Error updating exam:", error);
    return sendResponse({
      success: false,
      message: "Internal server error",
      status: 500,
    });
  }
}

// DELETE /api/exams/[id] - Delete exam
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

    const existingExam = await prisma.exam.findUnique({
      where: { id },
      include: {
        results: true,
      },
    });

    if (!existingExam) {
      return sendResponse({
        success: false,
        message: "Exam not found",
        status: 404,
      });
    }

    // Check permission
    if (
      auth.user?.role === "TEACHER" &&
      existingExam.teacherId !== auth.user.teacherId
    ) {
      return sendResponse({
        success: false,
        message: "You don't have permission to delete this exam",
        status: 403,
      });
    }

    // Check if exam has results
    if (existingExam.results.length > 0) {
      return sendResponse({
        success: false,
        message: "Cannot delete exam with existing results",
        status: 400,
      });
    }

    await prisma.exam.delete({
      where: { id },
    });

    return sendResponse({
      success: true,
      message: "Exam deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting exam:", error);
    return sendResponse({
      success: false,
      message: "Internal server error",
      status: 500,
    });
  }
}

// PATCH /api/exams/[id]/status - Update exam status
export async function PATCH(
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

    const existingExam = await prisma.exam.findUnique({
      where: { id },
    });

    if (!existingExam) {
      return sendResponse({
        success: false,
        message: "Exam not found",
        status: 404,
      });
    }

    // Check permission
    if (
      auth.user?.role === "TEACHER" &&
      existingExam.teacherId !== auth.user.teacherId
    ) {
      return sendResponse({
        success: false,
        message: "You don't have permission to update this exam",
        status: 403,
      });
    }

    const updatedExam = await prisma.exam.update({
      where: { id },
      data: {
        status: body.status,
        ...(body.status === "COMPLETED" && {
          isResultPublished: body.publishResults,
        }),
        ...(body.status === "RESULT_PUBLISHED" && { resultDate: new Date() }),
      },
    });

    return sendResponse({
      success: true,
      message: `Exam status updated to ${body.status}`,
      data: updatedExam,
    });
  } catch (error) {
    console.error("Error updating exam status:", error);
    return sendResponse({
      success: false,
      message: "Internal server error",
      status: 500,
    });
  }
}
