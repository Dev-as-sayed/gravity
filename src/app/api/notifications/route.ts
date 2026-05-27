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
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const skip = (page - 1) * limit;

    const [notifications, total] = await Promise.all([
      prisma.notification.findMany({
        where: { userId: auth.user.id },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.notification.count({ where: { userId: auth.user.id } }),
    ]);

    return sendResponse({
      success: true,
      data: notifications,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit), hasNextPage: skip + limit < total, hasPreviousPage: page > 1 },
    });
  } catch (error) {
    console.error("Error fetching notifications:", error);
    return sendResponse({ success: false, message: "Internal server error", status: 500 });
  }
}
