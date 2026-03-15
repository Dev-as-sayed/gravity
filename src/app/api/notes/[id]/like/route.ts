// src/app/api/notes/[id]/like/route.ts
import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { authenticate } from "@/lib/apiAuthenticator";
import { sendResponse } from "@/lib/sendResponse";

// POST /api/notes/[id]/like - Like/unlike note
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

    // Update likes count
    await prisma.note.update({
      where: { id },
      data: { likes: { increment: 1 } }, // You might want to track who liked
    });

    return sendResponse({
      success: true,
      message: "Note liked successfully",
    });
  } catch (error) {
    console.error("Error liking note:", error);
    return sendResponse({
      success: false,
      message: "Internal server error",
      status: 500,
    });
  }
}
