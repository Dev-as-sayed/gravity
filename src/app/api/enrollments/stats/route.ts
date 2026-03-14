// src/app/api/enrollments/stats/route.ts
import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { authenticate } from "@/lib/apiAuthenticator";
import { sendResponse } from "@/lib/sendResponse";

// GET /api/enrollments/stats - Get enrollment statistics
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

    // FIXED: Create proper where condition
    const whereCondition: any = {};

    if (auth.user?.role === "TEACHER" && auth.user.teacherId) {
      whereCondition.batch = {
        teacherId: auth.user.teacherId,
      };
    }

    const [
      totalEnrollments,
      statusDistribution,
      paymentDistribution,
      recentEnrollments,
      revenue,
    ] = await Promise.all([
      // Total enrollments
      prisma.enrollment.count({
        where: whereCondition,
      }),

      // Status distribution
      prisma.enrollment.groupBy({
        by: ["status"],
        where: whereCondition,
        _count: true,
      }),

      // Payment status distribution
      prisma.enrollment.groupBy({
        by: ["paymentStatus"],
        where: whereCondition,
        _count: true,
      }),

      // Recent enrollments
      prisma.enrollment.findMany({
        where: whereCondition,
        take: 10,
        orderBy: { appliedAt: "desc" },
        include: {
          student: {
            select: {
              name: true,
              profileImage: true,
            },
          },
          batch: {
            select: {
              name: true,
              subject: true,
            },
          },
        },
      }),

      // Total revenue
      prisma.payment.aggregate({
        where: whereCondition.batch
          ? {
              enrollment: {
                batch: {
                  teacherId: whereCondition.batch.teacherId,
                },
              },
            }
          : {},
        _sum: { amount: true },
      }),
    ]);

    // FIXED: Calculate monthly trend separately to avoid raw SQL issues
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const monthlyEnrollments = await prisma.enrollment.groupBy({
      by: ["appliedAt"],
      where: {
        ...whereCondition,
        appliedAt: {
          gte: sixMonthsAgo,
        },
      },
      _count: true,
    });

    // Process monthly trend data
    const monthlyTrend = monthlyEnrollments.reduce((acc: any, curr) => {
      const month = curr.appliedAt.toISOString().slice(0, 7); // YYYY-MM format
      acc[month] = (acc[month] || 0) + curr._count;
      return acc;
    }, {});

    const monthlyTrendArray = Object.entries(monthlyTrend).map(
      ([month, count]) => ({
        month,
        count,
      }),
    );

    // FIXED: Calculate completion rate safely
    const completedCount =
      statusDistribution.find((s) => s.status === "COMPLETED")?._count || 0;
    const completionRate =
      totalEnrollments > 0
        ? Math.round((Number(completedCount) / Number(totalEnrollments)) * 100)
        : 0;

    return sendResponse({
      success: true,
      message: "Enrollment statistics fetched successfully",
      data: {
        total: totalEnrollments,
        byStatus: statusDistribution,
        byPaymentStatus: paymentDistribution,
        monthlyTrend: monthlyTrendArray,
        recent: recentEnrollments,
        revenue: revenue._sum?.amount || 0,
        completionRate,
      },
    });
  } catch (error) {
    console.error("Error fetching enrollment statistics:", error);
    return sendResponse({
      success: false,
      message: "Internal server error",
      status: 500,
    });
  }
}
