// src/app/api/teachers/route.ts
import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { authenticate } from "@/lib/apiAuthenticator";
import bcrypt from "bcryptjs";
import { sendResponse } from "@/lib/sendResponse";

// GET /api/teachers - Get all teachers (Admin only)
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
    const subject = searchParams.get("subject");
    const minExperience = searchParams.get("minExperience")
      ? parseInt(searchParams.get("minExperience")!)
      : undefined;

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

    // Search by name, email, phone, or expertise
    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { user: { email: { contains: search, mode: "insensitive" } } },
        { user: { phone: { contains: search, mode: "insensitive" } } },
        { expertise: { has: search } },
      ];
    }

    // Filter by subject/expertise
    if (subject) {
      where.expertise = { has: subject };
    }

    // Filter by minimum experience
    if (minExperience) {
      where.experience = { gte: minExperience };
    }

    // Get teachers with pagination
    const [teachers, total] = await Promise.all([
      prisma.teacher.findMany({
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
              isActive: true,
              isVerified: true,
              emailVerified: true,
              phoneVerified: true,
              lastLogin: true,
              createdAt: true,
            },
          },
          courses: {
            select: {
              id: true,
              title: true,
              slug: true,
              level: true,
              price: true,
              isFree: true,
            },
          },
          batches: {
            select: {
              id: true,
              name: true,
              subject: true,
              mode: true,
              startDate: true,
              currentEnrollments: true,
            },
          },
          _count: {
            select: {
              courses: true,
              batches: true,
              exams: true,
              quizzes: true,
              notes: true,
            },
          },
        },
      }),
      prisma.teacher.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return sendResponse({
      success: true,
      message: "Teachers fetched successfully",
      data: teachers,
      meta: {
        page,
        limit,
        total,
        totalPages,
      },
    });
  } catch (error) {
    console.error("Error fetching teachers:", error);
    return sendResponse({
      success: false,
      message: "Internal server error",
      status: 500,
    });
  }
}

// POST /api/teachers - Create a new teacher (Admin only)
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

    // Hash password
    const hashedPassword = await bcrypt.hash(body.password, 10);

    // Create teacher with user account
    const teacher = await prisma.$transaction(async (tx) => {
      // Create user
      const user = await tx.user.create({
        data: {
          email: body.email,
          password: hashedPassword,
          phone: body.phone,
          alternatePhone: body.alternatePhone,
          role: "TEACHER",
          name: body.name,
          profileImage: body.profileImage,
          isActive: body.isActive ?? true,
          emailVerified: body.emailVerified ?? false,
          phoneVerified: body.phoneVerified ?? false,
        },
      });

      // Create teacher profile
      const teacher = await tx.teacher.create({
        data: {
          userId: user.id,
          name: body.name,
          bio: body.bio,
          qualification: body.qualification,
          expertise: body.expertise || [],
          profileImage: body.profileImage,
          coverImage: body.coverImage,
          designation: body.designation,
          institute: body.institute,
          experience: body.experience,
          achievements: body.achievements || [],
          employeeId: body.employeeId,
          joiningDate: body.joiningDate ? new Date(body.joiningDate) : null,
          specializations: body.specializations || [],
          researchPapers: body.researchPapers,
          awards: body.awards || [],
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
      });

      // Create notification preferences
      await tx.notificationPreference.create({
        data: {
          userId: user.id,
        },
      });

      return { user, teacher };
    });

    return sendResponse({
      success: true,
      message: "Teacher created successfully",
      data: teacher,
      status: 201,
    });
  } catch (error) {
    console.error("Error creating teacher:", error);
    return sendResponse({
      success: false,
      message: "Internal server error",
      status: 500,
    });
  }
}
