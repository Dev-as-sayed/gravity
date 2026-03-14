// src/app/api/media/[id]/media/route.ts
import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { authenticate } from "@/lib/apiAuthenticator";
import { sendResponse } from "@/lib/sendResponse";

// GET /api/media/[id]/media - Get all media attachments for a post
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

    const media = await prisma.mediaAttachment.findMany({
      where: { postId: id },
      orderBy: { displayOrder: "asc" },
    });

    return sendResponse({
      success: true,
      message: "Media attachments fetched successfully",
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

// POST /api/media/[id]/media - Add media to post
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
        message: "You don't have permission to add media to this post",
        status: 403,
      });
    }

    // If single media
    if (!Array.isArray(body)) {
      const media = await prisma.mediaAttachment.create({
        data: {
          postId: id,
          url: body.url,
          type: body.type,
          category: body.category || "IMAGE",
          filename: body.filename,
          fileSize: body.fileSize,
          duration: body.duration,
          width: body.width,
          height: body.height,
          thumbnail: body.thumbnail,
          caption: body.caption,
          altText: body.altText,
          displayOrder: body.displayOrder || 0,
        },
      });

      return sendResponse({
        success: true,
        message: "Media added successfully",
        data: media,
        status: 201,
      });
    }

    // Bulk create media
    const media = await prisma.$transaction(
      body.map((m: any, index: number) =>
        prisma.mediaAttachment.create({
          data: {
            postId: id,
            url: m.url,
            type: m.type,
            category: m.category || "IMAGE",
            filename: m.filename,
            fileSize: m.fileSize,
            duration: m.duration,
            width: m.width,
            height: m.height,
            thumbnail: m.thumbnail,
            caption: m.caption,
            altText: m.altText,
            displayOrder: m.displayOrder || index,
          },
        }),
      ),
    );

    return sendResponse({
      success: true,
      message: `${media.length} media items added successfully`,
      data: media,
      status: 201,
    });
  } catch (error) {
    console.error("Error adding media:", error);
    return sendResponse({
      success: false,
      message: "Internal server error",
      status: 500,
    });
  }
}
