// src/app/api/analytics/route.ts
import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { authenticate } from "@/lib/apiAuthenticator";
import { sendResponse } from "@/lib/sendResponse";

// GET /api/analytics - Dashboard analytics overview
export async function GET(req: NextRequest) {
  try {
    const auth = await authenticate(req, "TEACHER");

    if (!auth.success) {
      return sendResponse({
        success: false,
        message: auth.error || "Unauthorized",
        status: auth.status || 401,
      });
    }

    const teacherFilter =
      auth.user?.role === "TEACHER" && auth.user.teacherId
        ? { teacherId: auth.user.teacherId }
        : {};

    const [
      totalUsers,
      totalStudents,
      totalTeachers,
      totalModerators,
      totalCourses,
      totalBatches,
      totalEnrollments,
      totalRevenue,
      recentEnrollments,
      activeStudents,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.student.count(),
      prisma.teacher.count(),
      prisma.moderator.count(),
      prisma.course.count({
        where: auth.user.teacherId ? { teacherId: auth.user.teacherId } : {},
      }),
      prisma.batch.count({ where: teacherFilter }),
      prisma.enrollment.count({
        where: teacherFilter.teacherId
          ? { batch: { teacherId: teacherFilter.teacherId } }
          : {},
      }),
      prisma.payment.aggregate({
        where: teacherFilter.teacherId
          ? { enrollment: { batch: { teacherId: teacherFilter.teacherId } } }
          : {},
        _sum: { amount: true },
      }),
      prisma.enrollment.count({
        where: {
          ...(teacherFilter.teacherId
            ? { batch: { teacherId: teacherFilter.teacherId } }
            : {}),
          createdAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
        },
      }),
      prisma.student.count({
        where: { user: { isActive: true } },
      }),
    ]);

    return sendResponse({
      success: true,
      message: "Analytics fetched successfully",
      data: {
        users: totalUsers,
        students: totalStudents,
        teachers: totalTeachers,
        moderators: totalModerators,
        courses: totalCourses,
        batches: totalBatches,
        enrollments: totalEnrollments,
        revenue: totalRevenue._sum?.amount || 0,
        recentEnrollments,
        activeStudents,
        completionRate:
          totalStudents > 0
            ? Math.round((activeStudents / totalStudents) * 100)
            : 0,
      },
    });
  } catch (error) {
    console.error("Error fetching analytics:", error);
    return sendResponse({
      success: false,
      message: "Internal server error",
      status: 500,
    });
  }
}
