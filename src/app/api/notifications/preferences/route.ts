import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { authenticate } from "@/lib/apiAuthenticator";
import { sendResponse } from "@/lib/sendResponse";

export async function GET(req: NextRequest) {
  try {
    const auth = await authenticate(req, "STUDENT");
    if (!auth.success) {
      return sendResponse({ success: false, message: auth.error || "Unauthorized", status: auth.status || 401 });
    }
    const prefs = await prisma.notificationPreference.findUnique({ where: { userId: auth.user.id } });
    return sendResponse({ success: true, data: prefs });
  } catch (error) {
    console.error("Error fetching preferences:", error);
    return sendResponse({ success: false, message: "Internal server error", status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const auth = await authenticate(req, "STUDENT");
    if (!auth.success) {
      return sendResponse({ success: false, message: auth.error || "Unauthorized", status: auth.status || 401 });
    }
    const body = await req.json();
    const prefs = await prisma.notificationPreference.upsert({
      where: { userId: auth.user.id },
      update: body,
      create: { userId: auth.user.id, ...body },
    });
    return sendResponse({ success: true, data: prefs });
  } catch (error) {
    console.error("Error updating preferences:", error);
    return sendResponse({ success: false, message: "Internal server error", status: 500 });
  }
}
