// app/api/doubts/[id]/route.ts
import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { authenticate } from "@/lib/apiAuthenticator";
import { sendResponse } from "@/lib/sendResponse";

// GET /api/doubts/[id] - Get single doubt
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

    const doubt = await prisma.doubt.findUnique({
      where: { id },
      include: {
        student: {
          select: {
            id: true,
            name: true,
            profileImage: true,
          },
        },
        teacher: {
          select: {
            id: true,
            name: true,
            qualification: true,
            profileImage: true,
          },
        },
        answers: {
          orderBy: { createdAt: "asc" },
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
        },
      },
    });

    if (!doubt) {
      return sendResponse({
        success: false,
        message: "Doubt not found",
        status: 404,
      });
    }

    // Check permissions
    if (
      auth.user?.role === "STUDENT" &&
      doubt.studentId !== auth.user.studentId
    ) {
      return sendResponse({
        success: false,
        message: "You don't have permission to view this doubt",
        status: 403,
      });
    }

    // Increment view count
    await prisma.doubt.update({
      where: { id },
      data: { viewCount: { increment: 1 } },
    });

    return sendResponse({
      success: true,
      message: "Doubt fetched successfully",
      data: doubt,
    });
  } catch (error) {
    console.error("Error fetching doubt:", error);
    return sendResponse({
      success: false,
      message: "Internal server error",
      status: 500,
    });
  }
}

// PUT /api/doubts/[id] - Update doubt
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    const auth = await authenticate(req, "ADMIN", "SUPER_ADMIN", "STUDENT");

    if (!auth.success) {
      return sendResponse({
        success: false,
        message: auth.error || "Unauthorized",
        status: auth.status || 401,
      });
    }

    const body = await req.json();

    const existingDoubt = await prisma.doubt.findUnique({
      where: { id },
    });

    if (!existingDoubt) {
      return sendResponse({
        success: false,
        message: "Doubt not found",
        status: 404,
      });
    }

    // Students can only update their own doubts
    if (
      auth.user?.role === "STUDENT" &&
      existingDoubt.studentId !== auth.user.studentId
    ) {
      return sendResponse({
        success: false,
        message: "You don't have permission to update this doubt",
        status: 403,
      });
    }

    const updatedDoubt = await prisma.doubt.update({
      where: { id },
      data: {
        title: body.title,
        description: body.description,
        subject: body.subject,
        topic: body.topic,
        images: body.images,
        files: body.files,
        tags: body.tags,
        isPrivate: body.isPrivate,
      },
    });

    return sendResponse({
      success: true,
      message: "Doubt updated successfully",
      data: updatedDoubt,
    });
  } catch (error) {
    console.error("Error updating doubt:", error);
    return sendResponse({
      success: false,
      message: "Internal server error",
      status: 500,
    });
  }
}

// DELETE /api/doubts/[id] - Delete doubt
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    const auth = await authenticate(req, "ADMIN", "SUPER_ADMIN", "STUDENT");

    if (!auth.success) {
      return sendResponse({
        success: false,
        message: auth.error || "Unauthorized",
        status: auth.status || 401,
      });
    }

    const existingDoubt = await prisma.doubt.findUnique({
      where: { id },
    });

    if (!existingDoubt) {
      return sendResponse({
        success: false,
        message: "Doubt not found",
        status: 404,
      });
    }

    // Students can only delete their own doubts
    if (
      auth.user?.role === "STUDENT" &&
      existingDoubt.studentId !== auth.user.studentId
    ) {
      return sendResponse({
        success: false,
        message: "You don't have permission to delete this doubt",
        status: 403,
      });
    }

    // Delete doubt and cascade answers
    await prisma.doubt.delete({
      where: { id },
    });

    return sendResponse({
      success: true,
      message: "Doubt deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting doubt:", error);
    return sendResponse({
      success: false,
      message: "Internal server error",
      status: 500,
    });
  }
}
