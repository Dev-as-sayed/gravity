// src/app/api/messages/conversation/route.ts
import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { authenticate } from "@/lib/apiAuthenticator";
import { sendResponse } from "@/lib/sendResponse";

// GET /api/messages/conversation - Get full conversation between two users
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
    const otherUserId = searchParams.get("otherUserId");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "50");

    if (!otherUserId) {
      return sendResponse({
        success: false,
        message: "otherUserId query parameter is required",
        status: 400,
      });
    }

    const skip = (page - 1) * limit;

    const userId = auth.user.id;

    const where = {
      OR: [
        { senderId: userId, receiverId: otherUserId },
        { senderId: otherUserId, receiverId: userId },
      ],
    };

    const [messages, total] = await Promise.all([
      prisma.message.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          sender: {
            select: { id: true, name: true, email: true, role: true, profileImage: true },
          },
          receiver: {
            select: { id: true, name: true, email: true, role: true, profileImage: true },
          },
        },
      }),
      prisma.message.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return sendResponse({
      success: true,
      message: "Conversation fetched successfully",
      data: messages.reverse(),
      meta: { page, limit, total, totalPages },
    });
  } catch (error) {
    console.error("Error fetching conversation:", error);
    return sendResponse({
      success: false,
      message: "Internal server error",
      status: 500,
    });
  }
}
