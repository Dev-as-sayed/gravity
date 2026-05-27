import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { authenticate } from "@/lib/apiAuthenticator";
import { sendResponse } from "@/lib/sendResponse";

export async function GET(req: NextRequest) {
  try {
    const auth = await authenticate(req, "TEACHER", "MODERATOR", "STUDENT");
    if (!auth.success) {
      return sendResponse({ success: false, message: auth.error || "Unauthorized", status: auth.status || 401 });
    }
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const skip = (page - 1) * limit;
    const batchId = searchParams.get("batchId");
    const isLive = searchParams.get("isLive");
    const isCompleted = searchParams.get("isCompleted");

    const where: any = {};
    if (batchId) where.batchId = batchId;
    if (isLive !== null) where.isLive = isLive === "true";
    if (isCompleted !== null) where.isCompleted = isCompleted === "true";

    if (auth.user?.role === "TEACHER" && auth.user.teacherId) {
      where.teacherId = auth.user.teacherId;
    }

    const [sessions, total] = await Promise.all([
      prisma.liveSession.findMany({
        where,
        skip,
        take: limit,
        orderBy: { startTime: "desc" },
        include: {
          batch: { select: { id: true, name: true, subject: true } },
          _count: { select: { attendees: true } },
        },
      }),
      prisma.liveSession.count({ where }),
    ]);

    return sendResponse({
      success: true,
      data: sessions,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit), hasNextPage: skip + limit < total, hasPreviousPage: page > 1 },
    });
  } catch (error) {
    console.error("Error fetching live sessions:", error);
    return sendResponse({ success: false, message: "Internal server error", status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const auth = await authenticate(req, "TEACHER");
    if (!auth.success) {
      return sendResponse({ success: false, message: auth.error || "Unauthorized", status: auth.status || 401 });
    }
    const body = await req.json();

    if (!body.title || !body.batchId) {
      return sendResponse({ success: false, message: "title and batchId required", status: 400 });
    }

    const startTime = new Date(body.startTime || Date.now());
    const duration = body.duration || 60;
    const endTime = new Date(startTime.getTime() + duration * 60000);

    const session = await prisma.liveSession.create({
      data: {
        title: body.title,
        description: body.description,
        teacherId: auth.user.teacherId!,
        batchId: body.batchId,
        startTime,
        endTime,
        duration,
        platform: body.platform || "Zoom",
        meetingUrl: body.meetingUrl,
        meetingId: body.meetingId,
        meetingPassword: body.meetingPassword,
      },
    });

    return sendResponse({ success: true, data: session, status: 201 });
  } catch (error) {
    console.error("Error creating live session:", error);
    return sendResponse({ success: false, message: "Internal server error", status: 500 });
  }
}
