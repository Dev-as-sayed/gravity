import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { authenticate } from "@/lib/apiAuthenticator";
import { sendResponse } from "@/lib/sendResponse";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = await authenticate(req, "TEACHER", "MODERATOR", "STUDENT");
    if (!auth.success) {
      return sendResponse({ success: false, message: auth.error || "Unauthorized", status: auth.status || 401 });
    }
    const { id } = await params;
    const session = await prisma.liveSession.findUnique({
      where: { id },
      include: {
        batch: { select: { id: true, name: true } },
        attendees: {
          include: {
            student: { select: { id: true, name: true, profileImage: true } },
          },
        },
      },
    });
    if (!session) {
      return sendResponse({ success: false, message: "Live session not found", status: 404 });
    }
    return sendResponse({ success: true, data: session });
  } catch (error) {
    console.error("Error fetching live session:", error);
    return sendResponse({ success: false, message: "Internal server error", status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = await authenticate(req, "TEACHER");
    if (!auth.success) {
      return sendResponse({ success: false, message: auth.error || "Unauthorized", status: auth.status || 401 });
    }
    const { id } = await params;
    const body = await req.json();

    const data: any = {};
    if (body.title) data.title = body.title;
    if (body.description !== undefined) data.description = body.description;
    if (body.startTime) data.startTime = new Date(body.startTime);
    if (body.endTime) data.endTime = new Date(body.endTime);
    if (body.duration) data.duration = body.duration;
    if (body.platform) data.platform = body.platform;
    if (body.meetingUrl !== undefined) data.meetingUrl = body.meetingUrl;
    if (body.meetingId !== undefined) data.meetingId = body.meetingId;
    if (body.meetingPassword !== undefined) data.meetingPassword = body.meetingPassword;
    if (body.recordingUrl !== undefined) data.recordingUrl = body.recordingUrl;
    if (body.isLive !== undefined) data.isLive = body.isLive;
    if (body.isCompleted !== undefined) data.isCompleted = body.isCompleted;
    if (body.isRecorded !== undefined) data.isRecorded = body.isRecorded;
    if (body.recordingAvailable !== undefined) data.recordingAvailable = body.recordingAvailable;

    const session = await prisma.liveSession.update({ where: { id }, data });
    return sendResponse({ success: true, data: session });
  } catch (error) {
    console.error("Error updating live session:", error);
    return sendResponse({ success: false, message: "Internal server error", status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = await authenticate(req, "TEACHER");
    if (!auth.success) {
      return sendResponse({ success: false, message: auth.error || "Unauthorized", status: auth.status || 401 });
    }
    const { id } = await params;
    await prisma.liveSession.delete({ where: { id } });
    return sendResponse({ success: true, message: "Live session deleted" });
  } catch (error) {
    console.error("Error deleting live session:", error);
    return sendResponse({ success: false, message: "Internal server error", status: 500 });
  }
}
