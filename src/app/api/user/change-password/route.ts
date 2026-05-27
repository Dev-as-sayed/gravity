import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { authenticate } from "@/lib/apiAuthenticator";
import {
  hashPassword,
  verifyPassword,
  validatePasswordComplexity,
} from "@/lib/password";

export async function POST(req: NextRequest) {
  try {
    const auth = await authenticate(
      req,
      "TEACHER",
      "MODERATOR",
      "STUDENT",
      "GUARDIAN",
    );
    if (!auth.success) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 },
      );
    }

    const { currentPassword, newPassword } = await req.json();

    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { error: "Current password and new password are required" },
        { status: 400 },
      );
    }

    const passwordCheck = validatePasswordComplexity(newPassword);
    if (!passwordCheck.valid) {
      return NextResponse.json(
        { error: passwordCheck.message },
        { status: 400 },
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: auth.user.id },
      select: { password: true },
    });

    if (!user?.password) {
      return NextResponse.json(
        { error: "Cannot change password for this account" },
        { status: 400 },
      );
    }

    const isValid = await verifyPassword(currentPassword, user.password);
    if (!isValid) {
      return NextResponse.json(
        { error: "Current password is incorrect" },
        { status: 403 },
      );
    }

    const hashedPassword = await hashPassword(newPassword);

    await prisma.user.update({
      where: { id: auth.user.id },
      data: { password: hashedPassword },
    });

    await prisma.userActivity.create({
      data: {
        userId: auth.user.id,
        action: "CHANGE_PASSWORD",
        metadata: { method: "direct" },
      },
    });

    return NextResponse.json(
      { message: "Password changed successfully" },
      { status: 200 },
    );
  } catch (error) {
    console.error("Change password error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
