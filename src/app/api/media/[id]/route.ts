// src/app/api/media/[id]/route.ts
import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { authenticate } from "@/lib/apiAuthenticator";
import { sendResponse } from "@/lib/sendResponse";

// GET /api/media/[id] - Get single post
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
      "GUARDIAN",
    );

    if (!auth.success) {
      return sendResponse({
        success: false,
        message: auth.error || "Unauthorized",
        status: auth.status || 401,
      });
    }

    const post = await prisma.post.findUnique({
      where: { id },
      include: {
        teacher: {
          select: {
            id: true,
            name: true,
            profileImage: true,
            qualification: true,
          },
        },
        student: {
          select: {
            id: true,
            name: true,
            profileImage: true,
            class: true,
          },
        },
        batch: {
          select: {
            id: true,
            name: true,
            subject: true,
          },
        },
        course: {
          select: {
            id: true,
            title: true,
            subject: true,
          },
        },
        media: {
          orderBy: { displayOrder: "asc" },
        },
        poll: {
          include: {
            votes: true,
          },
        },
        _count: {
          select: {
            reactions: true,
            comments: true,
            bookmarks: true,
          },
        },
      },
    });

    if (!post) {
      return sendResponse({
        success: false,
        message: "Post not found",
        status: 404,
      });
    }

    // Check visibility permissions
    if (post.visibility !== "PUBLIC" && auth.user?.role === "GUARDIAN") {
      return sendResponse({
        success: false,
        message: "You don't have permission to view this post",
        status: 403,
      });
    }

    if (
      post.visibility === "BATCH_ONLY" &&
      post.batchId &&
      auth.user?.role === "STUDENT"
    ) {
      const enrollment = await prisma.enrollment.findFirst({
        where: {
          studentId: auth.user.studentId,
          batchId: post.batchId,
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

    // Increment view count
    await prisma.post.update({
      where: { id },
      data: { views: { increment: 1 } },
    });

    // Track unique view
    const viewerId =
      auth.user?.studentId || auth.user?.teacherId || auth.user?.guardianId;
    if (viewerId) {
      await prisma.postView.create({
        data: {
          postId: id,
          ...(auth.user?.studentId && { studentId: auth.user.studentId }),
          ...(auth.user?.teacherId && { teacherId: auth.user.teacherId }),
          ...(auth.user?.guardianId && { guardianId: auth.user.guardianId }),
          viewedAt: new Date(),
        },
      });
    }

    return sendResponse({
      success: true,
      message: "Post fetched successfully",
      data: post,
    });
  } catch (error) {
    console.error("Error fetching post:", error);
    return sendResponse({
      success: false,
      message: "Internal server error",
      status: 500,
    });
  }
}

// PUT /api/media/[id] - Update post
export async function PUT(
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

    const body = await req.json();

    const existingPost = await prisma.post.findUnique({
      where: { id },
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
        message: "You don't have permission to edit this post",
        status: 403,
      });
    }

    const updatedPost = await prisma.post.update({
      where: { id },
      data: {
        title: body.title,
        content: body.content,
        excerpt: body.excerpt,
        type: body.type,
        status: body.status,
        visibility: body.visibility,
        batchId: body.batchId,
        courseId: body.courseId,
        linkUrl: body.linkUrl,
        linkTitle: body.linkTitle,
        linkDescription: body.linkDescription,
        linkImage: body.linkImage,
        tags: body.tags,
        topics: body.topics,
        isFeatured: body.isFeatured,
        isPinned: body.isPinned,
        pinnedUntil: body.pinnedUntil ? new Date(body.pinnedUntil) : null,
        pinnedBy: body.isPinned ? auth.user.id : null,
        metaTitle: body.metaTitle,
        metaDescription: body.metaDescription,
        metaKeywords: body.metaKeywords,
        publishedAt:
          body.status === "PUBLISHED" && existingPost.status !== "PUBLISHED"
            ? new Date()
            : existingPost.publishedAt,
        scheduledFor: body.scheduledFor ? new Date(body.scheduledFor) : null,
      },
    });

    return sendResponse({
      success: true,
      message: "Post updated successfully",
      data: updatedPost,
    });
  } catch (error) {
    console.error("Error updating post:", error);
    return sendResponse({
      success: false,
      message: "Internal server error",
      status: 500,
    });
  }
}

// DELETE /api/media/[id] - Delete post
export async function DELETE(
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

    const existingPost = await prisma.post.findUnique({
      where: { id },
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
        message: "You don't have permission to delete this post",
        status: 403,
      });
    }

    await prisma.post.delete({
      where: { id },
    });

    return sendResponse({
      success: true,
      message: "Post deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting post:", error);
    return sendResponse({
      success: false,
      message: "Internal server error",
      status: 500,
    });
  }
}
