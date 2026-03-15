// src/app/api/payments/stats/route.ts
import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { authenticate } from "@/lib/apiAuthenticator";
import { sendResponse } from "@/lib/sendResponse";
import { Prisma } from "@/generated/prisma/client";

// GET /api/payments/stats - Get payment statistics
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

    const isTeacher = auth.user?.role === "TEACHER";
    const teacherId = isTeacher ? auth.user.teacherId : undefined;

    // Build where condition for teacher
    const teacherWhere = teacherId
      ? { enrollment: { batch: { teacherId } } }
      : {};

    const [
      totalPayments,
      totalRevenue,
      paymentsByStatus,
      paymentsByMethod,
      monthlyRevenue,
      recentPayments,
      pendingVerification,
    ] = await Promise.all([
      // Total payments count
      prisma.payment.count({ where: teacherWhere }),

      // Total revenue
      prisma.payment.aggregate({
        where: { ...teacherWhere, status: "COMPLETED" },
        _sum: { amount: true },
      }),

      // Payments by status
      prisma.payment.groupBy({
        by: ["status"],
        where: teacherWhere,
        _count: true,
        _sum: { amount: true },
      }),

      // Payments by method
      prisma.payment.groupBy({
        by: ["method"],
        where: teacherWhere,
        _count: true,
        _sum: { amount: true },
      }),

      // Monthly revenue (last 6 months)
      prisma.$queryRaw`
        SELECT 
          DATE_TRUNC('month', "paymentDate") as month,
          COUNT(*) as count,
          SUM(amount) as revenue
        FROM "Payment"
        WHERE "paymentDate" >= NOW() - INTERVAL '6 months'
        ${teacherId ? Prisma.sql`AND "enrollmentId" IN (SELECT id FROM "Enrollment" WHERE "batchId" IN (SELECT id FROM "Batch" WHERE "teacherId" = ${teacherId}))` : Prisma.empty}
        GROUP BY DATE_TRUNC('month', "paymentDate")
        ORDER BY month DESC
      `,

      // Recent payments
      prisma.payment.findMany({
        where: teacherWhere,
        take: 10,
        orderBy: { paymentDate: "desc" },
        include: {
          student: {
            select: {
              name: true,
              profileImage: true,
            },
          },
          enrollment: {
            select: {
              batch: {
                select: {
                  name: true,
                },
              },
            },
          },
        },
      }),

      // Pending verification (manual payments)
      prisma.payment.count({
        where: {
          ...teacherWhere,
          method: "MANUAL",
          status: "PENDING",
        },
      }),
    ]);

    // Format monthly revenue data
    const monthlyData = Array.isArray(monthlyRevenue)
      ? monthlyRevenue.map((item: any) => ({
          month: item.month,
          count: Number(item.count),
          revenue: Number(item.revenue),
        }))
      : [];

    return sendResponse({
      success: true,
      message: "Payment statistics fetched successfully",
      data: {
        total: totalPayments,
        totalRevenue: totalRevenue._sum?.amount || 0,
        byStatus: paymentsByStatus,
        byMethod: paymentsByMethod,
        monthlyRevenue: monthlyData,
        recentPayments,
        pendingVerification,
        averagePayment:
          totalPayments > 0
            ? (totalRevenue._sum?.amount || 0) / totalPayments
            : 0,
      },
    });
  } catch (error) {
    console.error("Error fetching payment statistics:", error);
    return sendResponse({
      success: false,
      message: "Internal server error",
      status: 500,
    });
  }
}
