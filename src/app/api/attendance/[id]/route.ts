import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { authenticate } from "@/lib/apiAuthenticator";
import { sendResponse } from "@/lib/sendResponse";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = await authenticate(req, "TEACHER", "MODERATOR");
    if (!auth.success) {
      return sendResponse({ success: false, message: auth.error || "Unauthorized", status: auth.status || 401 });
    }
    const { id } = await params;
    const record = await prisma.attendance.findUnique({
      where: { id },
      include: {
        student: { select: { id: true, name: true, profileImage: true } },
        batch: { select: { id: true, name: true } },
      },
    });
    if (!record) {
      return sendResponse({ success: false, message: "Attendance record not found", status: 404 });
    }
    return sendResponse({ success: true, data: record });
  } catch (error) {
    console.error("Error fetching attendance:", error);
    return sendResponse({ success: false, message: "Internal server error", status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = await authenticate(req, "TEACHER", "MODERATOR");
    if (!auth.success) {
      return sendResponse({ success: false, message: auth.error || "Unauthorized", status: auth.status || 401 });
    }
    const { id } = await params;
    const body = await req.json();

    const record = await prisma.attendance.update({
      where: { id },
      data: {
        status: body.status,
        checkInTime: body.checkInTime ? new Date(body.checkInTime) : undefined,
        checkOutTime: body.checkOutTime ? new Date(body.checkOutTime) : undefined,
        duration: body.duration,
        lateReason: body.lateReason,
        notes: body.notes,
      },
    });

    return sendResponse({ success: true, data: record });
  } catch (error) {
    console.error("Error updating attendance:", error);
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
    await prisma.attendance.delete({ where: { id } });
    return sendResponse({ success: true, message: "Attendance record deleted" });
  } catch (error) {
    console.error("Error deleting attendance:", error);
    return sendResponse({ success: false, message: "Internal server error", status: 500 });
  }
}
