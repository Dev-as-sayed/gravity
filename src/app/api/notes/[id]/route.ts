// src/app/api/notes/[id]/route.ts
import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { authenticate } from "@/lib/apiAuthenticator";
import { sendResponse } from "@/lib/sendResponse";

// GET /api/notes/[id] - Get single note
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
    );

    if (!auth.success) {
      return sendResponse({
        success: false,
        message: auth.error || "Unauthorized",
        status: auth.status || 401,
      });
    }

    const note = await prisma.note.findUnique({
      where: { id },
      include: {
        teacher: {
          select: {
            id: true,
            name: true,
            profileImage: true,
            qualification: true,
            bio: true,
          },
        },
        batch: {
          select: {
            id: true,
            name: true,
            subject: true,
          },
        },
        _count: {
          select: {
            downloadedBy: true,
            savedBy: true,
          },
        },
      },
    });

    if (!note) {
      return sendResponse({
        success: false,
        message: "Note not found",
        status: 404,
      });
    }

    // Check permissions
    if (
      auth.user?.role === "TEACHER" &&
      note.teacherId !== auth.user.teacherId
    ) {
      return sendResponse({
        success: false,
        message: "You don't have permission to view this note",
        status: 403,
      });
    }

    // Check student access
    if (auth.user?.role === "STUDENT" && !note.isPublic) {
      if (note.batchId && auth.user.studentId) {
        const enrollment = await prisma.enrollment.findFirst({
          where: {
            studentId: auth.user.studentId,
            batchId: note.batchId,
            status: "APPROVED",
          },
        });
        if (!enrollment) {
          return sendResponse({
            success: false,
            message: "You don't have access to this note",
            status: 403,
          });
        }
      } else {
        return sendResponse({
          success: false,
          message: "You don't have access to this note",
          status: 403,
        });
      }
    }

    // Increment view count
    await prisma.note.update({
      where: { id },
      data: { views: { increment: 1 } },
    });

    return sendResponse({
      success: true,
      message: "Note fetched successfully",
      data: note,
    });
  } catch (error) {
    console.error("Error fetching note:", error);
    return sendResponse({
      success: false,
      message: "Internal server error",
      status: 500,
    });
  }
}

// PUT /api/notes/[id] - Update note
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

    const existingNote = await prisma.note.findUnique({
      where: { id },
    });

    if (!existingNote) {
      return sendResponse({
        success: false,
        message: "Note not found",
        status: 404,
      });
    }

    // Check permission
    if (
      auth.user?.role === "TEACHER" &&
      existingNote.teacherId !== auth.user.teacherId
    ) {
      return sendResponse({
        success: false,
        message: "You don't have permission to update this note",
        status: 403,
      });
    }

    const updatedNote = await prisma.note.update({
      where: { id },
      data: {
        title: body.title,
        description: body.description,
        content: body.content,
        fileUrl: body.fileUrl,
        fileType: body.fileType,
        fileSize: body.fileSize ? parseInt(body.fileSize) : null,
        duration: body.duration ? parseInt(body.duration) : null,
        pages: body.pages ? parseInt(body.pages) : null,
        subject: body.subject,
        topic: body.topic,
        topics: body.topics,
        isPublic: body.isPublic,
        isPremium: body.isPremium,
        price: body.price ? parseFloat(body.price) : null,
        freePreview: body.freePreview,
        tags: body.tags,
        difficulty: body.difficulty,
        metaTitle: body.metaTitle,
        metaDescription: body.metaDescription,
        metaKeywords: body.metaKeywords,
      },
    });

    return sendResponse({
      success: true,
      message: "Note updated successfully",
      data: updatedNote,
    });
  } catch (error) {
    console.error("Error updating note:", error);
    return sendResponse({
      success: false,
      message: "Internal server error",
      status: 500,
    });
  }
}

// DELETE /api/notes/[id] - Delete note
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

    const existingNote = await prisma.note.findUnique({
      where: { id },
    });

    if (!existingNote) {
      return sendResponse({
        success: false,
        message: "Note not found",
        status: 404,
      });
    }

    // Check permission
    if (
      auth.user?.role === "TEACHER" &&
      existingNote.teacherId !== auth.user.teacherId
    ) {
      return sendResponse({
        success: false,
        message: "You don't have permission to delete this note",
        status: 403,
      });
    }

    await prisma.note.delete({
      where: { id },
    });

    return sendResponse({
      success: true,
      message: "Note deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting note:", error);
    return sendResponse({
      success: false,
      message: "Internal server error",
      status: 500,
    });
  }
}
