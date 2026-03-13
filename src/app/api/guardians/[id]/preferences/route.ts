// src/app/api/guardians/[id]/preferences/route.ts
import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { authenticate } from "@/lib/apiAuthenticator";
import { sendResponse } from "@/lib/sendResponse";

// GET /api/guardians/[id]/preferences - Get guardian notification preferences
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    // Authenticate - ADMIN, SUPER_ADMIN can view
    const auth = await authenticate(req, "ADMIN", "SUPER_ADMIN");

    if (!auth.success) {
      return sendResponse({
        success: false,
        message: auth.error || "Unauthorized",
        status: auth.status || 401,
      });
    }

    const { id } = params;

    const guardian = await prisma.guardian.findUnique({
      where: { id },
      select: {
        notificationPrefs: true,
      },
    });

    if (!guardian) {
      return sendResponse({
        success: false,
        message: "Guardian not found",
        status: 404,
      });
    }

    return sendResponse({
      success: true,
      message: "Guardian preferences fetched successfully",
      data: guardian.notificationPrefs || {},
    });
  } catch (error) {
    console.error("Error fetching guardian preferences:", error);
    return sendResponse({
      success: false,
      message: "Internal server error",
      status: 500,
    });
  }
}

// PUT /api/guardians/[id]/preferences - Update guardian notification preferences
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    // Authenticate - only ADMIN and SUPER_ADMIN can update
    const auth = await authenticate(req, "ADMIN", "SUPER_ADMIN");

    if (!auth.success) {
      return sendResponse({
        success: false,
        message: auth.error || "Unauthorized",
        status: auth.status || 401,
      });
    }

    const { id } = params;
    const body = await req.json();

    // Check if guardian exists
    const guardian = await prisma.guardian.findUnique({
      where: { id },
    });

    if (!guardian) {
      return sendResponse({
        success: false,
        message: "Guardian not found",
        status: 404,
      });
    }

    // Update notification preferences
    const updatedGuardian = await prisma.guardian.update({
      where: { id },
      data: {
        notificationPrefs: body,
      },
      select: {
        notificationPrefs: true,
      },
    });

    return sendResponse({
      success: true,
      message: "Guardian preferences updated successfully",
      data: updatedGuardian.notificationPrefs,
    });
  } catch (error) {
    console.error("Error updating guardian preferences:", error);
    return sendResponse({
      success: false,
      message: "Internal server error",
      status: 500,
    });
  }
}
