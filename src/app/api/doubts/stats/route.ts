// app/api/doubts/stats/route.ts
import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { authenticate } from "@/lib/apiAuthenticator";
import { sendResponse } from "@/lib/sendResponse";

// GET /api/doubts/stats - Get doubt statistics
export async function GET(req: NextRequest) {
  try {
    const auth = await authenticate(req, "ADMIN", "SUPER_ADMIN", "TEACHER");

    if (!auth.success) {
      return sendResponse({
        success: false,
        message: auth.error || "Unauthorized",
        status: auth.status || 401,
      });
    }

    const teacherFilter =
      auth.user?.role === "TEACHER" ? { assignedTo: auth.user.teacherId } : {};

    const [
      totalDoubts,
      openDoubts,
      answeredDoubts,
      resolvedDoubts,
      avgResponseTime,
      popularSubjects,
      topTeachers,
    ] = await Promise.all([
      // Total doubts
      prisma.doubt.count({ where: teacherFilter }),

      // Open doubts
      prisma.doubt.count({
        where: {
          ...teacherFilter,
          status: "OPEN",
        },
      }),

      // Answered doubts
      prisma.doubt.count({
        where: {
          ...teacherFilter,
          status: "ANSWERED",
        },
      }),

      // Resolved doubts
      prisma.doubt.count({
        where: {
          ...teacherFilter,
          status: "RESOLVED",
        },
      }),

      // Average response time (mock - you'd need to calculate this)
      Promise.resolve(120), // 2 hours in minutes

      // Popular subjects
      prisma.doubt.groupBy({
        by: ["subject"],
        where: teacherFilter,
        _count: true,
        orderBy: {
          _count: { subject: "desc" },
        },
        take: 5,
      }),

      // Top teachers by resolved doubts
      prisma.doubt.groupBy({
        by: ["assignedTo"],
        where: {
          ...teacherFilter,
          status: "RESOLVED",
          assignedTo: { not: null },
        },
        _count: true,
        orderBy: {
          _count: { assignedTo: "desc" },
        },
        take: 5,
      }),
    ]);

    return sendResponse({
      success: true,
      message: "Doubt statistics fetched successfully",
      data: {
        total: totalDoubts,
        open: openDoubts,
        answered: answeredDoubts,
        resolved: resolvedDoubts,
        avgResponseTime,
        popularSubjects,
        topTeachers,
        resolutionRate:
          totalDoubts > 0
            ? Math.round((resolvedDoubts / totalDoubts) * 100)
            : 0,
      },
    });
  } catch (error) {
    console.error("Error fetching doubt statistics:", error);
    return sendResponse({
      success: false,
      message: "Internal server error",
      status: 500,
    });
  }
}
