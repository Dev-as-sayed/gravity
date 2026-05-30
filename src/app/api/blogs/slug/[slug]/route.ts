import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { authenticate } from "@/lib/apiAuthenticator";
import { sendResponse } from "@/lib/sendResponse";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  try {
    const { slug } = await params;

    const auth = await authenticate(
      req,
      "TEACHER", "STUDENT",
      "GUARDIAN",
    );

    const blog = await prisma.blog.findUnique({
      where: { slug },
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
          where: auth.success && auth.user?.role === "TEACHER"
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
      auth.success && auth.user?.role === "TEACHER" &&
      blog.teacherId !== auth.user.teacherId
    ) {
      return sendResponse({
        success: false,
        message: "You don't have permission to view this blog",
        status: 403,
      });
    }

    // If not published, only teacher-owner can view
    if (
      !blog.isPublished &&
      (!auth.success || auth.user?.role !== "TEACHER")
    ) {
      return sendResponse({
        success: false,
        message: "Blog not found",
        status: 404,
      });
    }

    // Increment view count
    await prisma.blog.update({
      where: { slug },
      data: { views: { increment: 1 } },
    });

    return sendResponse({
      success: true,
      message: "Blog fetched successfully",
      data: { ...blog, views: blog.views + 1 },
    });
  } catch (error) {
    console.error("Error fetching blog by slug:", error);
    return sendResponse({
      success: false,
      message: "Internal server error",
      status: 500,
    });
  }
}
