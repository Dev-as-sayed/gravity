// src/app/api/support/stats/route.ts
import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { authenticate } from "@/lib/apiAuthenticator";
import { sendResponse } from "@/lib/sendResponse";

// GET /api/support/stats - Get support ticket statistics
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

    const [total, byStatus, byPriority, resolvedTickets] = await Promise.all([
      prisma.supportTicket.count(),
      prisma.supportTicket.groupBy({
        by: ["status"],
        _count: true,
      }),
      prisma.supportTicket.groupBy({
        by: ["priority"],
        _count: true,
      }),
      prisma.supportTicket.findMany({
        where: {
          status: "RESOLVED",
          resolvedAt: { not: null },
        },
        select: {
          createdAt: true,
          resolvedAt: true,
        },
      }),
    ]);

    let avgResolutionTime = 0;
    if (resolvedTickets.length > 0) {
      const totalMinutes = resolvedTickets.reduce((sum, t) => {
        if (t.createdAt && t.resolvedAt) {
          return sum + (t.resolvedAt.getTime() - t.createdAt.getTime()) / (1000 * 60);
        }
        return sum;
      }, 0);
      avgResolutionTime = Math.round(totalMinutes / resolvedTickets.length);
    }

    return sendResponse({
      success: true,
      message: "Support statistics fetched successfully",
      data: {
        total,
        byStatus,
        byPriority,
        avgResolutionTime,
      },
    });
  } catch (error) {
    console.error("Error fetching support statistics:", error);
    return sendResponse({
      success: false,
      message: "Internal server error",
      status: 500,
    });
  }
}
