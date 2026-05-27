import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { authenticate } from "@/lib/apiAuthenticator";
import { sendResponse } from "@/lib/sendResponse";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = await authenticate(req, "STUDENT");
    if (!auth.success) {
      return sendResponse({ success: false, message: auth.error || "Unauthorized", status: auth.status || 401 });
    }
    const { id } = await params;
    const notification = await prisma.notification.findUnique({ where: { id } });
    if (!notification || notification.userId !== auth.user.id) {
      return sendResponse({ success: false, message: "Notification not found", status: 404 });
    }
    await prisma.notification.update({ where: { id }, data: { isRead: true, readAt: new Date() } });
    return sendResponse({ success: true, message: "Marked as read" });
  } catch (error) {
    console.error("Error marking notification as read:", error);
    return sendResponse({ success: false, message: "Internal server error", status: 500 });
  }
}
