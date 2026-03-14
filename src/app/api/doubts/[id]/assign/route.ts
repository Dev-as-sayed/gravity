// app/api/doubts/[id]/assign/route.ts
import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { authenticate } from "@/lib/apiAuthenticator";
import { sendResponse } from "@/lib/sendResponse";

// POST /api/doubts/[id]/assign - Assign teacher to doubt
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    const auth = await authenticate(req, "ADMIN", "SUPER_ADMIN", "MODERATOR");

    if (!auth.success) {
      return sendResponse({
        success: false,
        message: auth.error || "Unauthorized",
        status: auth.status || 401,
      });
    }

    const body = await req.json();

    if (!body.teacherId) {
      return sendResponse({
        success: false,
        message: "teacherId is required",
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

    const updatedDoubt = await prisma.doubt.update({
      where: { id },
      data: {
        assignedTo: body.teacherId,
        assignedAt: new Date(),
        status: "ANSWERED",
      },
      include: {
        teacher: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return sendResponse({
      success: true,
      message: "Teacher assigned successfully",
      data: updatedDoubt,
    });
  } catch (error) {
    console.error("Error assigning teacher:", error);
    return sendResponse({
      success: false,
      message: "Internal server error",
      status: 500,
    });
  }
}
