// src/app/api/students/stats/route.ts
import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { authenticate } from "@/lib/apiAuthenticator";
import { sendResponse } from "@/lib/sendResponse";

// GET /api/students/stats - Get student statistics (Admin only)
export async function GET(req: NextRequest) {
  try {
    // Authenticate - only ADMIN and SUPER_ADMIN can access
    const auth = await authenticate(req, "ADMIN", "SUPER_ADMIN");

    if (!auth.success) {
      return sendResponse({
        success: false,
        message: auth.error || "Unauthorized",
        status: auth.status || 401,
      });
    }

    // Get statistics
    const [
      totalStudents,
      activeStudents,
      inactiveStudents,
      studentsByClass,
      studentsByBoard,
      enrollmentStats,
      topPerformers,
      recentRegistrations,
    ] = await Promise.all([
      // Total students
      prisma.student.count(),

      // Active students
      prisma.student.count({
        where: { user: { isActive: true } },
      }),

      // Inactive students
      prisma.student.count({
        where: { user: { isActive: false } },
      }),

      // Students by class
      prisma.student.groupBy({
        by: ["class"],
        _count: true,
        orderBy: {
          class: "asc",
        },
      }),

      // Students by board
      prisma.student.groupBy({
        by: ["board"],
        _count: true,
      }),

      // Enrollment statistics
      prisma.enrollment.groupBy({
        by: ["status"],
        _count: true,
      }),

      // Top performers (students with highest average score)
      prisma.student.findMany({
        where: {
          averageScore: { gt: 0 },
        },
        orderBy: {
          averageScore: "desc",
        },
        take: 5,
        select: {
          id: true,
          name: true,
          averageScore: true,
          class: true,
          user: {
            select: {
              email: true,
            },
          },
        },
      }),

      // Recent registrations (last 30 days)
      prisma.student.count({
        where: {
          createdAt: {
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
          },
        },
      }),
    ]);

    // Get gender distribution
    const genderDistribution = await prisma.student.groupBy({
      by: ["gender"],
      _count: true,
    });

    // Get guardian coverage
    const studentsWithGuardian = await prisma.student.count({
      where: { guardianId: { not: null } },
    });

    return sendResponse({
      success: true,
      message: "Student statistics fetched successfully",
      data: {
        total: totalStudents,
        active: activeStudents,
        inactive: inactiveStudents,
        byClass: studentsByClass,
        byBoard: studentsByBoard,
        byGender: genderDistribution,
        enrollmentStats,
        topPerformers,
        recentRegistrations,
        guardianCoverage: {
          withGuardian: studentsWithGuardian,
          withoutGuardian: totalStudents - studentsWithGuardian,
          percentage:
            totalStudents > 0
              ? Math.round((studentsWithGuardian / totalStudents) * 100)
              : 0,
        },
        completionRate:
          totalStudents > 0
            ? Math.round((activeStudents / totalStudents) * 100)
            : 0,
      },
    });
  } catch (error) {
    console.error("Error fetching student statistics:", error);
    return sendResponse({
      success: false,
      message: "Internal server error",
      status: 500,
    });
  }
}
