// src/app/api/blogs/stats/route.ts
import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { authenticate } from "@/lib/apiAuthenticator";
import { sendResponse } from "@/lib/sendResponse";

// GET /api/blogs/stats - Get blog statistics
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

    // Build where condition
    const whereCondition: any = {};
    if (teacherId) {
      whereCondition.teacherId = teacherId;
    }

    const [
      totalBlogs,
      publishedBlogs,
      draftBlogs,
      totalViews,
      totalComments,
      pendingComments,
      allBlogs,
    ] = await Promise.all([
      // Total blogs
      prisma.blog.count({ where: whereCondition }),

      // Published blogs
      prisma.blog.count({
        where: { ...whereCondition, isPublished: true },
      }),

      // Draft blogs
      prisma.blog.count({
        where: { ...whereCondition, isPublished: false },
      }),

      // Total views
      prisma.blog.aggregate({
        where: whereCondition,
        _sum: { views: true },
      }),

      // Total comments
      prisma.blogComment.count({
        where: teacherId ? { blog: { teacherId } } : {},
      }),

      // Pending comments
      prisma.blogComment.count({
        where: teacherId
          ? { blog: { teacherId }, status: "PENDING" }
          : { status: "PENDING" },
      }),

      // Get all blogs for category and tag aggregation
      teacherId
        ? prisma.blog.findMany({
            where: { teacherId },
            select: { categories: true, tags: true },
          })
        : prisma.blog.findMany({
            select: { categories: true, tags: true },
          }),
    ]);

    // Process categories manually
    const categoryCount: Record<string, number> = {};
    const tagCount: Record<string, number> = {};

    allBlogs.forEach((blog) => {
      blog.categories.forEach((cat) => {
        categoryCount[cat] = (categoryCount[cat] || 0) + 1;
      });
      blog.tags.forEach((tag) => {
        tagCount[tag] = (tagCount[tag] || 0) + 1;
      });
    });

    // Get top categories
    const popularCategories = Object.entries(categoryCount)
      .map(([category, count]) => ({ category, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    // Get top tags
    const popularTags = Object.entries(tagCount)
      .map(([tag, count]) => ({ tag, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    // Get top authors
    const topAuthors = await prisma.teacher.findMany({
      where: teacherId ? { id: teacherId } : {},
      select: {
        id: true,
        name: true,
        _count: {
          select: { blogs: true },
        },
        blogs: {
          select: { views: true },
        },
      },
      orderBy: {
        blogs: {
          _count: "desc",
        },
      },
      take: 10,
    });

    const formattedTopAuthors = topAuthors.map((author) => ({
      id: author.id,
      name: author.name,
      blog_count: author._count.blogs,
      total_views: author.blogs.reduce((sum, blog) => sum + blog.views, 0),
    }));

    return sendResponse({
      success: true,
      message: "Blog statistics fetched successfully",
      data: {
        total: totalBlogs,
        published: publishedBlogs,
        draft: draftBlogs,
        views: totalViews._sum?.views || 0,
        comments: totalComments,
        pendingComments,
        popularCategories,
        popularTags,
        topAuthors: formattedTopAuthors,
        publishRate:
          totalBlogs > 0 ? Math.round((publishedBlogs / totalBlogs) * 100) : 0,
      },
    });
  } catch (error) {
    console.error("Error fetching blog statistics:", error);
    return sendResponse({
      success: false,
      message: "Internal server error",
      status: 500,
    });
  }
}
