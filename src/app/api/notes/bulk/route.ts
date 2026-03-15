// src/app/api/notes/bulk/route.ts
import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { authenticate } from "@/lib/apiAuthenticator";
import { sendResponse } from "@/lib/sendResponse";

// POST /api/notes/bulk - Bulk operations on notes
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
    const { noteIds, action } = body;

    if (!noteIds || !Array.isArray(noteIds) || noteIds.length === 0) {
      return sendResponse({
        success: false,
        message: "noteIds array is required",
        status: 400,
      });
    }

    const validActions = [
      "publish",
      "unpublish",
      "premium",
      "unpremium",
      "delete",
    ];
    if (!action || !validActions.includes(action)) {
      return sendResponse({
        success: false,
        message: `Invalid action. Must be one of: ${validActions.join(", ")}`,
        status: 400,
      });
    }

    // Check permissions for teacher
    if (auth.user?.role === "TEACHER") {
      const notes = await prisma.note.findMany({
        where: {
          id: { in: noteIds },
        },
        select: { teacherId: true },
      });

      const unauthorized = notes.some(
        (note) => note.teacherId !== auth.user?.teacherId,
      );
      if (unauthorized) {
        return sendResponse({
          success: false,
          message: "You don't have permission to modify some of these notes",
          status: 403,
        });
      }
    }

    let result;

    switch (action) {
      case "publish":
        result = await prisma.note.updateMany({
          where: { id: { in: noteIds } },
          data: { isPublic: true },
        });
        break;

      case "unpublish":
        result = await prisma.note.updateMany({
          where: { id: { in: noteIds } },
          data: { isPublic: false },
        });
        break;

      case "premium":
        result = await prisma.note.updateMany({
          where: { id: { in: noteIds } },
          data: { isPremium: true },
        });
        break;

      case "unpremium":
        result = await prisma.note.updateMany({
          where: { id: { in: noteIds } },
          data: { isPremium: false },
        });
        break;

      case "delete":
        // First, delete all bookmarks related to these notes
        await prisma.postBookmark.deleteMany({
          where: { noteId: { in: noteIds } },
        });

        // Then, for each note, we need to disconnect the downloadedBy relations
        // We need to do this one by one since updateMany doesn't support relation updates
        for (const noteId of noteIds) {
          await prisma.note.update({
            where: { id: noteId },
            data: {
              downloadedBy: {
                set: [], // Disconnect all students
              },
            },
          });
        }

        // Finally, delete the notes
        result = await prisma.note.deleteMany({
          where: { id: { in: noteIds } },
        });

        return sendResponse({
          success: true,
          message: `${noteIds.length} notes deleted successfully`,
        });
    }

    return sendResponse({
      success: true,
      message: `${result.count} notes ${action}ed successfully`,
      data: { count: result.count },
    });
  } catch (error) {
    console.error("Error in bulk note operation:", error);
    return sendResponse({
      success: false,
      message: "Internal server error",
      status: 500,
    });
  }
}
