// src/app/api/messages/[id]/route.ts
import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { authenticate } from "@/lib/apiAuthenticator";
import { sendResponse } from "@/lib/sendResponse";

// GET /api/messages/[id] - Get single message
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

    const message = await prisma.message.findUnique({
      where: { id },
      include: {
        sender: {
          select: { id: true, name: true, email: true, role: true, profileImage: true },
        },
        receiver: {
          select: { id: true, name: true, email: true, role: true, profileImage: true },
        },
      },
    });

    if (!message) {
      return sendResponse({
        success: false,
        message: "Message not found",
        status: 404,
      });
    }

    if (
      message.senderId !== auth.user.id &&
      message.receiverId !== auth.user.id
    ) {
      return sendResponse({
        success: false,
        message: "You don't have permission to view this message",
        status: 403,
      });
    }

    return sendResponse({
      success: true,
      message: "Message fetched successfully",
      data: message,
    });
  } catch (error) {
    console.error("Error fetching message:", error);
    return sendResponse({
      success: false,
      message: "Internal server error",
      status: 500,
    });
  }
}

// DELETE /api/messages/[id] - Delete message
export async function DELETE(
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

    const message = await prisma.message.findUnique({
      where: { id },
    });

    if (!message) {
      return sendResponse({
        success: false,
        message: "Message not found",
        status: 404,
      });
    }

    if (message.senderId !== auth.user.id) {
      return sendResponse({
        success: false,
        message: "You can only delete your own messages",
        status: 403,
      });
    }

    await prisma.message.delete({ where: { id } });

    return sendResponse({
      success: true,
      message: "Message deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting message:", error);
    return sendResponse({
      success: false,
      message: "Internal server error",
      status: 500,
    });
  }
}
