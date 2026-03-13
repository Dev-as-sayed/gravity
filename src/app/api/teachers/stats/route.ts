// src/app/api/teachers/stats/route.ts
import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { authenticate } from "@/lib/apiAuthenticator";
import { sendResponse } from "@/lib/sendResponse";

// GET /api/teachers/stats - Get teacher statistics (Admin only)
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
      totalTeachers,
      activeTeachers,
      inactiveTeachers,
      teachersByExperience,
      topTeachers,
      subjectDistribution,
    ] = await Promise.all([
      // Total teachers
      prisma.teacher.count(),

      // Active teachers
      prisma.teacher.count({
        where: { user: { isActive: true } },
      }),

      // Inactive teachers
      prisma.teacher.count({
        where: { user: { isActive: false } },
      }),

      // Teachers by experience range
      prisma.$queryRaw`
        SELECT 
          CASE 
            WHEN experience < 2 THEN '0-2 years'
            WHEN experience BETWEEN 2 AND 5 THEN '2-5 years'
            WHEN experience BETWEEN 5 AND 10 THEN '5-10 years'
            ELSE '10+ years'
          END as range,
          COUNT(*) as count
        FROM "Teacher"
        GROUP BY range
      `,

      // Top teachers by ratings
      prisma.teacher.findMany({
        where: { averageRating: { gt: 0 } },
        orderBy: { averageRating: "desc" },
        take: 5,
        select: {
          id: true,
          name: true,
          averageRating: true,
          totalStudents: true,
          user: {
            select: {
              email: true,
            },
          },
        },
      }),

      // Subject expertise distribution
      prisma.$queryRaw`
        SELECT 
          unnest(expertise) as subject,
          COUNT(*) as teacher_count
        FROM "Teacher"
        GROUP BY subject
        ORDER BY teacher_count DESC
      `,
    ]);

    return sendResponse({
      success: true,
      message: "Teacher statistics fetched successfully",
      data: {
        total: totalTeachers,
        active: activeTeachers,
        inactive: inactiveTeachers,
        byExperience: teachersByExperience,
        topTeachers,
        subjectDistribution,
        completionRate:
          totalTeachers > 0
            ? Math.round((activeTeachers / totalTeachers) * 100)
            : 0,
      },
    });
  } catch (error) {
    console.error("Error fetching teacher statistics:", error);
    return sendResponse({
      success: false,
      message: "Internal server error",
      status: 500,
    });
  }
}
