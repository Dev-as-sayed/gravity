// src/app/api/exams/route.ts
import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { authenticate } from "@/lib/apiAuthenticator";
import { sendResponse } from "@/lib/sendResponse";

// GET /api/exams - Get all exams with filters
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
    const type = searchParams.get("type");
    const status = searchParams.get("status");
    const teacherId = searchParams.get("teacherId");
    const batchId = searchParams.get("batchId");
    const fromDate = searchParams.get("fromDate");
    const toDate = searchParams.get("toDate");

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
    if (type) where.type = type;
    if (status) where.status = status;
    if (teacherId) where.teacherId = teacherId;
    if (batchId) where.batchId = batchId;

    if (fromDate || toDate) {
      where.examDate = {};
      if (fromDate) where.examDate.gte = new Date(fromDate);
      if (toDate) where.examDate.lte = new Date(toDate);
    }

    // If user is teacher, only show their exams
    if (auth.user?.role === "TEACHER") {
      where.teacherId = auth.user.teacherId;
    }

    // If user is student, only show exams from their batches
    if (auth.user?.role === "STUDENT") {
      if (auth.user.studentId) {
        const student = await prisma.student.findUnique({
          where: { id: auth.user.studentId },
          include: { enrollments: { select: { batchId: true } } },
        });
        if (student?.enrollments.length) {
          where.batchId = { in: student.enrollments.map((e) => e.batchId) };
        }
      }
      where.status = { not: "DRAFT" };
    }

    const [exams, total] = await Promise.all([
      prisma.exam.findMany({
        where,
        skip,
        take: limit,
        orderBy: { examDate: "desc" },
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
              results: true,
            },
          },
        },
      }),
      prisma.exam.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return sendResponse({
      success: true,
      message: "Exams fetched successfully",
      data: exams,
      meta: {
        page,
        limit,
        total,
        totalPages,
      },
    });
  } catch (error) {
    console.error("Error fetching exams:", error);
    return sendResponse({
      success: false,
      message: "Internal server error",
      status: 500,
    });
  }
}

// POST /api/exams - Create a new exam
export async function POST(req: NextRequest) {
  try {
    console.log("hit createing exma end point");
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
    if (
      !body.title ||
      !body.subject ||
      !body.examDate ||
      !body.duration ||
      !body.fullMarks
    ) {
      return sendResponse({
        success: false,
        message:
          "Missing required fields: title, subject, examDate, duration, fullMarks",
        status: 400,
      });
    }

    // Generate slug from title
    const slug =
      body.slug ||
      body.title.toLowerCase().replace(/[^a-z0-9]+/g, "-") + "-" + Date.now();

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

    // Create exam
    const exam = await prisma.exam.create({
      data: {
        title: body.title,
        slug,
        description: body.description,
        teacherId,
        batchId: body.batchId,
        type: body.type || "EXAM",
        subject: body.subject,
        fullMarks: body.fullMarks,
        passMarks: body.passMarks,
        examDate: new Date(body.examDate),
        startTime: new Date(body.startTime || body.examDate),
        endTime: new Date(body.endTime || body.examDate),
        duration: body.duration,
        lateEntryAllowed: body.lateEntryAllowed ?? false,
        earlyExitAllowed: body.earlyExitAllowed ?? true,
        gradingType: body.gradingType || "MANUAL",
        questionPaper: body.questionPaper,
        answerSheet: body.answerSheet,
        instructions: body.instructions,
        allowReview: body.allowReview ?? false,
        showRank: body.showRank ?? true,
        showPercentile: body.showPercentile ?? true,
        allowRecheck: body.allowRecheck ?? false,
        recheckFee: body.recheckFee,
        status: body.status || "DRAFT",
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
      message: "Exam created successfully",
      data: exam,
      status: 201,
    });
  } catch (error) {
    console.error("Error creating exam:", error);
    return sendResponse({
      success: false,
      message: "Internal server error",
      status: 500,
    });
  }
}
