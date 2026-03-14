// src/app/api/courses/route.ts
import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { authenticate } from "@/lib/apiAuthenticator";
import { sendResponse } from "@/lib/sendResponse";

// GET /api/courses - Get all courses
export async function GET(req: NextRequest) {
  try {
    // Authenticate - ADMIN, TEACHER can access
    const auth = await authenticate(req, "ADMIN", "SUPER_ADMIN", "TEACHER");

    if (!auth.success) {
      return sendResponse({
        success: false,
        message: auth.error || "Unauthorized",
        status: auth.status || 401,
      });
    }

    // Parse query parameters
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const search = searchParams.get("search");
    const subject = searchParams.get("subject");
    const level = searchParams.get("level");
    const teacherId = searchParams.get("teacherId");
    const isFree = searchParams.get("isFree");

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {};

    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ];
    }

    if (subject) where.subject = subject;
    if (level) where.level = level;
    if (teacherId) where.teacherId = teacherId;
    if (isFree !== null) where.isFree = isFree === "true";

    // If user is teacher, only show their courses
    if (auth.user?.role === "TEACHER") {
      where.teacherId = auth.user.teacherId;
    }

    // Get courses with pagination
    const [courses, total] = await Promise.all([
      prisma.course.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          teacher: {
            select: {
              id: true,
              name: true,
              qualification: true,
            },
          },
          batches: {
            select: {
              id: true,
              name: true,
              mode: true,
              currentEnrollments: true,
            },
          },
          _count: {
            select: {
              batches: true,
            },
          },
        },
      }),
      prisma.course.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return sendResponse({
      success: true,
      message: "Courses fetched successfully",
      data: courses,
      meta: {
        page,
        limit,
        total,
        totalPages,
      },
    });
  } catch (error) {
    console.error("Error fetching courses:", error);
    return sendResponse({
      success: false,
      message: "Internal server error",
      status: 500,
    });
  }
}

// POST /api/courses - Create a new course
export async function POST(req: NextRequest) {
  try {
    // Authenticate - only ADMIN and TEACHER can create
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
    if (!body.title || !body.subject) {
      return sendResponse({
        success: false,
        message: "Missing required fields: title, subject",
        status: 400,
      });
    }

    // Generate slug from title
    const slug =
      body.slug || body.title.toLowerCase().replace(/[^a-z0-9]+/g, "-");

    // Check if slug already exists
    const existingCourse = await prisma.course.findUnique({
      where: { slug },
    });

    if (existingCourse) {
      return sendResponse({
        success: false,
        message: "Course with this slug already exists",
        status: 400,
      });
    }

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

    // Create course
    const course = await prisma.course.create({
      data: {
        title: body.title,
        slug,
        description: body.description,
        subject: body.subject,
        category: body.category || "Science",
        thumbnail: body.thumbnail,
        bannerImage: body.bannerImage,
        icon: body.icon,
        teacherId,
        duration: body.duration,
        level: body.level || "BEGINNER",
        prerequisites: body.prerequisites || [],
        learningOutcomes: body.learningOutcomes || [],
        price: body.price || 0,
        offerPrice: body.offerPrice,
        isFree: body.isFree || false,
        metaTitle: body.metaTitle,
        metaDescription: body.metaDescription,
        metaKeywords: body.metaKeywords || [],
      },
      include: {
        teacher: {
          select: {
            name: true,
          },
        },
      },
    });

    return sendResponse({
      success: true,
      message: "Course created successfully",
      data: course,
      status: 201,
    });
  } catch (error) {
    console.error("Error creating course:", error);
    return sendResponse({
      success: false,
      message: "Internal server error",
      status: 500,
    });
  }
}
