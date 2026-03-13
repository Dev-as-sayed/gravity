// src/app/api/moderators/[id]/batches/route.ts
import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { authenticate } from "@/lib/apiAuthenticator";
import { sendResponse } from "@/lib/sendResponse";

// GET /api/moderators/[id]/batches - Get batches assigned to moderator
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

    const moderator = await prisma.moderator.findUnique({
      where: { id },
      include: {
        batches: {
          include: {
            teacher: {
              select: {
                id: true,
                name: true,
              },
            },
            course: {
              select: {
                id: true,
                title: true,
              },
            },
            _count: {
              select: {
                enrollments: true,
              },
            },
          },
        },
      },
    });

    if (!moderator) {
      return sendResponse({
        success: false,
        message: "Moderator not found",
        status: 404,
      });
    }

    return sendResponse({
      success: true,
      message: "Moderator batches fetched successfully",
      data: moderator,
    });
  } catch (error) {
    console.error("Error fetching moderator batches:", error);
    return sendResponse({
      success: false,
      message: "Internal server error",
      status: 500,
    });
  }
}

// POST /api/moderators/[id]/batches - Assign batches to moderator
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    // Authenticate - only ADMIN and SUPER_ADMIN can modify
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
    const { batchIds } = body;

    if (!batchIds || !Array.isArray(batchIds) || batchIds.length === 0) {
      return sendResponse({
        success: false,
        message: "batchIds array is required",
        status: 400,
      });
    }

    // Check if moderator exists
    const moderator = await prisma.moderator.findUnique({
      where: { id },
    });

    if (!moderator) {
      return sendResponse({
        success: false,
        message: "Moderator not found",
        status: 404,
      });
    }

    // Assign batches to moderator
    const updatedModerator = await prisma.moderator.update({
      where: { id },
      data: {
        batches: {
          connect: batchIds.map((batchId) => ({ id: batchId })),
        },
      },
      include: {
        batches: true,
      },
    });

    return sendResponse({
      success: true,
      message: `${batchIds.length} batches assigned to moderator successfully`,
      data: updatedModerator.batches,
    });
  } catch (error) {
    console.error("Error assigning batches to moderator:", error);
    return sendResponse({
      success: false,
      message: "Internal server error",
      status: 500,
    });
  }
}

// DELETE /api/moderators/[id]/batches - Remove batches from moderator
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    // Authenticate - only ADMIN and SUPER_ADMIN can modify
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
    const { batchIds } = body;

    if (!batchIds || !Array.isArray(batchIds) || batchIds.length === 0) {
      return sendResponse({
        success: false,
        message: "batchIds array is required",
        status: 400,
      });
    }

    // Check if moderator exists
    const moderator = await prisma.moderator.findUnique({
      where: { id },
    });

    if (!moderator) {
      return sendResponse({
        success: false,
        message: "Moderator not found",
        status: 404,
      });
    }

    // Remove batches from moderator
    const updatedModerator = await prisma.moderator.update({
      where: { id },
      data: {
        batches: {
          disconnect: batchIds.map((batchId) => ({ id: batchId })),
        },
      },
      include: {
        batches: true,
      },
    });

    return sendResponse({
      success: true,
      message: `${batchIds.length} batches removed from moderator successfully`,
      data: updatedModerator.batches,
    });
  } catch (error) {
    console.error("Error removing batches from moderator:", error);
    return sendResponse({
      success: false,
      message: "Internal server error",
      status: 500,
    });
  }
}
