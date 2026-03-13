// app/api/users/route.ts
import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { authenticate } from "@/lib/apiAuthenticator";
import { sendResponse } from "@/lib/sendResponse";
import { tr } from "zod/locales";
import { Prisma } from "@/generated/prisma/client";

// GET /api/users - Get all users (Admin only)
export async function GET(req: NextRequest) {
  try {
    console.log("Fetching users with query:", req.url);

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
    const role = searchParams.get("role");
    const search = searchParams.get("search");
    const isActive = searchParams.get("isActive");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {};

    // Handle role filter - can be single role or multiple roles
    if (role) {
      if (role.includes(",")) {
        // Multiple roles - split and use 'in' operator
        const roles = role.split(",").map((r) => r.trim());
        where.role = { in: roles };
      } else {
        // Single role - direct equality
        where.role = role;
      }
    }

    // Handle isActive filter
    if (isActive !== null && isActive !== undefined) {
      where.isActive = isActive === "true";
    }

    // Handle search
    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
        { phone: { contains: search, mode: "insensitive" } },
      ];
    }

    // Handle date range filter
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) {
        where.createdAt.gte = new Date(startDate);
      }
      if (endDate) {
        where.createdAt.lte = new Date(endDate);
      }
    }

    // Log the where clause for debugging
    console.log("Where clause:", JSON.stringify(where, null, 2));

    // Get users with pagination
    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
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
          // Include role-specific data (only if needed)
          teacher:
            auth.user?.role === "SUPER_ADMIN"
              ? {
                  select: {
                    id: true,
                    name: true,
                    qualification: true,
                    expertise: true,
                    experience: true,
                    institute: true,
                  },
                }
              : false,
          student:
            auth.user?.role === "SUPER_ADMIN"
              ? {
                  select: {
                    id: true,
                    name: true,
                    institute: true,
                    class: true,
                    board: true,
                  },
                }
              : false,
          guardian:
            auth.user?.role === "SUPER_ADMIN"
              ? {
                  select: {
                    id: true,
                    name: true,
                    relationship: true,
                  },
                }
              : false,
          moderator:
            auth.user?.role === "SUPER_ADMIN"
              ? {
                  select: {
                    id: true,
                    name: true,
                  },
                }
              : false,
          admin:
            auth.user?.role === "SUPER_ADMIN"
              ? {
                  select: {
                    id: true,
                    name: true,
                    role: true,
                  },
                }
              : false,
        },
      }),
      prisma.user.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);

    console.log(`Fetched ${users.length} users out of ${total} total`);

    return sendResponse({
      success: true,
      message: "Users fetched successfully",
      data: users,
      meta: {
        page,
        limit,
        total,
        totalPages,
      },
    });
  } catch (error) {
    console.error("Error fetching users:", error);

    // More detailed error response
    if (error instanceof Prisma.PrismaClientValidationError) {
      return sendResponse({
        success: false,
        message: "Database validation error",
        status: 500,
      });
    }

    return sendResponse({
      success: false,
      message: "Internal server error",
      status: 500,
    });
  }
}

// POST /api/users - Create a new user (Admin only)
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
      !body.role
    ) {
      return sendResponse({
        success: false,
        message: "Missing required fields: email, password, phone, name, role",
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
    const bcrypt = require("bcryptjs");
    const hashedPassword = await bcrypt.hash(body.password, 10);

    // Create user with role-specific profile
    const user = await prisma.$transaction(async (tx) => {
      // Create base user
      const newUser = await tx.user.create({
        data: {
          email: body.email,
          password: hashedPassword,
          phone: body.phone,
          alternatePhone: body.alternatePhone,
          role: body.role,
          name: body.name,
          profileImage: body.profileImage,
          bio: body.bio,
          dateOfBirth: body.dateOfBirth ? new Date(body.dateOfBirth) : null,
          gender: body.gender,
          address: body.address,
          city: body.city,
          state: body.state,
          pincode: body.pincode,
          isActive: body.isActive ?? true,
          emailVerified: body.emailVerified ?? false,
          phoneVerified: body.phoneVerified ?? false,
        },
      });

      // Create role-specific profile based on role
      switch (body.role) {
        case "TEACHER":
          await tx.teacher.create({
            data: {
              userId: newUser.id,
              name: body.name,
              qualification: body.qualification,
              expertise: body.expertise || [],
              institute: body.institute,
              experience: body.experience,
              bio: body.bio,
            },
          });
          break;

        case "STUDENT":
          await tx.student.create({
            data: {
              userId: newUser.id,
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
              guardianId: body.guardianId,
            },
          });
          break;

        case "GUARDIAN":
          await tx.guardian.create({
            data: {
              userId: newUser.id,
              name: body.name,
              relationship: body.relationship,
              occupation: body.occupation,
            },
          });
          break;

        case "MODERATOR":
          await tx.moderator.create({
            data: {
              userId: newUser.id,
              name: body.name,
              assignedBy: auth.user?.id,
              permissions: body.permissions || {},
            },
          });
          break;

        case "ADMIN":
        case "SUPER_ADMIN":
          await tx.admin.create({
            data: {
              userId: newUser.id,
              name: body.name,
              role: body.role,
              permissions: body.permissions || {},
              department: body.department,
            },
          });
          break;
      }

      // Create notification preferences
      await tx.notificationPreference.create({
        data: {
          userId: newUser.id,
        },
      });

      return newUser;
    });

    // Remove password from response
    const { password, ...userWithoutPassword } = user;

    return sendResponse({
      success: true,
      message: "User created successfully",
      data: userWithoutPassword,
      status: 201,
    });
  } catch (error) {
    console.error("Error creating user:", error);
    return sendResponse({
      success: false,
      message: "Internal server error",
      status: 500,
    });
  }
}
