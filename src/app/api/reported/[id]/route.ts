// src/app/api/reported/[id]/route.ts
import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { authenticate } from "@/lib/apiAuthenticator";
import { sendResponse } from "@/lib/sendResponse";

// PATCH /api/reported/[id] - Update report status
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    const auth = await authenticate(req, "TEACHER", "MODERATOR");

    if (!auth.success) {
      return sendResponse({
        success: false,
        message: auth.error || "Unauthorized",
        status: auth.status || 401,
      });
    }

    const body = await req.json();
    const { status } = body;

    if (!status) {
      return sendResponse({
        success: false,
        message: "Status is required",
        status: 400,
      });
    }

    const validStatuses = ["PENDING", "REVIEWED", "DISMISSED", "ACTION_TAKEN"];
    if (!validStatuses.includes(status)) {
      return sendResponse({
        success: false,
        message: "Invalid status. Must be one of: PENDING, REVIEWED, DISMISSED, ACTION_TAKEN",
        status: 400,
      });
    }

    const existing = await prisma.reportedContent.findUnique({
      where: { id },
    });

    if (!existing) {
      return sendResponse({
        success: false,
        message: "Report not found",
        status: 404,
      });
    }

    const updated = await prisma.reportedContent.update({
      where: { id },
      data: {
        status,
        moderatedBy: auth.user.id,
        moderatedAt: new Date(),
      },
    });

    return sendResponse({
      success: true,
      message: "Report status updated successfully",
      data: updated,
    });
  } catch (error) {
    console.error("Error updating report:", error);
    return sendResponse({
      success: false,
      message: "Internal server error",
      status: 500,
    });
  }
}
