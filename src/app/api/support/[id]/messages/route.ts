// src/app/api/support/[id]/messages/route.ts
import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { authenticate } from "@/lib/apiAuthenticator";
import { sendResponse } from "@/lib/sendResponse";

// GET /api/support/[id]/messages - Get all messages for a ticket
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

    const ticket = await prisma.supportTicket.findUnique({
      where: { id },
      select: { userId: true },
    });

    if (!ticket) {
      return sendResponse({
        success: false,
        message: "Support ticket not found",
        status: 404,
      });
    }

    if (
      auth.user?.role === "STUDENT" &&
      ticket.userId !== auth.user.id
    ) {
      return sendResponse({
        success: false,
        message: "You don't have permission to view these messages",
        status: 403,
      });
    }

    const messages = await prisma.ticketMessage.findMany({
      where: { ticketId: id },
      orderBy: { createdAt: "asc" },
      include: {
        sender: {
          select: { id: true, name: true, email: true, role: true },
        },
      },
    });

    return sendResponse({
      success: true,
      message: "Messages fetched successfully",
      data: messages,
    });
  } catch (error) {
    console.error("Error fetching messages:", error);
    return sendResponse({
      success: false,
      message: "Internal server error",
      status: 500,
    });
  }
}

// POST /api/support/[id]/messages - Add a message to a ticket
export async function POST(
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

    const ticket = await prisma.supportTicket.findUnique({
      where: { id },
    });

    if (!ticket) {
      return sendResponse({
        success: false,
        message: "Support ticket not found",
        status: 404,
      });
    }

    if (
      auth.user?.role === "STUDENT" &&
      ticket.userId !== auth.user.id
    ) {
      return sendResponse({
        success: false,
        message: "You don't have permission to message this ticket",
        status: 403,
      });
    }

    const body = await req.json();
    const { message, attachments, isInternal } = body;

    if (!message) {
      return sendResponse({
        success: false,
        message: "Message is required",
        status: 400,
      });
    }

    const newMessage = await prisma.ticketMessage.create({
      data: {
        ticketId: id,
        senderId: auth.user.id,
        message,
        attachments: attachments || null,
        isInternal: isInternal || false,
      },
      include: {
        sender: {
          select: { id: true, name: true, email: true, role: true },
        },
      },
    });

    return sendResponse({
      success: true,
      message: "Message added successfully",
      data: newMessage,
      status: 201,
    });
  } catch (error) {
    console.error("Error adding message:", error);
    return sendResponse({
      success: false,
      message: "Internal server error",
      status: 500,
    });
  }
}
