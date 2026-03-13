// src/app/api/students/[id]/route.ts
import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { authenticate } from "@/lib/apiAuthenticator";
import bcrypt from "bcryptjs";
import { sendResponse } from "@/lib/sendResponse";

// GET /api/students/[id] - Get single student by ID
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    // Authenticate - ADMIN, SUPER_ADMIN can view any student
    const auth = await authenticate(req, "ADMIN", "SUPER_ADMIN");

    if (!auth.success) {
      return sendResponse({
        success: false,
        message: auth.error || "Unauthorized",
        status: auth.status || 401,
      });
    }

    const { id } = params;

    const student = await prisma.student.findUnique({
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
        guardian: {
          include: {
            user: {
              select: {
                email: true,
                phone: true,
              },
            },
          },
        },
        enrollments: {
          include: {
            batch: {
              select: {
                id: true,
                name: true,
                subject: true,
                mode: true,
                startDate: true,
                endDate: true,
                teacher: {
                  select: {
                    id: true,
                    name: true,
                  },
                },
              },
            },
            payments: true,
          },
          orderBy: {
            createdAt: "desc",
          },
        },
        attendances: {
          take: 10,
          orderBy: {
            date: "desc",
          },
        },
        quizResults: {
          take: 10,
          include: {
            quiz: {
              select: {
                id: true,
                title: true,
                subject: true,
                difficulty: true,
              },
            },
          },
          orderBy: {
            createdAt: "desc",
          },
        },
        examResults: {
          take: 10,
          include: {
            exam: {
              select: {
                id: true,
                title: true,
                subject: true,
                type: true,
              },
            },
          },
          orderBy: {
            createdAt: "desc",
          },
        },
        payments: {
          take: 10,
          orderBy: {
            createdAt: "desc",
          },
        },
        doubts: {
          take: 10,
          include: {
            answers: true,
          },
          orderBy: {
            createdAt: "desc",
          },
        },
        submissions: {
          take: 10,
          include: {
            assignment: {
              select: {
                id: true,
                title: true,
              },
            },
          },
          orderBy: {
            submittedAt: "desc",
          },
        },
        _count: {
          select: {
            enrollments: true,
            attendances: true,
            quizResults: true,
            examResults: true,
            payments: true,
            doubts: true,
            submissions: true,
            posts: true,
            comments: true,
          },
        },
      },
    });

    if (!student) {
      return sendResponse({
        success: false,
        message: "Student not found",
        status: 404,
      });
    }

    return sendResponse({
      success: true,
      message: "Student fetched successfully",
      data: student,
    });
  } catch (error) {
    console.error("Error fetching student:", error);
    return sendResponse({
      success: false,
      message: "Internal server error",
      status: 500,
    });
  }
}

// PUT /api/students/[id] - Update student (Admin only)
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

    // Check if student exists
    const existingStudent = await prisma.student.findUnique({
      where: { id },
      include: { user: true },
    });

    if (!existingStudent) {
      return sendResponse({
        success: false,
        message: "Student not found",
        status: 404,
      });
    }

    // Check if guardian exists if provided
    if (body.guardianId) {
      const guardian = await prisma.guardian.findUnique({
        where: { id: body.guardianId },
      });
      if (!guardian) {
        return sendResponse({
          success: false,
          message: "Guardian not found",
          status: 400,
        });
      }
    }

    // Update student
    const updatedStudent = await prisma.$transaction(async (tx) => {
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
              NOT: { id: existingStudent.userId },
            },
          });

          if (existingUser) {
            throw new Error("Email or phone already in use");
          }
        }

        await tx.user.update({
          where: { id: existingStudent.userId },
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

      // Update student profile
      const student = await tx.student.update({
        where: { id },
        data: {
          name: body.name,
          dateOfBirth: body.dateOfBirth ? new Date(body.dateOfBirth) : null,
          gender: body.gender,
          address: body.address,
          city: body.city,
          state: body.state,
          country: body.country,
          pincode: body.pincode,
          profileImage: body.profileImage,
          coverImage: body.coverImage,
          institute: body.institute,
          educationLevel: body.educationLevel,
          class: body.class,
          board: body.board,
          hscYear: body.hscYear ? parseInt(body.hscYear) : null,
          group: body.group,
          rollNumber: body.rollNumber,
          registrationNumber: body.registrationNumber,
          guardianId: body.guardianId,
          preferredSubjects: body.preferredSubjects,
          learningGoals: body.learningGoals,
          examTargets: body.examTargets,
        },
        include: {
          user: true,
          guardian: true,
        },
      });

      return student;
    });

    return sendResponse({
      success: true,
      message: "Student updated successfully",
      data: updatedStudent,
    });
  } catch (error: any) {
    console.error("Error updating student:", error);
    return sendResponse({
      success: false,
      message: error.message || "Internal server error",
      status: 500,
    });
  }
}

// PATCH /api/students/[id]/status - Toggle student active status
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

    // Check if student exists
    const student = await prisma.student.findUnique({
      where: { id },
      include: { user: true },
    });

    if (!student) {
      return sendResponse({
        success: false,
        message: "Student not found",
        status: 404,
      });
    }

    // Update user active status
    const updatedUser = await prisma.user.update({
      where: { id: student.userId },
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
      message: `Student ${body.isActive ? "activated" : "deactivated"} successfully`,
      data: {
        studentId: student.id,
        userId: student.userId,
        isActive: updatedUser.isActive,
      },
    });
  } catch (error) {
    console.error("Error toggling student status:", error);
    return sendResponse({
      success: false,
      message: "Internal server error",
      status: 500,
    });
  }
}

// DELETE /api/students/[id] - Delete student (Admin only)
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

    // Check if student exists
    const student = await prisma.student.findUnique({
      where: { id },
      include: {
        user: true,
        enrollments: { select: { id: true } },
        payments: { select: { id: true } },
      },
    });

    if (!student) {
      return sendResponse({
        success: false,
        message: "Student not found",
        status: 404,
      });
    }

    // Check if student has active enrollments or payments
    if (student.enrollments.length > 0 || student.payments.length > 0) {
      return sendResponse({
        success: false,
        message:
          "Cannot delete student with existing enrollments or payments. Please archive them first.",
        status: 400,
      });
    }

    // Delete student and associated user
    await prisma.$transaction(async (tx) => {
      // Delete student profile
      await tx.student.delete({
        where: { id },
      });

      // Delete user (this will cascade to related records)
      await tx.user.delete({
        where: { id: student.userId },
      });
    });

    return sendResponse({
      success: true,
      message: "Student deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting student:", error);
    return sendResponse({
      success: false,
      message: "Internal server error",
      status: 500,
    });
  }
}
