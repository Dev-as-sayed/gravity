// app/api/auth/register/route.ts
import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { z } from "zod";

const prisma = new PrismaClient();

// Validation schema
const registerSchema = z.object({
  email: z.string().email("Invalid email format"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  name: z.string().min(2, "Name must be at least 2 characters"),
  phone: z.string().min(10, "Phone number must be at least 10 digits"),
  role: z
    .enum(["STUDENT", "TEACHER", "GUARDIAN", "MODERATOR", "ADMIN"])
    .default("STUDENT"),
  // Student specific fields
  dateOfBirth: z.string().optional(),
  gender: z.enum(["MALE", "FEMALE"]).optional(),
  institute: z.string().optional(),
  educationLevel: z.string().optional(),
  class: z.string().optional(),
  board: z.string().optional(),
  // Guardian specific
  relationship: z.string().optional(),
  // Teacher specific
  qualification: z.string().optional(),
  expertise: z.array(z.string()).optional(),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Validate input
    const validatedData = registerSchema.parse(body);

    // Check if user already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ email: validatedData.email }, { phone: validatedData.phone }],
      },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "User with this email or phone already exists" },
        { status: 400 },
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(validatedData.password, 10);

    // Create user with role-specific profile
    const user = await prisma.$transaction(async (tx) => {
      // Create base user
      const newUser = await tx.user.create({
        data: {
          email: validatedData.email,
          password: hashedPassword,
          phone: validatedData.phone,
          role: validatedData.role,
          name: validatedData.name,
          dateOfBirth: validatedData.dateOfBirth
            ? new Date(validatedData.dateOfBirth)
            : null,
          gender: validatedData.gender,
        },
      });

      // Create role-specific profile
      switch (validatedData.role) {
        case "STUDENT":
          await tx.student.create({
            data: {
              userId: newUser.id,
              name: validatedData.name,
              dateOfBirth: validatedData.dateOfBirth
                ? new Date(validatedData.dateOfBirth)
                : null,
              gender: validatedData.gender,
              institute: validatedData.institute,
              educationLevel: validatedData.educationLevel,
              class: validatedData.class,
              board: validatedData.board,
            },
          });
          break;

        case "TEACHER":
          await tx.teacher.create({
            data: {
              userId: newUser.id,
              name: validatedData.name,
              qualification: validatedData.qualification,
              expertise: validatedData.expertise || [],
            },
          });
          break;

        case "GUARDIAN":
          await tx.guardian.create({
            data: {
              userId: newUser.id,
              name: validatedData.name,
              relationship: validatedData.relationship,
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

      // Log activity
      await tx.userActivity.create({
        data: {
          userId: newUser.id,
          action: "REGISTER",
          metadata: { method: "email", role: validatedData.role },
        },
      });

      return newUser;
    });

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;

    return NextResponse.json(
      {
        message: "User registered successfully",
        user: userWithoutPassword,
      },
      { status: 201 },
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.errors },
        { status: 400 },
      );
    }

    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
