import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { hashPassword, validatePasswordComplexity } from "@/lib/password";

const registerSchema = z.object({
  email: z.string().email("Invalid email format"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  name: z.string().min(2, "Name must be at least 2 characters"),
  phone: z.string().min(10, "Phone number must be at least 10 digits"),
  role: z.enum(["STUDENT", "GUARDIAN"]).default("STUDENT"),
  dateOfBirth: z.string().optional(),
  gender: z.enum(["MALE", "FEMALE"]).optional(),
  institute: z.string().optional(),
  educationLevel: z.string().optional(),
  class: z.string().optional(),
  board: z.string().optional(),
  relationship: z.string().min(1, "Relationship is required"),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const validatedData = registerSchema.parse(body);

    const complexityError = validatePasswordComplexity(validatedData.password);
    if (complexityError) {
      return NextResponse.json(
        { error: complexityError },
        { status: 400 },
      );
    }

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

    const hashedPassword = await hashPassword(validatedData.password);

    const user = await prisma.$transaction(async (tx) => {
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

      await tx.notificationPreference.create({
        data: { userId: newUser.id, preferences: {} },
      });

      await tx.userActivity.create({
        data: {
          userId: newUser.id,
          action: "REGISTER",
          metadata: { method: "email", role: validatedData.role },
        },
      });

      return newUser;
    });

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
        { error: "Validation error", details: error.issues },
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
