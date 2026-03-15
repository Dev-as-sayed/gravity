import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { authenticate } from "@/lib/apiAuthenticator";
import { sendResponse } from "@/lib/sendResponse";

// POST /api/notes/[id]/save - Save note to bookmarks
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

    if (!auth.success || !auth.user) {
      return sendResponse({
        success: false,
        message: "Authentication required",
        status: 401,
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

    // Prepare user data for bookmark
    const userData: any = {};
    if (auth.user.role === "TEACHER" && auth.user.teacherId) {
      userData.teacherId = auth.user.teacherId;
    } else if (auth.user.role === "STUDENT" && auth.user.studentId) {
      userData.studentId = auth.user.studentId;
    } else {
      return sendResponse({
        success: false,
        message: "Invalid user role for saving",
        status: 400,
      });
    }

    // Check if already saved
    const existingBookmark = await prisma.postBookmark.findFirst({
      where: {
        noteId: id,
        ...(userData.teacherId && { teacherId: userData.teacherId }),
        ...(userData.studentId && { studentId: userData.studentId }),
      },
    });

    if (existingBookmark) {
      // Remove bookmark
      await prisma.postBookmark.delete({
        where: { id: existingBookmark.id },
      });
      await prisma.note.update({
        where: { id },
        data: { saves: { decrement: 1 } },
      });

      return sendResponse({
        success: true,
        message: "Note removed from bookmarks",
      });
    } else {
      // Add bookmark
      await prisma.postBookmark.create({
        data: {
          noteId: id,
          ...userData,
        },
      });
      await prisma.note.update({
        where: { id },
        data: { saves: { increment: 1 } },
      });

      return sendResponse({
        success: true,
        message: "Note saved to bookmarks",
      });
    }
  } catch (error) {
    console.error("Error saving note:", error);
    return sendResponse({
      success: false,
      message: "Internal server error",
      status: 500,
    });
  }
}
