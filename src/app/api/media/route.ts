// src/app/api/media/route.ts
import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { authenticate } from "@/lib/apiAuthenticator";
import { sendResponse } from "@/lib/sendResponse";

// GET /api/media - Get all posts with filters
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
    const type = searchParams.get("type");
    const status = searchParams.get("status");
    const visibility = searchParams.get("visibility");
    const authorId = searchParams.get("authorId");
    const authorRole = searchParams.get("authorRole");
    const batchId = searchParams.get("batchId");
    const courseId = searchParams.get("courseId");
    const search = searchParams.get("search");
    const tag = searchParams.get("tag");
    const topic = searchParams.get("topic");
    const isFeatured = searchParams.get("isFeatured") === "true";
    const fromDate = searchParams.get("fromDate");
    const toDate = searchParams.get("toDate");

    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {};

    if (type) where.type = type;
    if (status) where.status = status;
    if (visibility) where.visibility = visibility;
    if (batchId) where.batchId = batchId;
    if (courseId) where.courseId = courseId;
    if (isFeatured) where.isFeatured = isFeatured;

    // Author filtering
    if (authorId && authorRole) {
      if (authorRole === "TEACHER") {
        where.teacherId = authorId;
      } else if (authorRole === "STUDENT") {
        where.studentId = authorId;
      }
    }

    // Date range
    if (fromDate || toDate) {
      where.createdAt = {};
      if (fromDate) where.createdAt.gte = new Date(fromDate);
      if (toDate) where.createdAt.lte = new Date(toDate);
    }

    // Search
    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { content: { contains: search, mode: "insensitive" } },
        { excerpt: { contains: search, mode: "insensitive" } },
      ];
    }

    // Tags/Topics
    if (tag) {
      where.tags = { has: tag };
    }
    if (topic) {
      where.topics = { has: topic };
    }

    // If user is student, only show public posts or posts from their batches
    if (auth.user?.role === "STUDENT" && auth.user.studentId) {
      const student = await prisma.student.findUnique({
        where: { id: auth.user.studentId },
        include: { enrollments: { select: { batchId: true } } },
      });

      where.OR = [
        { visibility: "PUBLIC" },
        { batchId: { in: student?.enrollments.map((e) => e.batchId) || [] } },
      ];
      where.status = "PUBLISHED";
    }

    // If user is guardian, only show public posts
    if (auth.user?.role === "GUARDIAN") {
      where.visibility = "PUBLIC";
      where.status = "PUBLISHED";
    }

    const [posts, total] = await Promise.all([
      prisma.post.findMany({
        where,
        skip,
        take: limit,
        orderBy: [
          { isPinned: "desc" },
          { isFeatured: "desc" },
          { createdAt: "desc" },
        ],
        include: {
          teacher: {
            select: {
              id: true,
              name: true,
              profileImage: true,
              qualification: true,
            },
          },
          student: {
            select: {
              id: true,
              name: true,
              profileImage: true,
              class: true,
            },
          },
          batch: {
            select: {
              id: true,
              name: true,
              subject: true,
            },
          },
          course: {
            select: {
              id: true,
              title: true,
              subject: true,
            },
          },
          media: {
            orderBy: { displayOrder: "asc" },
          },
          _count: {
            select: {
              reactions: true,
              comments: true,
              bookmarks: true,
            },
          },
        },
      }),
      prisma.post.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return sendResponse({
      success: true,
      message: "Posts fetched successfully",
      data: posts,
      meta: {
        page,
        limit,
        total,
        totalPages,
      },
    });
  } catch (error) {
    console.error("Error fetching posts:", error);
    return sendResponse({
      success: false,
      message: "Internal server error",
      status: 500,
    });
  }
}

// POST /api/media - Create a new post
export async function POST(req: NextRequest) {
  try {
    const auth = await authenticate(
      req,
      "ADMIN",
      "SUPER_ADMIN",
      "TEACHER",
      "STUDENT",
    );

    if (!auth.success) {
      return sendResponse({
        success: false,
        message: auth.error || "Unauthorized",
        status: auth.status || 401,
      });
    }

    const body = await req.json();

    // Validate required fields
    if (!body.title && !body.content && !body.linkUrl) {
      return sendResponse({
        success: false,
        message: "Post must have title, content, or link",
        status: 400,
      });
    }

    // Generate slug from title
    const slug =
      body.slug ||
      (body.title
        ? body.title.toLowerCase().replace(/[^a-z0-9]+/g, "-") +
          "-" +
          Date.now()
        : `post-${Date.now()}`);

    // Prepare author data
    const authorData: any = {};
    if (auth.user?.role === "TEACHER" && auth.user.teacherId) {
      authorData.teacherId = auth.user.teacherId;
    } else if (auth.user?.role === "STUDENT" && auth.user.studentId) {
      authorData.studentId = auth.user.studentId;
    }

    // Create post
    const post = await prisma.post.create({
      data: {
        title: body.title,
        content: body.content,
        slug,
        excerpt: body.excerpt,
        type: body.type || "TEXT",
        status: body.status || "DRAFT",
        visibility: body.visibility || "PUBLIC",
        ...authorData,
        batchId: body.batchId,
        courseId: body.courseId,
        linkUrl: body.linkUrl,
        linkTitle: body.linkTitle,
        linkDescription: body.linkDescription,
        linkImage: body.linkImage,
        tags: body.tags || [],
        topics: body.topics || [],
        isFeatured: body.isFeatured || false,
        isPinned: body.isPinned || false,
        pinnedUntil: body.pinnedUntil ? new Date(body.pinnedUntil) : null,
        pinnedBy: body.isPinned ? auth.user.id : null,
        metaTitle: body.metaTitle,
        metaDescription: body.metaDescription,
        metaKeywords: body.metaKeywords,
        publishedAt: body.status === "PUBLISHED" ? new Date() : null,
        scheduledFor: body.scheduledFor ? new Date(body.scheduledFor) : null,
      },
      include: {
        teacher: {
          select: {
            id: true,
            name: true,
            profileImage: true,
          },
        },
        student: {
          select: {
            id: true,
            name: true,
            profileImage: true,
          },
        },
      },
    });

    // Handle media attachments if any
    if (body.media && body.media.length > 0) {
      await prisma.mediaAttachment.createMany({
        data: body.media.map((m: any, index: number) => ({
          postId: post.id,
          url: m.url,
          type: m.type,
          category: m.category || "IMAGE",
          filename: m.filename,
          fileSize: m.fileSize,
          duration: m.duration,
          width: m.width,
          height: m.height,
          thumbnail: m.thumbnail,
          caption: m.caption,
          altText: m.altText,
          displayOrder: m.displayOrder || index,
        })),
      });
    }

    return sendResponse({
      success: true,
      message: "Post created successfully",
      data: post,
      status: 201,
    });
  } catch (error) {
    console.error("Error creating post:", error);
    return sendResponse({
      success: false,
      message: "Internal server error",
      status: 500,
    });
  }
}
