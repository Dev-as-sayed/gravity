// app/api/doubts/[id]/answers/[answerId]/route.ts
import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { authenticate } from "@/lib/apiAuthenticator";
import { sendResponse } from "@/lib/sendResponse";

// GET /api/doubts/[id]/answers/[answerId] - Get single answer
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; answerId: string }> },
) {
  try {
    const { id, answerId } = await params;

    const auth = await authenticate(
      req,
      "ADMIN",
      "SUPER_ADMIN",
      "TEACHER",
      "STUDENT",
      "MODERATOR",
    );

    if (!auth.success) {
      return sendResponse({
        success: false,
        message: auth.error || "Unauthorized",
        status: auth.status || 401,
      });
    }

    const answer = await prisma.doubtAnswer.findFirst({
      where: {
        id: answerId,
        doubtId: id,
      },
      include: {
        teacher: {
          select: {
            id: true,
            name: true,
            profileImage: true,
          },
        },
        student: {
          select: {
            id: true,
            name: true,
            profileImage: true,
          },
        },
      },
    });

    if (!answer) {
      return sendResponse({
        success: false,
        message: "Answer not found",
        status: 404,
      });
    }

    return sendResponse({
      success: true,
      message: "Answer fetched successfully",
      data: answer,
    });
  } catch (error) {
    console.error("Error fetching answer:", error);
    return sendResponse({
      success: false,
      message: "Internal server error",
      status: 500,
    });
  }
}

// PUT /api/doubts/[id]/answers/[answerId] - Update answer
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; answerId: string }> },
) {
  try {
    const { id, answerId } = await params;

    const auth = await authenticate(
      req,
      "ADMIN",
      "SUPER_ADMIN",
      "TEACHER",
      "STUDENT",
      "MODERATOR",
    );

    if (!auth.success) {
      return sendResponse({
        success: false,
        message: auth.error || "Unauthorized",
        status: auth.status || 401,
      });
    }

    const body = await req.json();

    const answer = await prisma.doubtAnswer.findFirst({
      where: {
        id: answerId,
        doubtId: id,
      },
    });

    if (!answer) {
      return sendResponse({
        success: false,
        message: "Answer not found",
        status: 404,
      });
    }

    // Check if user can update this answer
    const canUpdate =
      auth.user?.role === "ADMIN" ||
      auth.user?.role === "SUPER_ADMIN" ||
      (auth.user?.role === "TEACHER" &&
        answer.teacherId === auth.user.teacherId) ||
      (auth.user?.role === "STUDENT" &&
        answer.studentId === auth.user.studentId);

    if (!canUpdate) {
      return sendResponse({
        success: false,
        message: "You don't have permission to update this answer",
        status: 403,
      });
    }

    const updatedAnswer = await prisma.doubtAnswer.update({
      where: { id: answerId },
      data: {
        content: body.content,
        images: body.images,
        files: body.files,
      },
    });

    return sendResponse({
      success: true,
      message: "Answer updated successfully",
      data: updatedAnswer,
    });
  } catch (error) {
    console.error("Error updating answer:", error);
    return sendResponse({
      success: false,
      message: "Internal server error",
      status: 500,
    });
  }
}

// DELETE /api/doubts/[id]/answers/[answerId] - Delete answer
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; answerId: string }> },
) {
  try {
    const { id, answerId } = await params;

    const auth = await authenticate(
      req,
      "ADMIN",
      "SUPER_ADMIN",
      "TEACHER",
      "STUDENT",
      "MODERATOR",
    );

    if (!auth.success) {
      return sendResponse({
        success: false,
        message: auth.error || "Unauthorized",
        status: auth.status || 401,
      });
    }

    const answer = await prisma.doubtAnswer.findFirst({
      where: {
        id: answerId,
        doubtId: id,
      },
    });

    if (!answer) {
      return sendResponse({
        success: false,
        message: "Answer not found",
        status: 404,
      });
    }

    // Check if user can delete this answer
    const canDelete =
      auth.user?.role === "ADMIN" ||
      auth.user?.role === "SUPER_ADMIN" ||
      (auth.user?.role === "TEACHER" &&
        answer.teacherId === auth.user.teacherId) ||
      (auth.user?.role === "STUDENT" &&
        answer.studentId === auth.user.studentId);

    if (!canDelete) {
      return sendResponse({
        success: false,
        message: "You don't have permission to delete this answer",
        status: 403,
      });
    }

    await prisma.doubtAnswer.delete({
      where: { id: answerId },
    });

    return sendResponse({
      success: true,
      message: "Answer deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting answer:", error);
    return sendResponse({
      success: false,
      message: "Internal server error",
      status: 500,
    });
  }
}
