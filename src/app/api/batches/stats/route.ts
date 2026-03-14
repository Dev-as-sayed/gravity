// src/app/api/batches/stats/route.ts
import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { authenticate } from "@/lib/apiAuthenticator";
import { sendResponse } from "@/lib/sendResponse";

// GET /api/batches/stats - Get batch statistics
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

    // FIXED: Build where condition properly
    const whereCondition: any = {};

    if (auth.user?.role === "TEACHER" && auth.user.teacherId) {
      whereCondition.teacherId = auth.user.teacherId;
    }

    const [
      totalBatches,
      activeBatches,
      upcomingBatches,
      ongoingBatches,
      completedBatches,
      totalEnrollments,
      totalRevenue,
      popularSubjects,
      modeDistribution,
    ] = await Promise.all([
      // Total batches
      prisma.batch.count({ where: whereCondition }),

      // Active batches
      prisma.batch.count({
        where: {
          ...whereCondition,
          isActive: true,
        },
      }),

      // Upcoming batches
      prisma.batch.count({
        where: {
          ...whereCondition,
          startDate: { gt: new Date() },
          isActive: true,
        },
      }),

      // Ongoing batches
      prisma.batch.count({
        where: {
          ...whereCondition,
          startDate: { lte: new Date() },
          endDate: { gte: new Date() },
          isActive: true,
        },
      }),

      // Completed batches
      prisma.batch.count({
        where: {
          ...whereCondition,
          endDate: { lt: new Date() },
        },
      }),

      // Total enrollments
      prisma.enrollment.count({
        where: whereCondition.teacherId
          ? { batch: { teacherId: whereCondition.teacherId } }
          : {},
      }),

      // Total revenue
      prisma.payment.aggregate({
        where: whereCondition.teacherId
          ? { enrollment: { batch: { teacherId: whereCondition.teacherId } } }
          : {},
        _sum: { amount: true },
      }),

      // Popular subjects
      prisma.batch.groupBy({
        by: ["subject"],
        where: whereCondition,
        _count: true,
        orderBy: {
          _count: { subject: "desc" },
        },
        take: 5,
      }),

      // Mode distribution
      prisma.batch.groupBy({
        by: ["mode"],
        where: whereCondition,
        _count: true,
      }),
    ]);

    return sendResponse({
      success: true,
      message: "Batch statistics fetched successfully",
      data: {
        total: totalBatches,
        active: activeBatches,
        upcoming: upcomingBatches,
        ongoing: ongoingBatches,
        completed: completedBatches,
        enrollments: totalEnrollments,
        revenue: totalRevenue._sum?.amount || 0,
        popularSubjects,
        modeDistribution,
        completionRate:
          totalBatches > 0
            ? Math.round((completedBatches / totalBatches) * 100)
            : 0,
      },
    });
  } catch (error) {
    console.error("Error fetching batch statistics:", error);
    return sendResponse({
      success: false,
      message: "Internal server error",
      status: 500,
    });
  }
}
