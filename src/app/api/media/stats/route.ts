// src/app/api/media/stats/route.ts
import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { authenticate } from "@/lib/apiAuthenticator";
import { sendResponse } from "@/lib/sendResponse";

// GET /api/media/stats - Get media statistics
export async function GET(req: NextRequest) {
  try {
    const auth = await authenticate(req, "ADMIN", "SUPER_ADMIN");

    if (!auth.success) {
      return sendResponse({
        success: false,
        message: auth.error || "Unauthorized",
        status: auth.status || 401,
      });
    }

    const [
      totalPosts,
      publishedPosts,
      draftPosts,
      totalViews,
      totalReactions,
      totalComments,
      popularTags,
      popularTopics,
      authorStats,
    ] = await Promise.all([
      // Total posts
      prisma.post.count(),

      // Published posts
      prisma.post.count({
        where: { status: "PUBLISHED" },
      }),

      // Draft posts
      prisma.post.count({
        where: { status: "DRAFT" },
      }),

      // Total views
      prisma.post.aggregate({
        _sum: { views: true },
      }),

      // Total reactions
      prisma.postReaction.count(),

      // Total comments
      prisma.comment.count(),

      // Popular tags
      prisma.$queryRaw`
        SELECT 
          unnest(tags) as tag,
          COUNT(*) as count
        FROM "Post"
        GROUP BY tag
        ORDER BY count DESC
        LIMIT 10
      `,

      // Popular topics
      prisma.$queryRaw`
        SELECT 
          unnest(topics) as topic,
          COUNT(*) as count
        FROM "Post"
        GROUP BY topic
        ORDER BY count DESC
        LIMIT 10
      `,

      // Author stats
      prisma.$queryRaw`
        SELECT 
          'Teacher' as role,
          t.id,
          t.name,
          COUNT(p.id) as post_count
        FROM "Teacher" t
        LEFT JOIN "Post" p ON t.id = p."teacherId"
        GROUP BY t.id, t.name
        UNION ALL
        SELECT 
          'Student' as role,
          s.id,
          s.name,
          COUNT(p.id) as post_count
        FROM "Student" s
        LEFT JOIN "Post" p ON s.id = p."studentId"
        GROUP BY s.id, s.name
        ORDER BY post_count DESC
        LIMIT 10
      `,
    ]);

    return sendResponse({
      success: true,
      message: "Media statistics fetched successfully",
      data: {
        total: totalPosts,
        published: publishedPosts,
        draft: draftPosts,
        views: totalViews._sum?.views || 0,
        reactions: totalReactions,
        comments: totalComments,
        popularTags,
        popularTopics,
        topAuthors: authorStats,
        engagementRate:
          totalPosts > 0
            ? Math.round(
                ((totalReactions + totalComments) / totalPosts) * 100,
              ) / 100
            : 0,
      },
    });
  } catch (error) {
    console.error("Error fetching media statistics:", error);
    return sendResponse({
      success: false,
      message: "Internal server error",
      status: 500,
    });
  }
}
