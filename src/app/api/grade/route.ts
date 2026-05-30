// src/app/api/grade/route.ts
import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { authenticate } from "@/lib/apiAuthenticator";
import { sendResponse } from "@/lib/sendResponse";

// GET /api/grade - List grade records
export async function GET(req: NextRequest) {
  try {
    const auth = await authenticate(req, "TEACHER", "STUDENT", "MODERATOR");

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
    const studentId = searchParams.get("studentId");
    const batchId = searchParams.get("batchId");
    const examId = searchParams.get("examId");

    const skip = (page - 1) * limit;

    const where: any = {};

    if (studentId) where.studentId = studentId;
    if (batchId) where.exam = { batchId };
    if (examId) where.examId = examId;

    if (auth.user?.role === "STUDENT") {
      where.studentId = auth.user.studentId;
    }

    const [grades, total] = await Promise.all([
      prisma.examResult.findMany({
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
              class: true,
            },
          },
          exam: {
            select: {
              id: true,
              title: true,
              fullMarks: true,
              batch: { select: { id: true, name: true } },
            },
          },
        },
      }),
      prisma.examResult.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return sendResponse({
      success: true,
      message: "Grades fetched successfully",
      data: grades,
      meta: { page, limit, total, totalPages },
    });
  } catch (error) {
    console.error("Error fetching grades:", error);
    return sendResponse({
      success: false,
      message: "Internal server error",
      status: 500,
    });
  }
}
