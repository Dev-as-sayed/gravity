// src/app/api/reported/stats/route.ts
import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { authenticate } from "@/lib/apiAuthenticator";
import { sendResponse } from "@/lib/sendResponse";

// GET /api/reported/stats - Get reported content statistics
export async function GET(req: NextRequest) {
  try {
    const auth = await authenticate(req, "TEACHER", "MODERATOR");

    if (!auth.success) {
      return sendResponse({
        success: false,
        message: auth.error || "Unauthorized",
        status: auth.status || 401,
      });
    }

    const [total, byStatus, byType] = await Promise.all([
      prisma.reportedContent.count(),
      prisma.reportedContent.groupBy({
        by: ["status"],
        _count: true,
      }),
      prisma.reportedContent.groupBy({
        by: ["entityType"],
        _count: true,
      }),
    ]);

    return sendResponse({
      success: true,
      message: "Report statistics fetched successfully",
      data: { total, byStatus, byType },
    });
  } catch (error) {
    console.error("Error fetching report statistics:", error);
    return sendResponse({
      success: false,
      message: "Internal server error",
      status: 500,
    });
  }
}
