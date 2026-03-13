// app/api/users/[id]/route.ts
import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { authenticate } from "@/lib/apiAuthenticator";
import { sendResponse } from "@/lib/sendResponse";

// GET /api/users/[id] - Get single user by ID (Admin only)
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    // Authenticate - only ADMIN and SUPER_ADMIN can access
    const auth = await authenticate(req, "ADMIN", "SUPER_ADMIN");

    if (!auth.success) {
      return sendResponse({
        success: false,
        message: auth.error || "Unauthorized",
        status: auth.status || 401,
      });
    }

    const { id } = params;

    // Get user with all relations
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        phone: true,
        alternatePhone: true,
        role: true,
        isActive: true,
        isVerified: true,
        emailVerified: true,
        phoneVerified: true,
        lastLogin: true,
        name: true,
        profileImage: true,
        bio: true,
        dateOfBirth: true,
        gender: true,
        address: true,
        city: true,
        state: true,
        pincode: true,
        twoFactorEnabled: true,
        loginAttempts: true,
        lockedUntil: true,
        createdAt: true,
        updatedAt: true,
        // Include role-specific data
        teacher: {
          select: {
            id: true,
            name: true,
            qualification: true,
            expertise: true,
            experience: true,
            institute: true,
            bio: true,
            gstNumber: true,
            panNumber: true,
            website: true,
            linkedin: true,
            youtube: true,
            twitter: true,
            totalStudents: true,
            averageRating: true,
          },
        },
        student: {
          select: {
            id: true,
            name: true,
            dateOfBirth: true,
            gender: true,
            address: true,
            city: true,
            state: true,
            pincode: true,
            institute: true,
            educationLevel: true,
            class: true,
            board: true,
            hscYear: true,
            rollNumber: true,
            registrationNumber: true,
            preferredSubjects: true,
            learningGoals: true,
            examTargets: true,
            guardian: true,
          },
        },
        guardian: {
          select: {
            id: true,
            name: true,
            relationship: true,
            occupation: true,
            students: {
              select: {
                id: true,
                name: true,
                class: true,
                institute: true,
              },
            },
          },
        },
        moderator: {
          select: {
            id: true,
            name: true,
            assignedBy: true,
            permissions: true,
            batches: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        admin: {
          select: {
            id: true,
            name: true,
            role: true,
            permissions: true,
            department: true,
          },
        },
        // Include counts
        _count: {
          select: {
            notifications: true,
            sessions: true,
            auditLogs: true,
            supportTickets: true,
            referralsMade: true,
            referralsReceived: true,
          },
        },
      },
    });

    if (!user) {
      return sendResponse({
        success: false,
        message: "User not found",
        status: 404,
      });
    }

    return sendResponse({
      success: true,
      message: "User fetched successfully",
      data: user,
    });
  } catch (error) {
    console.error("Error fetching user:", error);
    return sendResponse({
      success: false,
      message: "Internal server error",
      status: 500,
    });
  }
}

// PUT /api/users/[id] - Update user (Admin only)
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    // Authenticate - only ADMIN and SUPER_ADMIN can access
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

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id },
      include: {
        teacher: true,
        student: true,
        guardian: true,
        moderator: true,
        admin: true,
      },
    });

    if (!existingUser) {
      return sendResponse({
        success: false,
        message: "User not found",
        status: 404,
      });
    }

    // Update user
    const updatedUser = await prisma.$transaction(async (tx) => {
      // Update base user
      const user = await tx.user.update({
        where: { id },
        data: {
          email: body.email,
          phone: body.phone,
          alternatePhone: body.alternatePhone,
          name: body.name,
          profileImage: body.profileImage,
          bio: body.bio,
          dateOfBirth: body.dateOfBirth ? new Date(body.dateOfBirth) : null,
          gender: body.gender,
          address: body.address,
          city: body.city,
          state: body.state,
          pincode: body.pincode,
          isActive: body.isActive,
          isVerified: body.isVerified,
          emailVerified: body.emailVerified,
          phoneVerified: body.phoneVerified,
        },
      });

      // Update role-specific profile based on existing role
      const role = existingUser.role;

      switch (role) {
        case "TEACHER":
          await tx.teacher.update({
            where: { userId: id },
            data: {
              name: body.name,
              qualification: body.qualification,
              expertise: body.expertise,
              institute: body.institute,
              experience: body.experience,
              bio: body.bio,
              gstNumber: body.gstNumber,
              panNumber: body.panNumber,
              website: body.website,
              linkedin: body.linkedin,
            },
          });
          break;

        case "STUDENT":
          await tx.student.update({
            where: { userId: id },
            data: {
              name: body.name,
              dateOfBirth: body.dateOfBirth ? new Date(body.dateOfBirth) : null,
              gender: body.gender,
              address: body.address,
              city: body.city,
              state: body.state,
              pincode: body.pincode,
              institute: body.institute,
              class: body.class,
              board: body.board,
              educationLevel: body.educationLevel,
              rollNumber: body.rollNumber,
              registrationNumber: body.registrationNumber,
              preferredSubjects: body.preferredSubjects,
              learningGoals: body.learningGoals,
              examTargets: body.examTargets,
            },
          });
          break;

        case "GUARDIAN":
          await tx.guardian.update({
            where: { userId: id },
            data: {
              name: body.name,
              relationship: body.relationship,
              occupation: body.occupation,
              income: body.income,
            },
          });
          break;

        case "MODERATOR":
          await tx.moderator.update({
            where: { userId: id },
            data: {
              name: body.name,
              permissions: body.permissions,
            },
          });
          break;

        case "ADMIN":
        case "SUPER_ADMIN":
          await tx.admin.update({
            where: { userId: id },
            data: {
              name: body.name,
              permissions: body.permissions,
              department: body.department,
            },
          });
          break;
      }

      return user;
    });

    // Remove password from response
    const { password, ...userWithoutPassword } = updatedUser;

    return sendResponse({
      success: true,
      message: "User updated successfully",
      data: userWithoutPassword,
    });
  } catch (error) {
    console.error("Error updating user:", error);
    return sendResponse({
      success: false,
      message: "Internal server error",
      status: 500,
    });
  }
}

// DELETE /api/users/[id] - Delete user (Admin only)
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    // Authenticate - only ADMIN and SUPER_ADMIN can access
    const auth = await authenticate(req, "ADMIN", "SUPER_ADMIN");

    if (!auth.success) {
      return sendResponse({
        success: false,
        message: auth.error || "Unauthorized",
        status: auth.status || 401,
      });
    }

    const { id } = params;

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id },
    });

    if (!existingUser) {
      return sendResponse({
        success: false,
        message: "User not found",
        status: 404,
      });
    }

    // Don't allow deleting your own account
    if (auth.user?.id === id) {
      return sendResponse({
        success: false,
        message: "Cannot delete your own account",
        status: 400,
      });
    }

    // Delete user (cascading will handle related records)
    await prisma.user.delete({
      where: { id },
    });

    return sendResponse({
      success: true,
      message: "User deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting user:", error);
    return sendResponse({
      success: false,
      message: "Internal server error",
      status: 500,
    });
  }
}

// PATCH /api/users/[id]/toggle-status - Activate/Deactivate user
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    // Authenticate - only ADMIN and SUPER_ADMIN can access
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

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id },
    });

    if (!existingUser) {
      return sendResponse({
        success: false,
        message: "User not found",
        status: 404,
      });
    }

    // Don't allow deactivating SUPER_ADMIN
    if (existingUser.role === "SUPER_ADMIN" && body.isActive === false) {
      return sendResponse({
        success: false,
        message: "Cannot deactivate SUPER_ADMIN account",
        status: 400,
      });
    }

    // Update user status
    const updatedUser = await prisma.user.update({
      where: { id },
      data: {
        isActive: body.isActive,
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
      },
    });

    return sendResponse({
      success: true,
      message: `User ${body.isActive ? "activated" : "deactivated"} successfully`,
      data: updatedUser,
    });
  } catch (error) {
    console.error("Error toggling user status:", error);
    return sendResponse({
      success: false,
      message: "Internal server error",
      status: 500,
    });
  }
}
