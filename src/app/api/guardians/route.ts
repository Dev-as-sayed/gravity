// src/app/api/guardians/route.ts
import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { authenticate } from "@/lib/apiAuthenticator";
import bcrypt from "bcryptjs";
import { sendResponse } from "@/lib/sendResponse";

// GET /api/guardians - Get all guardians (Admin only)
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
    const relationship = searchParams.get("relationship");
    const hasStudents = searchParams.get("hasStudents");

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

    // Search by name, email, phone
    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { user: { email: { contains: search, mode: "insensitive" } } },
        { user: { phone: { contains: search, mode: "insensitive" } } },
      ];
    }

    // Filter by relationship
    if (relationship) {
      where.relationship = relationship;
    }

    // Filter by student association
    if (hasStudents === "true") {
      where.students = { some: {} };
    } else if (hasStudents === "false") {
      where.students = { none: {} };
    }

    // Get guardians with pagination
    const [guardians, total] = await Promise.all([
      prisma.guardian.findMany({
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
          students: {
            select: {
              id: true,
              name: true,
              class: true,
              institute: true,
              user: {
                select: {
                  email: true,
                  phone: true,
                },
              },
            },
          },
          _count: {
            select: {
              students: true,
              comments: true,
              postReactions: true,
            },
          },
        },
      }),
      prisma.guardian.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return sendResponse({
      success: true,
      message: "Guardians fetched successfully",
      data: guardians,
      meta: {
        page,
        limit,
        total,
        totalPages,
      },
    });
  } catch (error) {
    console.error("Error fetching guardians:", error);
    return sendResponse({
      success: false,
      message: "Internal server error",
      status: 500,
    });
  }
}

// POST /api/guardians - Create a new guardian (Admin only)
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
    if (
      !body.email ||
      !body.password ||
      !body.phone ||
      !body.name ||
      !body.relationship
    ) {
      return sendResponse({
        success: false,
        message:
          "Missing required fields: email, password, phone, name, relationship",
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

    // Create guardian with user account
    const guardian = await prisma.$transaction(async (tx) => {
      // Create user
      const user = await tx.user.create({
        data: {
          email: body.email,
          password: hashedPassword,
          phone: body.phone,
          alternatePhone: body.alternatePhone,
          role: "GUARDIAN",
          name: body.name,
          profileImage: body.profileImage,
          isActive: body.isActive ?? true,
          emailVerified: body.emailVerified ?? false,
          phoneVerified: body.phoneVerified ?? false,
        },
      });

      // Create guardian profile
      const guardian = await tx.guardian.create({
        data: {
          userId: user.id,
          name: body.name,
          relationship: body.relationship,
          occupation: body.occupation,
          income: body.income ? parseFloat(body.income) : null,
          notificationPrefs: body.notificationPrefs,
        },
      });

      // Create notification preferences
      await tx.notificationPreference.create({
        data: {
          userId: user.id,
        },
      });

      return { user, guardian };
    });

    return sendResponse({
      success: true,
      message: "Guardian created successfully",
      data: guardian,
      status: 201,
    });
  } catch (error) {
    console.error("Error creating guardian:", error);
    return sendResponse({
      success: false,
      message: "Internal server error",
      status: 500,
    });
  }
}
