// src/app/api/notes/stats/route.ts
import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { authenticate } from "@/lib/apiAuthenticator";
import { sendResponse } from "@/lib/sendResponse";

// GET /api/notes/stats - Get note statistics
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

    const whereCondition: any = {};
    if (teacherId) {
      whereCondition.teacherId = teacherId;
    }

    const [
      totalNotes,
      publicNotes,
      premiumNotes,
      totalDownloads,
      totalViews,
      popularSubjects,
      difficultyDistribution,
      topAuthors,
    ] = await Promise.all([
      // Total notes
      prisma.note.count({ where: whereCondition }),

      // Public notes
      prisma.note.count({
        where: { ...whereCondition, isPublic: true },
      }),

      // Premium notes
      prisma.note.count({
        where: { ...whereCondition, isPremium: true },
      }),

      // Total downloads
      prisma.note.aggregate({
        where: whereCondition,
        _sum: { downloads: true },
      }),

      // Total views
      prisma.note.aggregate({
        where: whereCondition,
        _sum: { views: true },
      }),

      // Popular subjects
      prisma.note.groupBy({
        by: ["subject"],
        where: whereCondition,
        _count: true,
        orderBy: {
          _count: { subject: "desc" },
        },
        take: 5,
      }),

      // Difficulty distribution
      prisma.note.groupBy({
        by: ["difficulty"],
        where: whereCondition,
        _count: true,
      }),

      // Top authors by downloads
      prisma.teacher.findMany({
        where: teacherId ? { id: teacherId } : {},
        select: {
          id: true,
          name: true,
          profileImage: true,
          _count: {
            select: { notes: true },
          },
          notes: {
            select: { downloads: true, views: true },
          },
        },
        orderBy: {
          notes: {
            _count: "desc",
          },
        },
        take: 10,
      }),
    ]);

    const formattedTopAuthors = topAuthors.map((author) => ({
      id: author.id,
      name: author.name,
      profileImage: author.profileImage,
      note_count: author._count.notes,
      total_downloads: author.notes.reduce(
        (sum, note) => sum + note.downloads,
        0,
      ),
      total_views: author.notes.reduce((sum, note) => sum + note.views, 0),
    }));

    return sendResponse({
      success: true,
      message: "Note statistics fetched successfully",
      data: {
        total: totalNotes,
        public: publicNotes,
        premium: premiumNotes,
        downloads: totalDownloads._sum?.downloads || 0,
        views: totalViews._sum?.views || 0,
        popularSubjects,
        difficultyDistribution,
        topAuthors: formattedTopAuthors,
        premiumRate:
          totalNotes > 0 ? Math.round((premiumNotes / totalNotes) * 100) : 0,
      },
    });
  } catch (error) {
    console.error("Error fetching note statistics:", error);
    return sendResponse({
      success: false,
      message: "Internal server error",
      status: 500,
    });
  }
}
