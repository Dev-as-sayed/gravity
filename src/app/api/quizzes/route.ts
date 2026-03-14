// src/app/api/quizzes/route.ts
import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { authenticate } from "@/lib/apiAuthenticator";
import { sendResponse } from "@/lib/sendResponse";

// GET /api/quizzes - Get all quizzes with filters
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
    const difficulty = searchParams.get("difficulty");
    const status = searchParams.get("status");
    const teacherId = searchParams.get("teacherId");
    const batchId = searchParams.get("batchId");

    const skip = (page - 1) * limit;

    const where: any = {};

    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
        { subject: { contains: search, mode: "insensitive" } },
      ];
    }

    if (subject) where.subject = subject;
    if (difficulty) where.difficulty = difficulty;
    if (status) where.status = status;
    if (teacherId) where.teacherId = teacherId;
    if (batchId) where.batchId = batchId;

    // If user is teacher, only show their quizzes
    if (auth.user?.role === "TEACHER") {
      where.teacherId = auth.user.teacherId;
    }

    // If user is student, only show published quizzes from their batches
    if (auth.user?.role === "STUDENT") {
      where.status = "PUBLISHED";
      if (auth.user.studentId) {
        const student = await prisma.student.findUnique({
          where: { id: auth.user.studentId },
          include: { enrollments: { select: { batchId: true } } },
        });
        if (student?.enrollments.length) {
          where.batchId = { in: student.enrollments.map((e) => e.batchId) };
        }
      }
    }

    const [quizzes, total] = await Promise.all([
      prisma.quiz.findMany({
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
          batch: {
            select: {
              id: true,
              name: true,
              subject: true,
            },
          },
          _count: {
            select: {
              questions: true,
              attempts: true,
            },
          },
        },
      }),
      prisma.quiz.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return sendResponse({
      success: true,
      message: "Quizzes fetched successfully",
      data: quizzes,
      meta: {
        page,
        limit,
        total,
        totalPages,
      },
    });
  } catch (error) {
    console.error("Error fetching quizzes:", error);
    return sendResponse({
      success: false,
      message: "Internal server error",
      status: 500,
    });
  }
}

// POST /api/quizzes - Create a new quiz
export async function POST(req: NextRequest) {
  try {
    console.log("hit log create new qizz");
    const auth = await authenticate(req, "ADMIN", "SUPER_ADMIN", "TEACHER");

    if (!auth.success) {
      return sendResponse({
        success: false,
        message: auth.error || "Unauthorized",
        status: auth.status || 401,
      });
    }

    const body = await req.json();

    console.log(body);

    // Validate required fields
    if (!body.title || !body.totalMarks) {
      return sendResponse({
        success: false,
        message: "Missing required fields: title, totalMarks",
        status: 400,
      });
    }

    // Generate slug from title
    const slug =
      body.slug ||
      body.title.toLowerCase().replace(/[^a-z0-9]+/g, "-") + "-" + Date.now();

    // Check if slug already exists
    const existingQuiz = await prisma.quiz.findUnique({
      where: { slug },
    });

    if (existingQuiz) {
      return sendResponse({
        success: false,
        message: "Quiz with this slug already exists",
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

    // Create quiz
    const quiz = await prisma.quiz.create({
      data: {
        title: body.title,
        slug,
        description: body.description,
        teacherId,
        batchId: body.batchId,
        timeLimit: body.timeLimit,
        totalMarks: body.totalMarks,
        passingMarks: body.passingMarks,
        negativeMarking: body.negativeMarking || 0,
        status: body.status || "DRAFT",
        difficulty: body.difficulty || "INTERMEDIATE",
        subject: body.subject,
        topics: body.topics || [],
        showResult: body.showResult ?? true,
        showAnswer: body.showAnswer ?? false,
        showExplanation: body.showExplanation ?? true,
        showLeaderboard: body.showLeaderboard ?? true,
        allowRetake: body.allowRetake ?? false,
        maxAttempts: body.maxAttempts || 1,
        startTime: body.startTime ? new Date(body.startTime) : null,
        endTime: body.endTime ? new Date(body.endTime) : null,
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
      message: "Quiz created successfully",
      data: quiz,
      status: 201,
    });
  } catch (error) {
    console.error("Error creating quiz:", error);
    return sendResponse({
      success: false,
      message: "Internal server error",
      status: 500,
    });
  }
}
