// src/app/api/support/[id]/route.ts
import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { authenticate } from "@/lib/apiAuthenticator";
import { sendResponse } from "@/lib/sendResponse";

// GET /api/support/[id] - Get single support ticket with messages
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
      include: {
        user: {
          select: { id: true, name: true, email: true, role: true },
        },
        assignedToUser: {
          select: { id: true, name: true, email: true },
        },
        messages: {
          orderBy: { createdAt: "asc" },
          include: {
            sender: {
              select: { id: true, name: true, email: true, role: true },
            },
          },
        },
      },
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
        message: "You don't have permission to view this ticket",
        status: 403,
      });
    }

    return sendResponse({
      success: true,
      message: "Support ticket fetched successfully",
      data: ticket,
    });
  } catch (error) {
    console.error("Error fetching support ticket:", error);
    return sendResponse({
      success: false,
      message: "Internal server error",
      status: 500,
    });
  }
}

// PATCH /api/support/[id] - Update support ticket
export async function PATCH(
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
    const { status, assignTo, resolution } = body;

    const existing = await prisma.supportTicket.findUnique({ where: { id } });

    if (!existing) {
      return sendResponse({
        success: false,
        message: "Support ticket not found",
        status: 404,
      });
    }

    const updateData: any = {};

    if (status) updateData.status = status;
    if (assignTo) {
      updateData.assignedTo = assignTo;
      updateData.assignedAt = new Date();
    }
    if (resolution) updateData.resolution = resolution;

    if (status === "RESOLVED" || status === "CLOSED") {
      updateData.resolvedAt = new Date();
      updateData.resolvedBy = auth.user.id;
    }

    const updated = await prisma.supportTicket.update({
      where: { id },
      data: updateData,
    });

    return sendResponse({
      success: true,
      message: "Support ticket updated successfully",
      data: updated,
    });
  } catch (error) {
    console.error("Error updating support ticket:", error);
    return sendResponse({
      success: false,
      message: "Internal server error",
      status: 500,
    });
  }
}

// DELETE /api/support/[id] - Delete support ticket
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

    const existing = await prisma.supportTicket.findUnique({ where: { id } });

    if (!existing) {
      return sendResponse({
        success: false,
        message: "Support ticket not found",
        status: 404,
      });
    }

    await prisma.ticketMessage.deleteMany({ where: { ticketId: id } });
    await prisma.supportTicket.delete({ where: { id } });

    return sendResponse({
      success: true,
      message: "Support ticket deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting support ticket:", error);
    return sendResponse({
      success: false,
      message: "Internal server error",
      status: 500,
    });
  }
}
