import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { authenticate } from "@/lib/apiAuthenticator";
import { sendResponse } from "@/lib/sendResponse";

export async function POST(req: NextRequest) {
  try {
    const auth = await authenticate(req, "STUDENT");
    if (!auth.success) {
      return sendResponse({ success: false, message: auth.error || "Unauthorized", status: auth.status || 401 });
    }
    await prisma.notification.deleteMany({ where: { userId: auth.user.id } });
    return sendResponse({ success: true, message: "All notifications cleared" });
  } catch (error) {
    console.error("Error clearing notifications:", error);
    return sendResponse({ success: false, message: "Internal server error", status: 500 });
  }
}
