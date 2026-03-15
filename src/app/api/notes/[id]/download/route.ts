// src/app/api/notes/[id]/download/route.ts
import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { authenticate } from "@/lib/apiAuthenticator";
import { sendResponse } from "@/lib/sendResponse";

// POST /api/notes/[id]/download - Track note download
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

    const note = await prisma.note.findUnique({
      where: { id },
    });

    if (!note) {
      return sendResponse({
        success: false,
        message: "Note not found",
        status: 404,
      });
    }

    // Check access for students
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
            message: "You don't have access to download this note",
            status: 403,
          });
        }
      } else {
        return sendResponse({
          success: false,
          message: "You don't have access to download this note",
          status: 403,
        });
      }
    }

    // Check if premium and student hasn't purchased
    if (note.isPremium && auth.user?.role === "STUDENT") {
      // You would check if student has purchased the note
      // This would require a Purchase model
      // For now, we'll allow download
    }

    // Increment download count
    await prisma.note.update({
      where: { id },
      data: { downloads: { increment: 1 } },
    });

    // Track download by student
    if (auth.user?.role === "STUDENT" && auth.user.studentId) {
      await prisma.note.update({
        where: { id },
        data: {
          downloadedBy: {
            connect: { id: auth.user.studentId },
          },
        },
      });
    }

    return sendResponse({
      success: true,
      message: "Download tracked successfully",
      data: {
        fileUrl: note.fileUrl,
        fileType: note.fileType,
        filename: note.title,
      },
    });
  } catch (error) {
    console.error("Error tracking download:", error);
    return sendResponse({
      success: false,
      message: "Internal server error",
      status: 500,
    });
  }
}
