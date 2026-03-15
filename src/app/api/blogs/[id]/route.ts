// src/app/api/blogs/[id]/route.ts
import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { authenticate } from "@/lib/apiAuthenticator";
import { sendResponse } from "@/lib/sendResponse";

// GET /api/blogs/[id] - Get single blog
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

    const blog = await prisma.blog.findUnique({
      where: { id },
      include: {
        teacher: {
          select: {
            id: true,
            name: true,
            profileImage: true,
            qualification: true,
            bio: true,
            expertise: true,
          },
        },
        comments: {
          where:
            auth.user?.role === "TEACHER" || auth.user?.role === "ADMIN"
              ? {}
              : { isApproved: true },
          orderBy: { createdAt: "desc" },
        },
        _count: {
          select: {
            comments: true,
          },
        },
      },
    });

    if (!blog) {
      return sendResponse({
        success: false,
        message: "Blog not found",
        status: 404,
      });
    }

    // Check permissions
    if (
      auth.user?.role === "TEACHER" &&
      blog.teacherId !== auth.user.teacherId
    ) {
      return sendResponse({
        success: false,
        message: "You don't have permission to view this blog",
        status: 403,
      });
    }

    // If not published and not author/admin, deny access
    if (
      !blog.isPublished &&
      auth.user?.role !== "ADMIN" &&
      auth.user?.role !== "SUPER_ADMIN" &&
      (auth.user?.role !== "TEACHER" || blog.teacherId !== auth.user.teacherId)
    ) {
      return sendResponse({
        success: false,
        message: "Blog not found",
        status: 404,
      });
    }

    // Increment view count
    await prisma.blog.update({
      where: { id },
      data: { views: { increment: 1 } },
    });

    return sendResponse({
      success: true,
      message: "Blog fetched successfully",
      data: blog,
    });
  } catch (error) {
    console.error("Error fetching blog:", error);
    return sendResponse({
      success: false,
      message: "Internal server error",
      status: 500,
    });
  }
}

// PUT /api/blogs/[id] - Update blog
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

    const existingBlog = await prisma.blog.findUnique({
      where: { id },
    });

    if (!existingBlog) {
      return sendResponse({
        success: false,
        message: "Blog not found",
        status: 404,
      });
    }

    // Check permission
    if (
      auth.user?.role === "TEACHER" &&
      existingBlog.teacherId !== auth.user.teacherId
    ) {
      return sendResponse({
        success: false,
        message: "You don't have permission to update this blog",
        status: 403,
      });
    }

    // Recalculate read time if content changed
    let readTime = existingBlog.readTime;
    if (body.content && body.content !== existingBlog.content) {
      const wordCount = body.content.split(/\s+/).length;
      readTime = Math.ceil(wordCount / 200);
    }

    const updatedBlog = await prisma.blog.update({
      where: { id },
      data: {
        title: body.title,
        excerpt: body.excerpt,
        content: body.content,
        featuredImage: body.featuredImage,
        thumbnail: body.thumbnail,
        gallery: body.gallery,
        metaTitle: body.metaTitle,
        metaDescription: body.metaDescription,
        metaKeywords: body.metaKeywords,
        categories: body.categories,
        tags: body.tags,
        readTime,
        allowComments: body.allowComments,
        ...(body.isPublished !== undefined && {
          isPublished: body.isPublished,
          publishedAt:
            body.isPublished && !existingBlog.isPublished
              ? new Date()
              : existingBlog.publishedAt,
        }),
      },
    });

    return sendResponse({
      success: true,
      message: "Blog updated successfully",
      data: updatedBlog,
    });
  } catch (error) {
    console.error("Error updating blog:", error);
    return sendResponse({
      success: false,
      message: "Internal server error",
      status: 500,
    });
  }
}

// DELETE /api/blogs/[id] - Delete blog
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

    const existingBlog = await prisma.blog.findUnique({
      where: { id },
      include: {
        comments: true,
      },
    });

    if (!existingBlog) {
      return sendResponse({
        success: false,
        message: "Blog not found",
        status: 404,
      });
    }

    // Check permission
    if (
      auth.user?.role === "TEACHER" &&
      existingBlog.teacherId !== auth.user.teacherId
    ) {
      return sendResponse({
        success: false,
        message: "You don't have permission to delete this blog",
        status: 403,
      });
    }

    // Delete blog (cascading will handle comments)
    await prisma.blog.delete({
      where: { id },
    });

    return sendResponse({
      success: true,
      message: "Blog deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting blog:", error);
    return sendResponse({
      success: false,
      message: "Internal server error",
      status: 500,
    });
  }
}

// PATCH /api/blogs/[id]/publish - Publish/unpublish blog
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

    const existingBlog = await prisma.blog.findUnique({
      where: { id },
    });

    if (!existingBlog) {
      return sendResponse({
        success: false,
        message: "Blog not found",
        status: 404,
      });
    }

    // Check permission
    if (
      auth.user?.role === "TEACHER" &&
      existingBlog.teacherId !== auth.user.teacherId
    ) {
      return sendResponse({
        success: false,
        message: "You don't have permission to update this blog",
        status: 403,
      });
    }

    const updatedBlog = await prisma.blog.update({
      where: { id },
      data: {
        isPublished: body.isPublished,
        publishedAt:
          body.isPublished && !existingBlog.isPublished ? new Date() : null,
      },
    });

    return sendResponse({
      success: true,
      message: `Blog ${body.isPublished ? "published" : "unpublished"} successfully`,
      data: updatedBlog,
    });
  } catch (error) {
    console.error("Error updating blog status:", error);
    return sendResponse({
      success: false,
      message: "Internal server error",
      status: 500,
    });
  }
}
