// app/api/doubts/route.ts
import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { authenticate } from "@/lib/apiAuthenticator";
import { sendResponse } from "@/lib/sendResponse";

// GET /api/doubts - Get all doubts with filters
export async function GET(req: NextRequest) {
  try {
    const auth = await authenticate(
      req,
      "ADMIN",
      "SUPER_ADMIN",
      "TEACHER",
      "STUDENT",
      "MODERATOR",
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
    const status = searchParams.get("status");
    const priority = searchParams.get("priority");
    const subject = searchParams.get("subject");
    const search = searchParams.get("search");
    const assignedTo = searchParams.get("assignedTo");

    const skip = (page - 1) * limit;

    // Build where clause based on user role
    const where: any = {};

    // Students can only see their own doubts
    if (auth.user?.role === "STUDENT" && auth.user.studentId) {
      where.studentId = auth.user.studentId;
    }

    // Teachers see doubts assigned to them or unassigned
    if (auth.user?.role === "TEACHER" && auth.user.teacherId) {
      where.OR = [
        { assignedTo: auth.user.teacherId },
        { assignedTo: null, status: "OPEN" },
      ];
    }

    // Apply filters
    if (status) where.status = status;
    if (priority) where.priority = priority;
    if (subject) where.subject = subject;
    if (assignedTo) where.assignedTo = assignedTo;

    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
        ...(where.OR || []),
      ];
    }

    const [doubts, total] = await Promise.all([
      prisma.doubt.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          student: {
            select: {
              id: true,
              name: true,
              profileImage: true,
            },
          },
          teacher: {
            select: {
              id: true,
              name: true,
              qualification: true,
            },
          },
          answers: {
            take: 3,
            orderBy: { createdAt: "desc" },
            include: {
              teacher: {
                select: {
                  id: true,
                  name: true,
                },
              },
              student: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
          _count: {
            select: {
              answers: true,
            },
          },
        },
      }),
      prisma.doubt.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return sendResponse({
      success: true,
      message: "Doubts fetched successfully",
      data: doubts,
      meta: {
        page,
        limit,
        total,
        totalPages,
      },
    });
  } catch (error) {
    console.error("Error fetching doubts:", error);
    return sendResponse({
      success: false,
      message: "Internal server error",
      status: 500,
    });
  }
}

// POST /api/doubts - Create a new doubt
export async function POST(req: NextRequest) {
  try {
    console.log("hit onl =======================");

    const auth = await authenticate(req, "STUDENT", "SUPER_ADMIN", "ADMIN");

    if (!auth.success || !auth.user?.studentId) {
      return sendResponse({
        success: false,
        message: "Only students can create doubts",
        status: 401,
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

    const doubt = await prisma.doubt.create({
      data: {
        title: body.title,
        description: body.description,
        studentId: auth.user.studentId,
        batchId: body.batchId,
        subject: body.subject,
        topic: body.topic,
        questionId: body.questionId,
        images: body.images || [],
        files: body.files || {},
        priority: body.priority || "MEDIUM",
        tags: body.tags || [],
        isPrivate: body.isPrivate || false,
      },
      include: {
        student: {
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
      message: "Doubt created successfully",
      data: doubt,
      status: 201,
    });
  } catch (error) {
    console.error("Error creating doubt:", error);
    return sendResponse({
      success: false,
      message: "Internal server error",
      status: 500,
    });
  }
}
