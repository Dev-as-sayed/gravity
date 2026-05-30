// src/app/api/profile/route.ts
import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { authenticate } from "@/lib/apiAuthenticator";
import { sendResponse } from "@/lib/sendResponse";

// GET /api/profile - Get current user's profile
export async function GET(req: NextRequest) {
  try {
    const auth = await authenticate(req, "TEACHER", "STUDENT", "MODERATOR");

    if (!auth.success) {
      return sendResponse({
        success: false,
        message: auth.error || "Unauthorized",
        status: auth.status || 401,
      });
    }

    const user = await prisma.user.findUnique({
      where: { id: auth.user.id },
      select: {
        id: true,
        email: true,
        phone: true,
        alternatePhone: true,
        role: true,
        isActive: true,
        isVerified: true,
        name: true,
        profileImage: true,
        bio: true,
        dateOfBirth: true,
        gender: true,
        address: true,
        city: true,
        state: true,
        pincode: true,
        createdAt: true,
        teacher: {
          select: {
            id: true,
            name: true,
            bio: true,
            qualification: true,
            expertise: true,
            profileImage: true,
            designation: true,
            institute: true,
            experience: true,
            averageRating: true,
            totalStudents: true,
          },
        },
        student: {
          select: {
            id: true,
            name: true,
            dateOfBirth: true,
            gender: true,
            class: true,
            board: true,
            institute: true,
            averageScore: true,
          },
        },
        moderator: {
          select: {
            id: true,
            name: true,
            permissions: true,
          },
        },
      },
    });

    if (!user) {
      return sendResponse({
        success: false,
        message: "User not found",
        status: 404,
      });
    }

    return sendResponse({
      success: true,
      message: "Profile fetched successfully",
      data: user,
    });
  } catch (error) {
    console.error("Error fetching profile:", error);
    return sendResponse({
      success: false,
      message: "Internal server error",
      status: 500,
    });
  }
}

// PUT /api/profile - Update current user's profile
export async function PUT(req: NextRequest) {
  try {
    const auth = await authenticate(req, "TEACHER", "STUDENT", "MODERATOR");

    if (!auth.success) {
      return sendResponse({
        success: false,
        message: auth.error || "Unauthorized",
        status: auth.status || 401,
      });
    }

    const body = await req.json();
    const userId = auth.user.id;

    const userData: any = {};
    const teacherData: any = {};
    const studentData: any = {};

    if (body.name !== undefined) userData.name = body.name;
    if (body.profileImage !== undefined) userData.profileImage = body.profileImage;
    if (body.bio !== undefined) userData.bio = body.bio;
    if (body.dateOfBirth !== undefined) userData.dateOfBirth = new Date(body.dateOfBirth);
    if (body.gender !== undefined) userData.gender = body.gender;
    if (body.address !== undefined) userData.address = body.address;
    if (body.city !== undefined) userData.city = body.city;
    if (body.state !== undefined) userData.state = body.state;
    if (body.pincode !== undefined) userData.pincode = body.pincode;
    if (body.phone !== undefined) userData.phone = body.phone;
    if (body.alternatePhone !== undefined) userData.alternatePhone = body.alternatePhone;

    if (auth.user.role === "TEACHER" && auth.user.teacherId) {
      if (body.qualification !== undefined) teacherData.qualification = body.qualification;
      if (body.expertise !== undefined) teacherData.expertise = body.expertise;
      if (body.designation !== undefined) teacherData.designation = body.designation;
      if (body.institute !== undefined) teacherData.institute = body.institute;
      if (body.experience !== undefined) teacherData.experience = body.experience;
    }

    if (auth.user.role === "STUDENT" && auth.user.studentId) {
      if (body.class !== undefined) studentData.class = body.class;
      if (body.board !== undefined) studentData.board = body.board;
      if (body.school !== undefined) studentData.school = body.school;
    }

    const user = await prisma.user.update({
      where: { id: userId },
      data: userData,
    });

    if (Object.keys(teacherData).length > 0 && auth.user.teacherId) {
      await prisma.teacher.update({
        where: { id: auth.user.teacherId },
        data: teacherData,
      });
    }

    if (Object.keys(studentData).length > 0 && auth.user.studentId) {
      await prisma.student.update({
        where: { id: auth.user.studentId },
        data: studentData,
      });
    }

    return sendResponse({
      success: true,
      message: "Profile updated successfully",
      data: user,
    });
  } catch (error) {
    console.error("Error updating profile:", error);
    return sendResponse({
      success: false,
      message: "Internal server error",
      status: 500,
    });
  }
}
