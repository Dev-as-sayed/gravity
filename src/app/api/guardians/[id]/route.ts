// src/app/api/guardians/[id]/route.ts
import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { authenticate } from "@/lib/apiAuthenticator";
import bcrypt from "bcryptjs";
import { sendResponse } from "@/lib/sendResponse";

// GET /api/guardians/[id] - Get single guardian by ID
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    // Authenticate - ADMIN, SUPER_ADMIN can view any guardian
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
        students: {
          include: {
            user: {
              select: {
                email: true,
                phone: true,
              },
            },
          },
        },
        comments: {
          take: 10,
          include: {
            post: {
              select: {
                id: true,
                title: true,
              },
            },
          },
          orderBy: {
            createdAt: "desc",
          },
        },
        _count: {
          select: {
            students: true,
            comments: true,
            postReactions: true,
            postBookmarks: true,
            pollVotes: true,
          },
        },
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
      message: "Guardian fetched successfully",
      data: guardian,
    });
  } catch (error) {
    console.error("Error fetching guardian:", error);
    return sendResponse({
      success: false,
      message: "Internal server error",
      status: 500,
    });
  }
}

// PUT /api/guardians/[id] - Update guardian (Admin only)
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
    const existingGuardian = await prisma.guardian.findUnique({
      where: { id },
      include: { user: true },
    });

    if (!existingGuardian) {
      return sendResponse({
        success: false,
        message: "Guardian not found",
        status: 404,
      });
    }

    // Update guardian
    const updatedGuardian = await prisma.$transaction(async (tx) => {
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
              NOT: { id: existingGuardian.userId },
            },
          });

          if (existingUser) {
            throw new Error("Email or phone already in use");
          }
        }

        await tx.user.update({
          where: { id: existingGuardian.userId },
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

      // Update guardian profile
      const guardian = await tx.guardian.update({
        where: { id },
        data: {
          name: body.name,
          relationship: body.relationship,
          occupation: body.occupation,
          income: body.income ? parseFloat(body.income) : null,
          notificationPrefs: body.notificationPrefs,
        },
        include: {
          user: true,
          students: true,
        },
      });

      return guardian;
    });

    return sendResponse({
      success: true,
      message: "Guardian updated successfully",
      data: updatedGuardian,
    });
  } catch (error: any) {
    console.error("Error updating guardian:", error);
    return sendResponse({
      success: false,
      message: error.message || "Internal server error",
      status: 500,
    });
  }
}

// PATCH /api/guardians/[id]/status - Toggle guardian active status
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

    // Check if guardian exists
    const guardian = await prisma.guardian.findUnique({
      where: { id },
      include: { user: true },
    });

    if (!guardian) {
      return sendResponse({
        success: false,
        message: "Guardian not found",
        status: 404,
      });
    }

    // Update user active status
    const updatedUser = await prisma.user.update({
      where: { id: guardian.userId },
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
      message: `Guardian ${body.isActive ? "activated" : "deactivated"} successfully`,
      data: {
        guardianId: guardian.id,
        userId: guardian.userId,
        isActive: updatedUser.isActive,
      },
    });
  } catch (error) {
    console.error("Error toggling guardian status:", error);
    return sendResponse({
      success: false,
      message: "Internal server error",
      status: 500,
    });
  }
}

// DELETE /api/guardians/[id] - Delete guardian (Admin only)
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

    // Check if guardian exists
    const guardian = await prisma.guardian.findUnique({
      where: { id },
      include: {
        user: true,
        students: { select: { id: true } },
      },
    });

    if (!guardian) {
      return sendResponse({
        success: false,
        message: "Guardian not found",
        status: 404,
      });
    }

    // Check if guardian has associated students
    if (guardian.students.length > 0) {
      return sendResponse({
        success: false,
        message:
          "Cannot delete guardian with associated students. Please reassign students first.",
        status: 400,
      });
    }

    // Delete guardian and associated user
    await prisma.$transaction(async (tx) => {
      // Delete guardian profile
      await tx.guardian.delete({
        where: { id },
      });

      // Delete user (this will cascade to related records)
      await tx.user.delete({
        where: { id: guardian.userId },
      });
    });

    return sendResponse({
      success: true,
      message: "Guardian deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting guardian:", error);
    return sendResponse({
      success: false,
      message: "Internal server error",
      status: 500,
    });
  }
}
