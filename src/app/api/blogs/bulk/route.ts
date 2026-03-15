// src/app/api/blogs/bulk/route.ts
import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { authenticate } from "@/lib/apiAuthenticator";
import { sendResponse } from "@/lib/sendResponse";

// POST /api/blogs/bulk - Bulk operations on blogs
export async function POST(req: NextRequest) {
  try {
    const auth = await authenticate(req, "ADMIN", "SUPER_ADMIN", "TEACHER");

    if (!auth.success) {
      return sendResponse({
        success: false,
        message: auth.error || "Unauthorized",
        status: auth.status || 401,
      });
    }

    const body = await req.json();
    const { blogIds, action } = body;

    if (!blogIds || !Array.isArray(blogIds) || blogIds.length === 0) {
      return sendResponse({
        success: false,
        message: "blogIds array is required",
        status: 400,
      });
    }

    const validActions = ["publish", "unpublish", "delete"];
    if (!action || !validActions.includes(action)) {
      return sendResponse({
        success: false,
        message: `Invalid action. Must be one of: ${validActions.join(", ")}`,
        status: 400,
      });
    }

    // Check permissions for teacher
    if (auth.user?.role === "TEACHER") {
      const blogs = await prisma.blog.findMany({
        where: {
          id: { in: blogIds },
        },
        select: { teacherId: true },
      });

      const unauthorized = blogs.some(
        (blog) => blog.teacherId !== auth.user?.teacherId,
      );
      if (unauthorized) {
        return sendResponse({
          success: false,
          message: "You don't have permission to modify some of these blogs",
          status: 403,
        });
      }
    }

    let result;

    switch (action) {
      case "publish":
        result = await prisma.blog.updateMany({
          where: { id: { in: blogIds } },
          data: {
            isPublished: true,
            publishedAt: new Date(),
          },
        });
        break;

      case "unpublish":
        result = await prisma.blog.updateMany({
          where: { id: { in: blogIds } },
          data: {
            isPublished: false,
            publishedAt: null,
          },
        });
        break;

      case "delete":
        // Delete blogs and related comments
        await prisma.$transaction([
          prisma.blogComment.deleteMany({
            where: { blogId: { in: blogIds } },
          }),
          prisma.blog.deleteMany({
            where: { id: { in: blogIds } },
          }),
        ]);

        return sendResponse({
          success: true,
          message: `${blogIds.length} blogs deleted successfully`,
        });
    }

    return sendResponse({
      success: true,
      message: `${result.count} blogs ${action}ed successfully`,
      data: { count: result.count },
    });
  } catch (error) {
    console.error("Error in bulk blog operation:", error);
    return sendResponse({
      success: false,
      message: "Internal server error",
      status: 500,
    });
  }
}
