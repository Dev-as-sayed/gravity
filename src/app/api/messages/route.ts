// src/app/api/messages/route.ts
import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { authenticate } from "@/lib/apiAuthenticator";
import { sendResponse } from "@/lib/sendResponse";

// GET /api/messages - List unique conversations
export async function GET(req: NextRequest) {
  try {
    const auth = await authenticate(req, "TEACHER", "STUDENT", "MODERATOR");

    if (!auth.success) {
      return sendResponse({
        success: false,
        message: auth.error || "Unauthorized",
        status: auth.status || 401,
      });
    }

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");

    const skip = (page - 1) * limit;

    const userId = auth.user.id;

    const sentMessages = await prisma.message.findMany({
      where: { senderId: userId },
      orderBy: { createdAt: "desc" },
      select: { receiverId: true, createdAt: true },
    });

    const receivedMessages = await prisma.message.findMany({
      where: { receiverId: userId },
      orderBy: { createdAt: "desc" },
      select: { senderId: true, createdAt: true },
    });

    const participantMap = new Map<string, Date>();

    for (const msg of sentMessages) {
      const existing = participantMap.get(msg.receiverId);
      if (!existing || msg.createdAt > existing) {
        participantMap.set(msg.receiverId, msg.createdAt);
      }
    }

    for (const msg of receivedMessages) {
      const existing = participantMap.get(msg.senderId);
      if (!existing || msg.createdAt > existing) {
        participantMap.set(msg.senderId, msg.createdAt);
      }
    }

    const participants = Array.from(participantMap.entries())
      .sort((a, b) => b[1].getTime() - a[1].getTime());

    const total = participants.length;
    const paginatedParticipants = participants.slice(skip, skip + limit);

    const conversations = await Promise.all(
      paginatedParticipants.map(async ([participantId, lastMessageAt]) => {
        const [participant, lastMessage] = await Promise.all([
          prisma.user.findUnique({
            where: { id: participantId },
            select: { id: true, name: true, email: true, role: true, profileImage: true },
          }),
          prisma.message.findFirst({
            where: {
              OR: [
                { senderId: userId, receiverId: participantId },
                { senderId: participantId, receiverId: userId },
              ],
            },
            orderBy: { createdAt: "desc" },
          }),
        ]);

        return {
          participant,
          lastMessage,
          unreadCount: 0,
        };
      }),
    );

    const totalPages = Math.ceil(total / limit);

    return sendResponse({
      success: true,
      message: "Conversations fetched successfully",
      data: conversations,
      meta: { page, limit, total, totalPages },
    });
  } catch (error) {
    console.error("Error fetching conversations:", error);
    return sendResponse({
      success: false,
      message: "Internal server error",
      status: 500,
    });
  }
}

// POST /api/messages - Send a message
export async function POST(req: NextRequest) {
  try {
    const auth = await authenticate(req, "TEACHER", "STUDENT", "MODERATOR");

    if (!auth.success) {
      return sendResponse({
        success: false,
        message: auth.error || "Unauthorized",
        status: auth.status || 401,
      });
    }

    const body = await req.json();
    const { receiverId, content } = body;

    if (!receiverId || !content) {
      return sendResponse({
        success: false,
        message: "Receiver ID and content are required",
        status: 400,
      });
    }

    const receiver = await prisma.user.findUnique({
      where: { id: receiverId },
    });

    if (!receiver) {
      return sendResponse({
        success: false,
        message: "Receiver not found",
        status: 404,
      });
    }

    const message = await prisma.message.create({
      data: {
        senderId: auth.user.id,
        receiverId,
        content,
      },
      include: {
        sender: {
          select: { id: true, name: true, email: true, role: true, profileImage: true },
        },
        receiver: {
          select: { id: true, name: true, email: true, role: true, profileImage: true },
        },
      },
    });

    return sendResponse({
      success: true,
      message: "Message sent successfully",
      data: message,
      status: 201,
    });
  } catch (error) {
    console.error("Error sending message:", error);
    return sendResponse({
      success: false,
      message: "Internal server error",
      status: 500,
    });
  }
}
