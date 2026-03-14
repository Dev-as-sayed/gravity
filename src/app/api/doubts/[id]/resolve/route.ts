// app/api/doubts/[id]/resolve/route.ts
import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { authenticate } from "@/lib/apiAuthenticator";
import { sendResponse } from "@/lib/sendResponse";

// POST /api/doubts/[id]/resolve - Mark doubt as resolved
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

    // Teachers can only resolve doubts assigned to them
    if (
      auth.user?.role === "TEACHER" &&
      doubt.assignedTo !== auth.user.teacherId
    ) {
      return sendResponse({
        success: false,
        message: "You don't have permission to resolve this doubt",
        status: 403,
      });
    }

    const updatedDoubt = await prisma.doubt.update({
      where: { id },
      data: {
        status: "RESOLVED",
        resolvedAt: new Date(),
        resolvedBy: auth.user.id,
        satisfactionRating: body.rating,
        feedback: body.feedback,
      },
    });

    return sendResponse({
      success: true,
      message: "Doubt marked as resolved",
      data: updatedDoubt,
    });
  } catch (error) {
    console.error("Error resolving doubt:", error);
    return sendResponse({
      success: false,
      message: "Internal server error",
      status: 500,
    });
  }
}
