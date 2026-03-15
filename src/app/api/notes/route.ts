// src/app/api/notes/route.ts
import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { authenticate } from "@/lib/apiAuthenticator";
import { sendResponse } from "@/lib/sendResponse";

// GET /api/notes - Get all notes with filters
export async function GET(req: NextRequest) {
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

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const search = searchParams.get("search");
    const subject = searchParams.get("subject");
    const topic = searchParams.get("topic");
    const teacherId = searchParams.get("teacherId");
    const batchId = searchParams.get("batchId");
    const difficulty = searchParams.get("difficulty");
    const isPublic = searchParams.get("isPublic");
    const isPremium = searchParams.get("isPremium");
    const tag = searchParams.get("tag");

    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {};

    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
        { subject: { contains: search, mode: "insensitive" } },
      ];
    }

    if (subject) where.subject = subject;
    if (topic) where.topic = topic;
    if (teacherId) where.teacherId = teacherId;
    if (batchId) where.batchId = batchId;
    if (difficulty) where.difficulty = difficulty;
    if (isPublic !== null) where.isPublic = isPublic === "true";
    if (isPremium !== null) where.isPremium = isPremium === "true";
    if (tag) where.tags = { has: tag };

    // If user is teacher, only show their notes
    if (auth.user?.role === "TEACHER") {
      where.teacherId = auth.user.teacherId;
    }

    // If user is student, only show public notes or notes from their batches
    if (auth.user?.role === "STUDENT" && auth.user.studentId) {
      const student = await prisma.student.findUnique({
        where: { id: auth.user.studentId },
        include: { enrollments: { select: { batchId: true } } },
      });

      where.OR = [
        { isPublic: true },
        { batchId: { in: student?.enrollments.map((e) => e.batchId) || [] } },
      ];
    }

    const [notes, total] = await Promise.all([
      prisma.note.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          teacher: {
            select: {
              id: true,
              name: true,
              profileImage: true,
              qualification: true,
            },
          },
          batch: {
            select: {
              id: true,
              name: true,
              subject: true,
            },
          },
          _count: {
            select: {
              downloadedBy: true,
              savedBy: true,
            },
          },
        },
      }),
      prisma.note.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return sendResponse({
      success: true,
      message: "Notes fetched successfully",
      data: notes,
      meta: {
        page,
        limit,
        total,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
    });
  } catch (error) {
    console.error("Error fetching notes:", error);
    return sendResponse({
      success: false,
      message: "Internal server error",
      status: 500,
    });
  }
}

// POST /api/notes - Create a new note
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
    if (!body.title) {
      return sendResponse({
        success: false,
        message: "Title is required",
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
    const existingNote = await prisma.note.findUnique({
      where: { slug },
    });

    if (existingNote) {
      return sendResponse({
        success: false,
        message: "Note with this slug already exists",
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

    // Create note
    const note = await prisma.note.create({
      data: {
        title: body.title,
        slug,
        description: body.description,
        content: body.content,
        fileUrl: body.fileUrl,
        fileType: body.fileType,
        fileSize: body.fileSize ? parseInt(body.fileSize) : null,
        duration: body.duration ? parseInt(body.duration) : null,
        pages: body.pages ? parseInt(body.pages) : null,
        teacherId,
        batchId: body.batchId,
        subject: body.subject,
        topic: body.topic,
        topics: body.topics || [],
        isPublic: body.isPublic || false,
        isPremium: body.isPremium || false,
        price: body.price ? parseFloat(body.price) : null,
        freePreview: body.freePreview || false,
        tags: body.tags || [],
        difficulty: body.difficulty || "INTERMEDIATE",
        metaTitle: body.metaTitle,
        metaDescription: body.metaDescription,
        metaKeywords: body.metaKeywords || [],
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
      message: "Note created successfully",
      data: note,
      status: 201,
    });
  } catch (error) {
    console.error("Error creating note:", error);
    return sendResponse({
      success: false,
      message: "Internal server error",
      status: 500,
    });
  }
}
