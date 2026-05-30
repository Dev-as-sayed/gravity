// src/app/api/announcements/[id]/route.ts
import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { authenticate } from "@/lib/apiAuthenticator";
import { sendResponse } from "@/lib/sendResponse";

// GET /api/announcements/[id] - Get single announcement
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    const auth = await authenticate(req, "TEACHER", "STUDENT", "MODERATOR");

    if (!auth.success) {
      return sendResponse({
        success: false,
        message: auth.error || "Unauthorized",
        status: auth.status || 401,
      });
    }

    const announcement = await prisma.announcement.findUnique({
      where: { id },
      include: {
        batch: { select: { id: true, name: true } },
      },
    });

    if (!announcement) {
      return sendResponse({
        success: false,
        message: "Announcement not found",
        status: 404,
      });
    }

    await prisma.announcement.update({
      where: { id },
      data: { views: { increment: 1 } },
    });

    return sendResponse({
      success: true,
      message: "Announcement fetched successfully",
      data: { ...announcement, views: announcement.views + 1 },
    });
  } catch (error) {
    console.error("Error fetching announcement:", error);
    return sendResponse({
      success: false,
      message: "Internal server error",
      status: 500,
    });
  }
}

// PUT /api/announcements/[id] - Update announcement
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    const auth = await authenticate(req, "TEACHER", "MODERATOR");

    if (!auth.success) {
      return sendResponse({
        success: false,
        message: auth.error || "Unauthorized",
        status: auth.status || 401,
      });
    }

    const body = await req.json();

    const existing = await prisma.announcement.findUnique({ where: { id } });

    if (!existing) {
      return sendResponse({
        success: false,
        message: "Announcement not found",
        status: 404,
      });
    }

    if (
      auth.user?.role === "TEACHER" &&
      existing.createdBy !== auth.user.teacherId
    ) {
      return sendResponse({
        success: false,
        message: "You don't have permission to update this announcement",
        status: 403,
      });
    }

    const updated = await prisma.announcement.update({
      where: { id },
      data: {
        title: body.title,
        content: body.content,
        batchId: body.batchId,
        isUrgent: body.isUrgent,
        isPinned: body.isPinned,
        attachments: body.attachments,
        expiresAt: body.expiresAt ? new Date(body.expiresAt) : undefined,
      },
    });

    return sendResponse({
      success: true,
      message: "Announcement updated successfully",
      data: updated,
    });
  } catch (error) {
    console.error("Error updating announcement:", error);
    return sendResponse({
      success: false,
      message: "Internal server error",
      status: 500,
    });
  }
}

// DELETE /api/announcements/[id] - Delete announcement
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    const auth = await authenticate(req, "TEACHER", "MODERATOR");

    if (!auth.success) {
      return sendResponse({
        success: false,
        message: auth.error || "Unauthorized",
        status: auth.status || 401,
      });
    }

    const existing = await prisma.announcement.findUnique({ where: { id } });

    if (!existing) {
      return sendResponse({
        success: false,
        message: "Announcement not found",
        status: 404,
      });
    }

    if (
      auth.user?.role === "TEACHER" &&
      existing.createdBy !== auth.user.teacherId
    ) {
      return sendResponse({
        success: false,
        message: "You don't have permission to delete this announcement",
        status: 403,
      });
    }

    await prisma.announcement.delete({ where: { id } });

    return sendResponse({
      success: true,
      message: "Announcement deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting announcement:", error);
    return sendResponse({
      success: false,
      message: "Internal server error",
      status: 500,
    });
  }
}
