// src/app/api/announcements/stats/route.ts
import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { authenticate } from "@/lib/apiAuthenticator";
import { sendResponse } from "@/lib/sendResponse";

// GET /api/announcements/stats - Get announcement statistics
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

    const teacherFilter: any =
      auth.user?.role === "TEACHER" ? { createdBy: auth.user.teacherId } : {};

    const [total, urgent, pinned, byBatch] = await Promise.all([
      prisma.announcement.count({ where: teacherFilter }),
      prisma.announcement.count({
        where: { ...teacherFilter, isUrgent: true },
      }),
      prisma.announcement.count({
        where: { ...teacherFilter, isPinned: true },
      }),
      prisma.announcement.groupBy({
        by: ["batchId"],
        where: teacherFilter,
        _count: true,
      }),
    ]);

    return sendResponse({
      success: true,
      message: "Announcement statistics fetched successfully",
      data: { total, urgent, pinned, byBatch },
    });
  } catch (error) {
    console.error("Error fetching announcement statistics:", error);
    return sendResponse({
      success: false,
      message: "Internal server error",
      status: 500,
    });
  }
}
