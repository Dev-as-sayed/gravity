// src/app/api/teachers/[id]/route.ts
import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { authenticate, apiAuthenticator } from "@/lib/apiAuthenticator";
import bcrypt from "bcryptjs";
import { sendResponse } from "@/lib/sendResponse";

// GET /api/teachers/[id] - Get single teacher by ID
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    // Authenticate - ADMIN, SUPER_ADMIN can view any teacher
    const auth = await authenticate(req, "ADMIN", "SUPER_ADMIN");

    if (!auth.success) {
      return sendResponse({
        success: false,
        message: auth.error || "Unauthorized",
        status: auth.status || 401,
      });
    }

    const { id } = params;

    const teacher = await prisma.teacher.findUnique({
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
        courses: {
          select: {
            id: true,
            title: true,
            slug: true,
            description: true,
            subject: true,
            category: true,
            thumbnail: true,
            duration: true,
            level: true,
            price: true,
            isFree: true,
            _count: {
              select: {
                batches: true,
              },
            },
          },
        },
        batches: {
          select: {
            id: true,
            name: true,
            slug: true,
            subject: true,
            description: true,
            mode: true,
            startDate: true,
            endDate: true,
            price: true,
            offerPrice: true,
            currentEnrollments: true,
            maxStudents: true,
            isActive: true,
            _count: {
              select: {
                enrollments: true,
              },
            },
          },
        },
        exams: {
          select: {
            id: true,
            title: true,
            type: true,
            subject: true,
            examDate: true,
            fullMarks: true,
            status: true,
          },
        },
        quizzes: {
          select: {
            id: true,
            title: true,
            difficulty: true,
            subject: true,
            timeLimit: true,
            totalMarks: true,
            status: true,
          },
        },
        notes: {
          select: {
            id: true,
            title: true,
            slug: true,
            subject: true,
            topic: true,
            isPublic: true,
            isPremium: true,
            downloads: true,
            views: true,
          },
        },
        blogs: {
          select: {
            id: true,
            title: true,
            slug: true,
            views: true,
            likes: true,
            publishedAt: true,
          },
        },
        posts: {
          select: {
            id: true,
            title: true,
            type: true,
            status: true,
            views: true,
            createdAt: true,
          },
        },
        doubts: {
          select: {
            id: true,
            title: true,
            status: true,
            createdAt: true,
          },
        },
        _count: {
          select: {
            courses: true,
            batches: true,
            exams: true,
            quizzes: true,
            notes: true,
            blogs: true,
            posts: true,
            doubts: true,
          },
        },
      },
    });

    if (!teacher) {
      return sendResponse({
        success: false,
        message: "Teacher not found",
        status: 404,
      });
    }

    return sendResponse({
      success: true,
      message: "Teacher fetched successfully",
      data: teacher,
    });
  } catch (error) {
    console.error("Error fetching teacher:", error);
    return sendResponse({
      success: false,
      message: "Internal server error",
      status: 500,
    });
  }
}

// PUT /api/teachers/[id] - Update teacher (Admin only)
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

    // Check if teacher exists
    const existingTeacher = await prisma.teacher.findUnique({
      where: { id },
      include: { user: true },
    });

    if (!existingTeacher) {
      return sendResponse({
        success: false,
        message: "Teacher not found",
        status: 404,
      });
    }

    // Update teacher
    const updatedTeacher = await prisma.$transaction(async (tx) => {
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
              NOT: { id: existingTeacher.userId },
            },
          });

          if (existingUser) {
            throw new Error("Email or phone already in use");
          }
        }

        await tx.user.update({
          where: { id: existingTeacher.userId },
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

      // Update teacher profile
      const teacher = await tx.teacher.update({
        where: { id },
        data: {
          name: body.name,
          bio: body.bio,
          qualification: body.qualification,
          expertise: body.expertise,
          profileImage: body.profileImage,
          coverImage: body.coverImage,
          designation: body.designation,
          institute: body.institute,
          experience: body.experience,
          achievements: body.achievements,
          employeeId: body.employeeId,
          joiningDate: body.joiningDate ? new Date(body.joiningDate) : null,
          specializations: body.specializations,
          researchPapers: body.researchPapers,
          awards: body.awards,
          gstNumber: body.gstNumber,
          panNumber: body.panNumber,
          bankDetails: body.bankDetails,
          upiId: body.upiId,
          website: body.website,
          linkedin: body.linkedin,
          youtube: body.youtube,
          twitter: body.twitter,
          officeHours: body.officeHours,
        },
        include: {
          user: true,
        },
      });

      return teacher;
    });

    return sendResponse({
      success: true,
      message: "Teacher updated successfully",
      data: updatedTeacher,
    });
  } catch (error: any) {
    console.error("Error updating teacher:", error);
    return sendResponse({
      success: false,
      message: error.message || "Internal server error",
      status: 500,
    });
  }
}

// PATCH /api/teachers/[id]/status - Toggle teacher active status
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

    // Check if teacher exists
    const teacher = await prisma.teacher.findUnique({
      where: { id },
      include: { user: true },
    });

    if (!teacher) {
      return sendResponse({
        success: false,
        message: "Teacher not found",
        status: 404,
      });
    }

    // Update user active status
    const updatedUser = await prisma.user.update({
      where: { id: teacher.userId },
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
      message: `Teacher ${body.isActive ? "activated" : "deactivated"} successfully`,
      data: {
        teacherId: teacher.id,
        userId: teacher.userId,
        isActive: updatedUser.isActive,
      },
    });
  } catch (error) {
    console.error("Error toggling teacher status:", error);
    return sendResponse({
      success: false,
      message: "Internal server error",
      status: 500,
    });
  }
}

// DELETE /api/teachers/[id] - Delete teacher (Admin only)
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

    // Check if teacher exists
    const teacher = await prisma.teacher.findUnique({
      where: { id },
      include: {
        user: true,
        courses: { select: { id: true } },
        batches: { select: { id: true } },
      },
    });

    if (!teacher) {
      return sendResponse({
        success: false,
        message: "Teacher not found",
        status: 404,
      });
    }

    // Check if teacher has active courses or batches
    if (teacher.courses.length > 0 || teacher.batches.length > 0) {
      return sendResponse({
        success: false,
        message:
          "Cannot delete teacher with existing courses or batches. Please reassign or delete them first.",
        status: 400,
      });
    }

    // Delete teacher and associated user
    await prisma.$transaction(async (tx) => {
      // Delete teacher profile
      await tx.teacher.delete({
        where: { id },
      });

      // Delete user (this will cascade to related records)
      await tx.user.delete({
        where: { id: teacher.userId },
      });
    });

    return sendResponse({
      success: true,
      message: "Teacher deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting teacher:", error);
    return sendResponse({
      success: false,
      message: "Internal server error",
      status: 500,
    });
  }
}
