// src/app/api/blogs/[id]/comments/route.ts
import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { authenticate } from "@/lib/apiAuthenticator";
import { sendResponse } from "@/lib/sendResponse";

// GET /api/blogs/[id]/comments - Get blog comments
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

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const status = searchParams.get("status");

    const skip = (page - 1) * limit;

    const where: any = { blogId: id };

    // Teachers and admins can see all comments, others only approved
    if (
      auth.user?.role !== "ADMIN" &&
      auth.user?.role !== "SUPER_ADMIN" &&
      auth.user?.role !== "TEACHER"
    ) {
      where.isApproved = true;
    }

    if (status) {
      where.status = status;
    }

    const [comments, total] = await Promise.all([
      prisma.blogComment.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      prisma.blogComment.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return sendResponse({
      success: true,
      message: "Comments fetched successfully",
      data: comments,
      meta: {
        page,
        limit,
        total,
        totalPages,
      },
    });
  } catch (error) {
    console.error("Error fetching comments:", error);
    return sendResponse({
      success: false,
      message: "Internal server error",
      status: 500,
    });
  }
}

// POST /api/blogs/[id]/comments - Add comment to blog
export async function POST(
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

    const body = await req.json();

    if (!body.content) {
      return sendResponse({
        success: false,
        message: "Comment content is required",
        status: 400,
      });
    }

    // Check if blog exists and allows comments
    const blog = await prisma.blog.findUnique({
      where: { id },
    });

    if (!blog) {
      return sendResponse({
        success: false,
        message: "Blog not found",
        status: 404,
      });
    }

    if (!blog.allowComments) {
      return sendResponse({
        success: false,
        message: "Comments are disabled for this blog",
        status: 400,
      });
    }

    // Auto-approve for teachers and admins
    const isApproved =
      auth.user?.role === "ADMIN" ||
      auth.user?.role === "SUPER_ADMIN" ||
      auth.user?.role === "TEACHER";

    const comment = await prisma.blogComment.create({
      data: {
        blogId: id,
        name: body.name || auth.user?.name,
        email: body.email || auth.user?.email,
        content: body.content,
        status: isApproved ? "APPROVED" : "PENDING",
        isApproved,
      },
    });

    return sendResponse({
      success: true,
      message: isApproved
        ? "Comment added successfully"
        : "Comment submitted for approval",
      data: comment,
      status: 201,
    });
  } catch (error) {
    console.error("Error adding comment:", error);
    return sendResponse({
      success: false,
      message: "Internal server error",
      status: 500,
    });
  }
}
