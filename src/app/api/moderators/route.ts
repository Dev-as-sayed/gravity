// src/app/api/moderators/route.ts
import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { authenticate } from "@/lib/apiAuthenticator";
import bcrypt from "bcryptjs";
import { sendResponse } from "@/lib/sendResponse";

// GET /api/moderators - Get all moderators (Admin only)
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
    const assignedBy = searchParams.get("assignedBy");
    const hasBatches = searchParams.get("hasBatches");

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

    // Filter by assigned by
    if (assignedBy) {
      where.assignedBy = assignedBy;
    }

    // Filter by batch association
    if (hasBatches === "true") {
      where.batches = { some: {} };
    } else if (hasBatches === "false") {
      where.batches = { none: {} };
    }

    // Get moderators with pagination
    const [moderators, total] = await Promise.all([
      prisma.moderator.findMany({
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
          batches: {
            select: {
              id: true,
              name: true,
              subject: true,
              mode: true,
              teacher: {
                select: {
                  id: true,
                  name: true,
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
      }),
      prisma.moderator.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);

    // Get assigned by user details
    const moderatorsWithAssigner = await Promise.all(
      moderators.map(async (mod) => {
        let assigner = null;
        if (mod.assignedBy) {
          const teacher = await prisma.teacher.findUnique({
            where: { id: mod.assignedBy },
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
              where: { id: mod.assignedBy },
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
        return { ...mod, assigner };
      }),
    );

    return sendResponse({
      success: true,
      message: "Moderators fetched successfully",
      data: moderatorsWithAssigner,
      meta: {
        page,
        limit,
        total,
        totalPages,
      },
    });
  } catch (error) {
    console.error("Error fetching moderators:", error);
    return sendResponse({
      success: false,
      message: "Internal server error",
      status: 500,
    });
  }
}

// POST /api/moderators - Create a new moderator (Admin only)
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

    // Create moderator with user account
    const moderator = await prisma.$transaction(async (tx) => {
      // Create user
      const user = await tx.user.create({
        data: {
          email: body.email,
          password: hashedPassword,
          phone: body.phone,
          alternatePhone: body.alternatePhone,
          role: "MODERATOR",
          name: body.name,
          profileImage: body.profileImage,
          isActive: body.isActive ?? true,
          emailVerified: body.emailVerified ?? false,
          phoneVerified: body.phoneVerified ?? false,
        },
      });

      // Create moderator profile
      const moderator = await tx.moderator.create({
        data: {
          userId: user.id,
          name: body.name,
          assignedBy: auth.user?.id || body.assignedBy,
          permissions: body.permissions || {},
        },
      });

      return { user, moderator };
    });

    return sendResponse({
      success: true,
      message: "Moderator created successfully",
      data: moderator,
      status: 201,
    });
  } catch (error) {
    console.error("Error creating moderator:", error);
    return sendResponse({
      success: false,
      message: "Internal server error",
      status: 500,
    });
  }
}
