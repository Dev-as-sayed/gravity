// src/app/api/blogs/route.ts
import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { authenticate } from "@/lib/apiAuthenticator";
import { sendResponse } from "@/lib/sendResponse";

// GET /api/blogs - Get all blogs with filters
export async function GET(req: NextRequest) {
  try {
    const auth = await authenticate(
      req,
      "ADMIN",
      "SUPER_ADMIN",
      "TEACHER",
      "STUDENT",
      "GUARDIAN",
    );

    if (!auth.success) {
      return sendResponse({
        success: false,
        message: auth.error || "Unauthorized",
        status: auth.status || 401,
      });
    }

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const search = searchParams.get("search");
    const category = searchParams.get("category");
    const tag = searchParams.get("tag");
    const teacherId = searchParams.get("teacherId");
    const isPublished = searchParams.get("isPublished");
    const fromDate = searchParams.get("fromDate");
    const toDate = searchParams.get("toDate");
    const sortBy = searchParams.get("sortBy") || "publishedAt";
    const sortOrder = searchParams.get("sortOrder") || "desc";

    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {};

    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { content: { contains: search, mode: "insensitive" } },
        { excerpt: { contains: search, mode: "insensitive" } },
      ];
    }

    if (category) {
      where.categories = { has: category };
    }

    if (tag) {
      where.tags = { has: tag };
    }

    if (teacherId) {
      where.teacherId = teacherId;
    }

    if (isPublished !== null) {
      where.isPublished = isPublished === "true";
    }

    if (fromDate || toDate) {
      where.publishedAt = {};
      if (fromDate) where.publishedAt.gte = new Date(fromDate);
      if (toDate) where.publishedAt.lte = new Date(toDate);
    }

    // If user is teacher, only show their blogs
    if (auth.user?.role === "TEACHER") {
      where.teacherId = auth.user.teacherId;
    }

    // If user is student or guardian, only show published blogs
    if (auth.user?.role === "STUDENT" || auth.user?.role === "GUARDIAN") {
      where.isPublished = true;
    }

    const [blogs, total] = await Promise.all([
      prisma.blog.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: {
          teacher: {
            select: {
              id: true,
              name: true,
              profileImage: true,
              qualification: true,
              bio: true,
            },
          },
          comments: {
            where: { isApproved: true },
            orderBy: { createdAt: "desc" },
            take: 5,
          },
          _count: {
            select: {
              comments: true,
            },
          },
        },
      }),
      prisma.blog.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return sendResponse({
      success: true,
      message: "Blogs fetched successfully",
      data: blogs,
      meta: {
        page,
        limit,
        total,
        totalPages,
      },
    });
  } catch (error) {
    console.error("Error fetching blogs:", error);
    return sendResponse({
      success: false,
      message: "Internal server error",
      status: 500,
    });
  }
}

// POST /api/blogs - Create a new blog
export async function POST(req: NextRequest) {
  try {
    const auth = await authenticate(req, "ADMIN", "SUPER_ADMIN", "TEACHER");

    if (!auth.success) {
      return sendResponse({
        success: false,
        message: auth.error || "Unauthorized",
        status: auth.status || 401,
      });
    }

    const body = await req.json();

    // Validate required fields
    if (!body.title || !body.content) {
      return sendResponse({
        success: false,
        message: "Missing required fields: title, content",
        status: 400,
      });
    }

    // Generate slug from title
    const slug =
      body.slug ||
      body.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "") +
        "-" +
        Date.now();

    // Check if slug already exists
    const existingBlog = await prisma.blog.findUnique({
      where: { slug },
    });

    if (existingBlog) {
      return sendResponse({
        success: false,
        message: "Blog with this slug already exists",
        status: 400,
      });
    }

    // Calculate read time (approx 200 words per minute)
    const wordCount = body.content.split(/\s+/).length;
    const readTime = Math.ceil(wordCount / 200);

    // Determine teacherId
    let teacherId = body.teacherId;
    if (auth.user?.role === "TEACHER") {
      teacherId = auth.user.teacherId;
    }

    if (!teacherId) {
      return sendResponse({
        success: false,
        message: "teacherId is required",
        status: 400,
      });
    }

    // Create blog
    const blog = await prisma.blog.create({
      data: {
        title: body.title,
        slug,
        excerpt: body.excerpt,
        content: body.content,
        teacherId,
        featuredImage: body.featuredImage,
        thumbnail: body.thumbnail,
        gallery: body.gallery || [],
        metaTitle: body.metaTitle,
        metaDescription: body.metaDescription,
        metaKeywords: body.metaKeywords || [],
        categories: body.categories || [],
        tags: body.tags || [],
        readTime,
        isPublished: body.isPublished || false,
        publishedAt: body.isPublished ? new Date() : null,
        allowComments: body.allowComments ?? true,
      },
      include: {
        teacher: {
          select: {
            id: true,
            name: true,
            profileImage: true,
          },
        },
      },
    });

    return sendResponse({
      success: true,
      message: "Blog created successfully",
      data: blog,
      status: 201,
    });
  } catch (error) {
    console.error("Error creating blog:", error);
    return sendResponse({
      success: false,
      message: "Internal server error",
      status: 500,
    });
  }
}
