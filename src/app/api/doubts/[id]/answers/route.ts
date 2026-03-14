// app/api/doubts/[id]/answers/route.ts
import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { authenticate } from "@/lib/apiAuthenticator";
import { sendResponse } from "@/lib/sendResponse";

// GET /api/doubts/[id]/answers - Get all answers for a doubt
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
      "MODERATOR",
    );

    if (!auth.success) {
      return sendResponse({
        success: false,
        message: auth.error || "Unauthorized",
        status: auth.status || 401,
      });
    }

    const answers = await prisma.doubtAnswer.findMany({
      where: { doubtId: id },
      orderBy: { createdAt: "asc" },
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
          },
        },
      },
    });

    return sendResponse({
      success: true,
      message: "Answers fetched successfully",
      data: answers,
    });
  } catch (error) {
    console.error("Error fetching answers:", error);
    return sendResponse({
      success: false,
      message: "Internal server error",
      status: 500,
    });
  }
}

// POST /api/doubts/[id]/answers - Add answer to doubt
export async function POST(
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
      "MODERATOR",
    );

    if (!auth.success) {
      return sendResponse({
        success: false,
        message: auth.error || "Unauthorized",
        status: auth.status || 401,
      });
    }

    const body = await req.json();

    if (!body.content) {
      return sendResponse({
        success: false,
        message: "Content is required",
        status: 400,
      });
    }

    const doubt = await prisma.doubt.findUnique({
      where: { id },
    });

    if (!doubt) {
      return sendResponse({
        success: false,
        message: "Doubt not found",
        status: 404,
      });
    }

    // Prepare answer data based on user role
    const answerData: any = {
      doubtId: id,
      content: body.content,
      images: body.images || [],
      files: body.files || {},
      isOfficial: auth.user?.role === "TEACHER",
    };

    if (auth.user?.role === "TEACHER" && auth.user.teacherId) {
      answerData.teacherId = auth.user.teacherId;
    } else if (auth.user?.role === "STUDENT" && auth.user.studentId) {
      answerData.studentId = auth.user.studentId;
    }

    const answer = await prisma.doubtAnswer.create({
      data: answerData,
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

    // Update doubt status if it's the first answer from a teacher
    if (auth.user?.role === "TEACHER" && doubt.status === "OPEN") {
      await prisma.doubt.update({
        where: { id },
        data: { status: "ANSWERED" },
      });
    }

    return sendResponse({
      success: true,
      message: "Answer added successfully",
      data: answer,
      status: 201,
    });
  } catch (error) {
    console.error("Error adding answer:", error);
    return sendResponse({
      success: false,
      message: "Internal server error",
      status: 500,
    });
  }
}
