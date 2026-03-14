// src/app/api/quizzes/[id]/results/route.ts
import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { authenticate } from "@/lib/apiAuthenticator";
import { sendResponse } from "@/lib/sendResponse";

// GET /api/quizzes/[id]/results - Get quiz results
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

    const where: any = { quizId: id };

    // If student, only show their results
    if (auth.user?.role === "STUDENT" && auth.user.studentId) {
      where.studentId = auth.user.studentId;
    }

    const [results, total] = await Promise.all([
      prisma.quizResult.findMany({
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
            },
          },
          attempt: {
            select: {
              startTime: true,
              endTime: true,
              timeSpent: true,
            },
          },
        },
      }),
      prisma.quizResult.count({ where }),
    ]);

    // Update ranks
    if (auth.user?.role !== "STUDENT") {
      for (let i = 0; i < results.length; i++) {
        await prisma.quizResult.update({
          where: { id: results[i].id },
          data: { rank: i + 1 },
        });
      }
    }

    const totalPages = Math.ceil(total / limit);

    return sendResponse({
      success: true,
      message: "Quiz results fetched successfully",
      data: results,
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
    console.error("Error fetching quiz results:", error);
    return sendResponse({
      success: false,
      message: "Internal server error",
      status: 500,
    });
  }
}
