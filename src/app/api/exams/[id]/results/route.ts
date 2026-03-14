// src/app/api/exams/[id]/results/route.ts
import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { authenticate } from "@/lib/apiAuthenticator";
import { sendResponse } from "@/lib/sendResponse";

// GET /api/exams/[id]/results - Get exam results
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

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

    const skip = (page - 1) * limit;

    const where: any = { examId: id };

    // If student, only show their result
    if (auth.user?.role === "STUDENT" && auth.user.studentId) {
      where.studentId = auth.user.studentId;
    }

    const [results, total] = await Promise.all([
      prisma.examResult.findMany({
        where,
        skip,
        take: limit,
        orderBy: { percentage: "desc" },
        include: {
          student: {
            select: {
              id: true,
              name: true,
              profileImage: true,
              class: true,
            },
          },
        },
      }),
      prisma.examResult.count({ where }),
    ]);

    // Update ranks if not set
    if (auth.user?.role !== "STUDENT") {
      for (let i = 0; i < results.length; i++) {
        await prisma.examResult.update({
          where: { id: results[i].id },
          data: { rank: i + 1 },
        });
      }
    }

    const totalPages = Math.ceil(total / limit);

    return sendResponse({
      success: true,
      message: "Exam results fetched successfully",
      data: results,
      meta: {
        page,
        limit,
        total,
        totalPages,
      },
    });
  } catch (error) {
    console.error("Error fetching exam results:", error);
    return sendResponse({
      success: false,
      message: "Internal server error",
      status: 500,
    });
  }
}

// POST /api/exams/[id]/results - Add/Update exam results
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    const auth = await authenticate(req, "ADMIN", "SUPER_ADMIN", "TEACHER");

    if (!auth.success) {
      return sendResponse({
        success: false,
        message: auth.error || "Unauthorized",
        status: auth.status || 401,
      });
    }

    const body = await req.json();

    const exam = await prisma.exam.findUnique({
      where: { id },
    });

    if (!exam) {
      return sendResponse({
        success: false,
        message: "Exam not found",
        status: 404,
      });
    }

    // Check permission
    if (
      auth.user?.role === "TEACHER" &&
      exam.teacherId !== auth.user.teacherId
    ) {
      return sendResponse({
        success: false,
        message: "You don't have permission to add results",
        status: 403,
      });
    }

    // Bulk create/update results
    const results = await prisma.$transaction(
      body.results.map((r: any) =>
        prisma.examResult.upsert({
          where: {
            examId_studentId: {
              examId: id,
              studentId: r.studentId,
            },
          },
          update: {
            obtainedMarks: r.obtainedMarks,
            percentage: (r.obtainedMarks / exam.fullMarks) * 100,
            grade: r.grade,
            subjectWiseMarks: r.subjectWiseMarks,
            topicWiseMarks: r.topicWiseMarks,
            feedback: r.feedback,
            gradedBy: auth.user.id,
            gradedAt: new Date(),
          },
          create: {
            examId: id,
            studentId: r.studentId,
            obtainedMarks: r.obtainedMarks,
            totalMarks: exam.fullMarks,
            percentage: (r.obtainedMarks / exam.fullMarks) * 100,
            grade: r.grade,
            subjectWiseMarks: r.subjectWiseMarks,
            topicWiseMarks: r.topicWiseMarks,
            feedback: r.feedback,
            gradedBy: auth.user.id,
            gradedAt: new Date(),
          },
        }),
      ),
    );

    // Update exam stats
    const allResults = await prisma.examResult.findMany({
      where: { examId: id },
    });

    const totalStudents = allResults.length;
    const passedCount = allResults.filter(
      (r) => r.percentage >= (exam.passMarks || 40),
    ).length;
    const averageMarks =
      allResults.reduce((sum, r) => sum + r.obtainedMarks, 0) / totalStudents;
    const highestMarks = Math.max(...allResults.map((r) => r.obtainedMarks));

    await prisma.exam.update({
      where: { id },
      data: {
        totalStudents,
        appearedCount: totalStudents,
        passedCount,
        averageMarks,
        highestMarks,
      },
    });

    return sendResponse({
      success: true,
      message: `${results.length} results saved successfully`,
      data: results,
      status: 201,
    });
  } catch (error) {
    console.error("Error saving exam results:", error);
    return sendResponse({
      success: false,
      message: "Internal server error",
      status: 500,
    });
  }
}
