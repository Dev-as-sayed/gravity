// src/app/api/moderators/[id]/route.ts
import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { authenticate } from "@/lib/apiAuthenticator";
import bcrypt from "bcryptjs";
import { sendResponse } from "@/lib/sendResponse";

// GET /api/moderators/[id] - Get single moderator by ID
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    // Authenticate - ADMIN, SUPER_ADMIN can view any moderator
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
        user: {
          select: {
            id: true,
            email: true,
            phone: true,
            alternatePhone: true,
            isActive: true,
            isVerified: true,
            emailVerified: true,
            phoneVerified: true,
            lastLogin: true,
            createdAt: true,
            updatedAt: true,
          },
        },
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
          },
        },
        _count: {
          select: {
            batches: true,
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

    // Get assigner details
    let assigner = null;
    if (moderator.assignedBy) {
      const teacher = await prisma.teacher.findUnique({
        where: { id: moderator.assignedBy },
        select: {
          id: true,
          name: true,
          user: {
            select: {
              email: true,
            },
          },
        },
      });
      if (teacher) {
        assigner = { type: "TEACHER", ...teacher };
      } else {
        const admin = await prisma.admin.findUnique({
          where: { id: moderator.assignedBy },
          select: {
            id: true,
            name: true,
            role: true,
            user: {
              select: {
                email: true,
              },
            },
          },
        });
        if (admin) {
          assigner = { type: "ADMIN", ...admin };
        }
      }
    }

    return sendResponse({
      success: true,
      message: "Moderator fetched successfully",
      data: { ...moderator, assigner },
    });
  } catch (error) {
    console.error("Error fetching moderator:", error);
    return sendResponse({
      success: false,
      message: "Internal server error",
      status: 500,
    });
  }
}

// PUT /api/moderators/[id] - Update moderator (Admin only)
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

    // Check if moderator exists
    const existingModerator = await prisma.moderator.findUnique({
      where: { id },
      include: { user: true },
    });

    if (!existingModerator) {
      return sendResponse({
        success: false,
        message: "Moderator not found",
        status: 404,
      });
    }

    // Update moderator
    const updatedModerator = await prisma.$transaction(async (tx) => {
      // Update user if email/phone changed
      if (
        body.email ||
        body.phone ||
        body.name ||
        body.isActive !== undefined
      ) {
        // Check if new email/phone already exists
        if (body.email || body.phone) {
          const existingUser = await tx.user.findFirst({
            where: {
              OR: [
                ...(body.email ? [{ email: body.email }] : []),
                ...(body.phone ? [{ phone: body.phone }] : []),
              ],
              NOT: { id: existingModerator.userId },
            },
          });

          if (existingUser) {
            throw new Error("Email or phone already in use");
          }
        }

        await tx.user.update({
          where: { id: existingModerator.userId },
          data: {
            email: body.email,
            phone: body.phone,
            alternatePhone: body.alternatePhone,
            name: body.name,
            profileImage: body.profileImage,
            isActive: body.isActive,
            emailVerified: body.emailVerified,
            phoneVerified: body.phoneVerified,
          },
        });
      }

      // Update moderator profile
      const moderator = await tx.moderator.update({
        where: { id },
        data: {
          name: body.name,
          permissions: body.permissions,
          assignedBy: body.assignedBy,
        },
        include: {
          user: true,
          batches: true,
        },
      });

      return moderator;
    });

    return sendResponse({
      success: true,
      message: "Moderator updated successfully",
      data: updatedModerator,
    });
  } catch (error: any) {
    console.error("Error updating moderator:", error);
    return sendResponse({
      success: false,
      message: error.message || "Internal server error",
      status: 500,
    });
  }
}

// PATCH /api/moderators/[id]/status - Toggle moderator active status
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    // Authenticate - only ADMIN and SUPER_ADMIN can toggle status
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

    if (body.isActive === undefined) {
      return sendResponse({
        success: false,
        message: "isActive field is required",
        status: 400,
      });
    }

    // Check if moderator exists
    const moderator = await prisma.moderator.findUnique({
      where: { id },
      include: { user: true },
    });

    if (!moderator) {
      return sendResponse({
        success: false,
        message: "Moderator not found",
        status: 404,
      });
    }

    // Update user active status
    const updatedUser = await prisma.user.update({
      where: { id: moderator.userId },
      data: {
        isActive: body.isActive,
      },
      select: {
        id: true,
        isActive: true,
      },
    });

    return sendResponse({
      success: true,
      message: `Moderator ${body.isActive ? "activated" : "deactivated"} successfully`,
      data: {
        moderatorId: moderator.id,
        userId: moderator.userId,
        isActive: updatedUser.isActive,
      },
    });
  } catch (error) {
    console.error("Error toggling moderator status:", error);
    return sendResponse({
      success: false,
      message: "Internal server error",
      status: 500,
    });
  }
}

// DELETE /api/moderators/[id] - Delete moderator (Admin only)
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    // Authenticate - only ADMIN and SUPER_ADMIN can delete
    const auth = await authenticate(req, "ADMIN", "SUPER_ADMIN");

    if (!auth.success) {
      return sendResponse({
        success: false,
        message: auth.error || "Unauthorized",
        status: auth.status || 401,
      });
    }

    const { id } = params;

    // Check if moderator exists
    const moderator = await prisma.moderator.findUnique({
      where: { id },
      include: {
        user: true,
        batches: { select: { id: true } },
      },
    });

    if (!moderator) {
      return sendResponse({
        success: false,
        message: "Moderator not found",
        status: 404,
      });
    }

    // Delete moderator and associated user
    await prisma.$transaction(async (tx) => {
      // Remove moderator from batches first
      await tx.batch.updateMany({
        where: { moderators: { some: { id: moderator.id } } },
        data: { moderators: { disconnect: { id: moderator.id } } },
      });

      // Delete moderator profile
      await tx.moderator.delete({
        where: { id },
      });

      // Delete user (this will cascade to related records)
      await tx.user.delete({
        where: { id: moderator.userId },
      });
    });

    return sendResponse({
      success: true,
      message: "Moderator deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting moderator:", error);
    return sendResponse({
      success: false,
      message: "Internal server error",
      status: 500,
    });
  }
}
