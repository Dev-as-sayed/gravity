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
    );

    const note = await prisma.note.findUnique({
      where: { slug },
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

    // Public notes are accessible without authentication
    if (note.isPublic) {
      // visible to everyone
    } else if (auth.success && auth.user?.role === "TEACHER") {
      if (note.teacherId !== auth.user.teacherId) {
        return sendResponse({
          success: false,
          message: "You don't have permission to view this note",
          status: 403,
        });
      }
    } else if (auth.success && auth.user?.role === "STUDENT") {
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
    } else {
      return sendResponse({
        success: false,
        message: "Note not found",
        status: 404,
      });
    }

    // Increment view count
    await prisma.note.update({
      where: { slug },
      data: { views: { increment: 1 } },
    });

    return sendResponse({
      success: true,
      message: "Note fetched successfully",
      data: { ...note, views: note.views + 1 },
    });
  } catch (error) {
    console.error("Error fetching note by slug:", error);
    return sendResponse({
      success: false,
      message: "Internal server error",
      status: 500,
    });
  }
}
