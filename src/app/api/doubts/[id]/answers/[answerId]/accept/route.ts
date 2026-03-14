// app/api/doubts/[id]/answers/[answerId]/accept/route.ts
import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { authenticate } from "@/lib/apiAuthenticator";
import { sendResponse } from "@/lib/sendResponse";

// POST /api/doubts/[id]/answers/[answerId]/accept - Accept an answer
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; answerId: string }> },
) {
  try {
    const { id, answerId } = await params;

    const auth = await authenticate(req, "ADMIN", "SUPER_ADMIN", "STUDENT");

    if (!auth.success) {
      return sendResponse({
        success: false,
        message: auth.error || "Unauthorized",
        status: auth.status || 401,
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

    // Only the student who asked the doubt can accept an answer
    if (
      auth.user?.role === "STUDENT" &&
      doubt.studentId !== auth.user.studentId
    ) {
      return sendResponse({
        success: false,
        message: "You don't have permission to accept answers for this doubt",
        status: 403,
      });
    }

    // First, unaccept any previously accepted answer
    await prisma.doubtAnswer.updateMany({
      where: {
        doubtId: id,
        isAccepted: true,
      },
      data: {
        isAccepted: false,
      },
    });

    // Accept the selected answer
    const acceptedAnswer = await prisma.doubtAnswer.update({
      where: { id: answerId },
      data: {
        isAccepted: true,
      },
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
    });

    // Optionally mark doubt as resolved
    await prisma.doubt.update({
      where: { id },
      data: { status: "RESOLVED" },
    });

    return sendResponse({
      success: true,
      message: "Answer accepted successfully",
      data: acceptedAnswer,
    });
  } catch (error) {
    console.error("Error accepting answer:", error);
    return sendResponse({
      success: false,
      message: "Internal server error",
      status: 500,
    });
  }
}
