// src/app/api/students/route.ts
import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { authenticate } from "@/lib/apiAuthenticator";
import bcrypt from "bcryptjs";
import { sendResponse } from "@/lib/sendResponse";

// GET /api/students - Get all students (Admin only)
export async function GET(req: NextRequest) {
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

    // Parse query parameters
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const search = searchParams.get("search");
    const isActive = searchParams.get("isActive");
    const class_ = searchParams.get("class");
    const board = searchParams.get("board");
    const educationLevel = searchParams.get("educationLevel");
    const hasGuardian = searchParams.get("hasGuardian");

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {};

    // Filter by user active status
    if (isActive !== null) {
      where.user = {
        isActive: isActive === "true",
      };
    }

    // Search by name, email, phone, or roll number
    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { user: { email: { contains: search, mode: "insensitive" } } },
        { user: { phone: { contains: search, mode: "insensitive" } } },
        { rollNumber: { contains: search, mode: "insensitive" } },
      ];
    }

    // Filter by class
    if (class_) {
      where.class = class_;
    }

    // Filter by board
    if (board) {
      where.board = board;
    }

    // Filter by education level
    if (educationLevel) {
      where.educationLevel = educationLevel;
    }

    // Filter by guardian status
    if (hasGuardian === "true") {
      where.guardianId = { not: null };
    } else if (hasGuardian === "false") {
      where.guardianId = null;
    }

    // Get students with pagination
    const [students, total] = await Promise.all([
      prisma.student.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
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
            select: {
              id: true,
              name: true,
              relationship: true,
              occupation: true,
            },
          },
          enrollments: {
            select: {
              id: true,
              batchId: true,
              status: true,
              paymentStatus: true,
              createdAt: true,
              batch: {
                select: {
                  id: true,
                  name: true,
                  subject: true,
                },
              },
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
            },
          },
        },
      }),
      prisma.student.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return sendResponse({
      success: true,
      message: "Students fetched successfully",
      data: students,
      meta: {
        page,
        limit,
        total,
        totalPages,
      },
    });
  } catch (error) {
    console.error("Error fetching students:", error);
    return sendResponse({
      success: false,
      message: "Internal server error",
      status: 500,
    });
  }
}

// POST /api/students - Create a new student (Admin only)
export async function POST(req: NextRequest) {
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

    const body = await req.json();

    // Validate required fields
    if (!body.email || !body.password || !body.phone || !body.name) {
      return sendResponse({
        success: false,
        message: "Missing required fields: email, password, phone, name",
        status: 400,
      });
    }

    // Check if user already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ email: body.email }, { phone: body.phone }],
      },
    });

    if (existingUser) {
      return sendResponse({
        success: false,
        message: "User with this email or phone already exists",
        status: 400,
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

    // Hash password
    const hashedPassword = await bcrypt.hash(body.password, 10);

    // Create student with user account
    const student = await prisma.$transaction(async (tx) => {
      // Create user
      const user = await tx.user.create({
        data: {
          email: body.email,
          password: hashedPassword,
          phone: body.phone,
          alternatePhone: body.alternatePhone,
          role: "STUDENT",
          name: body.name,
          profileImage: body.profileImage,
          isActive: body.isActive ?? true,
          emailVerified: body.emailVerified ?? false,
          phoneVerified: body.phoneVerified ?? false,
        },
      });

      // Create student profile
      const student = await tx.student.create({
        data: {
          userId: user.id,
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
          preferredSubjects: body.preferredSubjects || [],
          learningGoals: body.learningGoals || [],
          examTargets: body.examTargets || [],
        },
      });

      // Create notification preferences
      await tx.notificationPreference.create({
        data: {
          userId: user.id,
        },
      });

      return { user, student };
    });

    return sendResponse({
      success: true,
      message: "Student created successfully",
      data: student,
      status: 201,
    });
  } catch (error) {
    console.error("Error creating student:", error);
    return sendResponse({
      success: false,
      message: "Internal server error",
      status: 500,
    });
  }
}
