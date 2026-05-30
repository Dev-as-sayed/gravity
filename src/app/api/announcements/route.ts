// src/app/api/announcements/route.ts
import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { authenticate } from "@/lib/apiAuthenticator";
import { sendResponse } from "@/lib/sendResponse";

// GET /api/announcements - List all announcements
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
    const limit = parseInt(searchParams.get("limit") || "10");
    const search = searchParams.get("search");
    const teacherId = searchParams.get("teacherId");
    const batchId = searchParams.get("batchId");

    const skip = (page - 1) * limit;

    const where: any = {};

    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { content: { contains: search, mode: "insensitive" } },
      ];
    }
    if (teacherId) where.createdBy = teacherId;
    if (batchId) where.batchId = batchId;

    if (auth.user?.role === "TEACHER") {
      where.createdBy = auth.user.teacherId;
    }

    const [announcements, total] = await Promise.all([
      prisma.announcement.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          batch: { select: { id: true, name: true } },
        },
      }),
      prisma.announcement.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return sendResponse({
      success: true,
      message: "Announcements fetched successfully",
      data: announcements,
      meta: { page, limit, total, totalPages },
    });
  } catch (error) {
    console.error("Error fetching announcements:", error);
    return sendResponse({
      success: false,
      message: "Internal server error",
      status: 500,
    });
  }
}

// POST /api/announcements - Create a new announcement
export async function POST(req: NextRequest) {
  try {
    const auth = await authenticate(req, "TEACHER", "MODERATOR");

    if (!auth.success) {
      return sendResponse({
        success: false,
        message: auth.error || "Unauthorized",
        status: auth.status || 401,
      });
    }

    const body = await req.json();
    const { title, content, batchId, isUrgent, isPinned } = body;

    if (!title || !content) {
      return sendResponse({
        success: false,
        message: "Title and content are required",
        status: 400,
      });
    }

    const announcement = await prisma.announcement.create({
      data: {
        title,
        content,
        batchId: batchId || null,
        isUrgent: isUrgent || false,
        isPinned: isPinned || false,
        createdBy: auth.user.teacherId || auth.user.moderatorId || auth.user.id,
      },
    });

    return sendResponse({
      success: true,
      message: "Announcement created successfully",
      data: announcement,
      status: 201,
    });
  } catch (error) {
    console.error("Error creating announcement:", error);
    return sendResponse({
      success: false,
      message: "Internal server error",
      status: 500,
    });
  }
}
