// src/app/api/media/[postId]/media/[mediaId]/route.ts
import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { authenticate } from "@/lib/apiAuthenticator";
import { sendResponse } from "@/lib/sendResponse";

// GET /api/media/[postId]/media/[mediaId] - Get single media attachment
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ postId: string; mediaId: string }> },
) {
  try {
    const { postId, mediaId } = await params;

    const auth = await authenticate(
      req,
      "ADMIN",
      "SUPER_ADMIN",
      "TEACHER",
      "STUDENT",
      "GUARDIAN",
    );

    if (!auth.success) {
      return sendResponse({
        success: false,
        message: auth.error || "Unauthorized",
        status: auth.status || 401,
      });
    }

    const media = await prisma.mediaAttachment.findFirst({
      where: {
        id: mediaId,
        postId,
      },
    });

    if (!media) {
      return sendResponse({
        success: false,
        message: "Media not found",
        status: 404,
      });
    }

    return sendResponse({
      success: true,
      message: "Media fetched successfully",
      data: media,
    });
  } catch (error) {
    console.error("Error fetching media:", error);
    return sendResponse({
      success: false,
      message: "Internal server error",
      status: 500,
    });
  }
}

// PUT /api/media/[postId]/media/[mediaId] - Update media
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ postId: string; mediaId: string }> },
) {
  try {
    const { postId, mediaId } = await params;

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

    const body = await req.json();

    const existingPost = await prisma.post.findUnique({
      where: { id: postId },
    });

    if (!existingPost) {
      return sendResponse({
        success: false,
        message: "Post not found",
        status: 404,
      });
    }

    // Check permission
    const canEdit =
      auth.user?.role === "ADMIN" ||
      auth.user?.role === "SUPER_ADMIN" ||
      (auth.user?.role === "TEACHER" &&
        existingPost.teacherId === auth.user.teacherId) ||
      (auth.user?.role === "STUDENT" &&
        existingPost.studentId === auth.user.studentId);

    if (!canEdit) {
      return sendResponse({
        success: false,
        message: "You don't have permission to edit media",
        status: 403,
      });
    }

    const updatedMedia = await prisma.mediaAttachment.update({
      where: { id: mediaId },
      data: {
        caption: body.caption,
        altText: body.altText,
        displayOrder: body.displayOrder,
      },
    });

    return sendResponse({
      success: true,
      message: "Media updated successfully",
      data: updatedMedia,
    });
  } catch (error) {
    console.error("Error updating media:", error);
    return sendResponse({
      success: false,
      message: "Internal server error",
      status: 500,
    });
  }
}

// DELETE /api/media/[postId]/media/[mediaId] - Delete media
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ postId: string; mediaId: string }> },
) {
  try {
    const { postId, mediaId } = await params;

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

    const existingPost = await prisma.post.findUnique({
      where: { id: postId },
    });

    if (!existingPost) {
      return sendResponse({
        success: false,
        message: "Post not found",
        status: 404,
      });
    }

    // Check permission
    const canDelete =
      auth.user?.role === "ADMIN" ||
      auth.user?.role === "SUPER_ADMIN" ||
      (auth.user?.role === "TEACHER" &&
        existingPost.teacherId === auth.user.teacherId) ||
      (auth.user?.role === "STUDENT" &&
        existingPost.studentId === auth.user.studentId);

    if (!canDelete) {
      return sendResponse({
        success: false,
        message: "You don't have permission to delete media",
        status: 403,
      });
    }

    await prisma.mediaAttachment.delete({
      where: { id: mediaId },
    });

    return sendResponse({
      success: true,
      message: "Media deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting media:", error);
    return sendResponse({
      success: false,
      message: "Internal server error",
      status: 500,
    });
  }
}
