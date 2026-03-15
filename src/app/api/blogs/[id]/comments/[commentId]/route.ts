// src/app/api/blogs/[blogId]/comments/[commentId]/route.ts
import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { authenticate } from "@/lib/apiAuthenticator";
import { sendResponse } from "@/lib/sendResponse";

// GET /api/blogs/[blogId]/comments/[commentId] - Get single comment
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ blogId: string; commentId: string }> },
) {
  try {
    const { blogId, commentId } = await params;

    const auth = await authenticate(req, "ADMIN", "SUPER_ADMIN", "TEACHER");

    if (!auth.success) {
      return sendResponse({
        success: false,
        message: auth.error || "Unauthorized",
        status: auth.status || 401,
      });
    }

    const comment = await prisma.blogComment.findFirst({
      where: {
        id: commentId,
        blogId,
      },
    });

    if (!comment) {
      return sendResponse({
        success: false,
        message: "Comment not found",
        status: 404,
      });
    }

    return sendResponse({
      success: true,
      message: "Comment fetched successfully",
      data: comment,
    });
  } catch (error) {
    console.error("Error fetching comment:", error);
    return sendResponse({
      success: false,
      message: "Internal server error",
      status: 500,
    });
  }
}

// PUT /api/blogs/[blogId]/comments/[commentId] - Update comment
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ blogId: string; commentId: string }> },
) {
  try {
    const { blogId, commentId } = await params;

    const auth = await authenticate(req, "ADMIN", "SUPER_ADMIN", "TEACHER");

    if (!auth.success) {
      return sendResponse({
        success: false,
        message: auth.error || "Unauthorized",
        status: auth.status || 401,
      });
    }

    const body = await req.json();

    const comment = await prisma.blogComment.findFirst({
      where: {
        id: commentId,
        blogId,
      },
    });

    if (!comment) {
      return sendResponse({
        success: false,
        message: "Comment not found",
        status: 404,
      });
    }

    const updatedComment = await prisma.blogComment.update({
      where: { id: commentId },
      data: {
        content: body.content,
        status: body.status,
        isApproved: body.status === "APPROVED",
      },
    });

    return sendResponse({
      success: true,
      message: "Comment updated successfully",
      data: updatedComment,
    });
  } catch (error) {
    console.error("Error updating comment:", error);
    return sendResponse({
      success: false,
      message: "Internal server error",
      status: 500,
    });
  }
}

// DELETE /api/blogs/[blogId]/comments/[commentId] - Delete comment
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ blogId: string; commentId: string }> },
) {
  try {
    const { blogId, commentId } = await params;

    const auth = await authenticate(req, "ADMIN", "SUPER_ADMIN", "TEACHER");

    if (!auth.success) {
      return sendResponse({
        success: false,
        message: auth.error || "Unauthorized",
        status: auth.status || 401,
      });
    }

    const comment = await prisma.blogComment.findFirst({
      where: {
        id: commentId,
        blogId,
      },
    });

    if (!comment) {
      return sendResponse({
        success: false,
        message: "Comment not found",
        status: 404,
      });
    }

    await prisma.blogComment.delete({
      where: { id: commentId },
    });

    return sendResponse({
      success: true,
      message: "Comment deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting comment:", error);
    return sendResponse({
      success: false,
      message: "Internal server error",
      status: 500,
    });
  }
}

// PATCH /api/blogs/[blogId]/comments/[commentId]/approve - Approve comment
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ blogId: string; commentId: string }> },
) {
  try {
    const { blogId, commentId } = await params;

    const auth = await authenticate(req, "ADMIN", "SUPER_ADMIN", "TEACHER");

    if (!auth.success) {
      return sendResponse({
        success: false,
        message: auth.error || "Unauthorized",
        status: auth.status || 401,
      });
    }

    const body = await req.json();

    const comment = await prisma.blogComment.findFirst({
      where: {
        id: commentId,
        blogId,
      },
    });

    if (!comment) {
      return sendResponse({
        success: false,
        message: "Comment not found",
        status: 404,
      });
    }

    const updatedComment = await prisma.blogComment.update({
      where: { id: commentId },
      data: {
        status: body.approve ? "APPROVED" : "REJECTED",
        isApproved: body.approve,
      },
    });

    return sendResponse({
      success: true,
      message: `Comment ${body.approve ? "approved" : "rejected"} successfully`,
      data: updatedComment,
    });
  } catch (error) {
    console.error("Error updating comment status:", error);
    return sendResponse({
      success: false,
      message: "Internal server error",
      status: 500,
    });
  }
}
