// src/app/api/courses/[id]/route.ts
import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { authenticate } from "@/lib/apiAuthenticator";
import { sendResponse } from "@/lib/sendResponse";

// GET /api/courses/[id] - Get single course
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const auth = await authenticate(
      req,
      "ADMIN",
      "SUPER_ADMIN",
      "TEACHER",
      "STUDENT",
    );

    if (!auth.success) {
      return sendResponse({
        success: false,
        message: auth.error || "Unauthorized",
        status: auth.status || 401,
      });
    }

    const { id } = params;

    const course = await prisma.course.findUnique({
      where: { id },
      include: {
        teacher: {
          select: {
            id: true,
            name: true,
            qualification: true,
            expertise: true,
            profileImage: true,
          },
        },
        batches: {
          where: { isActive: true },
          include: {
            teacher: {
              select: {
                name: true,
              },
            },
            _count: {
              select: {
                enrollments: true,
              },
            },
          },
          orderBy: { startDate: "asc" },
        },
        posts: {
          take: 5,
          orderBy: { createdAt: "desc" },
        },
        _count: {
          select: {
            batches: true,
          },
        },
      },
    });

    if (!course) {
      return sendResponse({
        success: false,
        message: "Course not found",
        status: 404,
      });
    }

    return sendResponse({
      success: true,
      message: "Course fetched successfully",
      data: course,
    });
  } catch (error) {
    console.error("Error fetching course:", error);
    return sendResponse({
      success: false,
      message: "Internal server error",
      status: 500,
    });
  }
}

// PUT /api/courses/[id] - Update course
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const auth = await authenticate(req, "ADMIN", "SUPER_ADMIN", "TEACHER");

    if (!auth.success) {
      return sendResponse({
        success: false,
        message: auth.error || "Unauthorized",
        status: auth.status || 401,
      });
    }

    const { id } = params;
    const body = await req.json();

    // Check if course exists
    const existingCourse = await prisma.course.findUnique({
      where: { id },
    });

    if (!existingCourse) {
      return sendResponse({
        success: false,
        message: "Course not found",
        status: 404,
      });
    }

    // Check permission if user is teacher
    if (
      auth.user?.role === "TEACHER" &&
      existingCourse.teacherId !== auth.user.teacherId
    ) {
      return sendResponse({
        success: false,
        message: "You don't have permission to update this course",
        status: 403,
      });
    }

    // Update course
    const course = await prisma.course.update({
      where: { id },
      data: {
        title: body.title,
        description: body.description,
        subject: body.subject,
        category: body.category,
        thumbnail: body.thumbnail,
        bannerImage: body.bannerImage,
        icon: body.icon,
        duration: body.duration,
        level: body.level,
        prerequisites: body.prerequisites,
        learningOutcomes: body.learningOutcomes,
        price: body.price,
        offerPrice: body.offerPrice,
        isFree: body.isFree,
        metaTitle: body.metaTitle,
        metaDescription: body.metaDescription,
        metaKeywords: body.metaKeywords,
      },
    });

    return sendResponse({
      success: true,
      message: "Course updated successfully",
      data: course,
    });
  } catch (error) {
    console.error("Error updating course:", error);
    return sendResponse({
      success: false,
      message: "Internal server error",
      status: 500,
    });
  }
}

// DELETE /api/courses/[id] - Delete course
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const auth = await authenticate(req, "ADMIN", "SUPER_ADMIN", "TEACHER");

    if (!auth.success) {
      return sendResponse({
        success: false,
        message: auth.error || "Unauthorized",
        status: auth.status || 401,
      });
    }

    const { id } = params;

    // Check if course exists
    const existingCourse = await prisma.course.findUnique({
      where: { id },
      include: {
        batches: { select: { id: true } },
      },
    });

    if (!existingCourse) {
      return sendResponse({
        success: false,
        message: "Course not found",
        status: 404,
      });
    }

    // Check permission if user is teacher
    if (
      auth.user?.role === "TEACHER" &&
      existingCourse.teacherId !== auth.user.teacherId
    ) {
      return sendResponse({
        success: false,
        message: "You don't have permission to delete this course",
        status: 403,
      });
    }

    // Check if course has batches
    if (existingCourse.batches.length > 0) {
      return sendResponse({
        success: false,
        message: "Cannot delete course with existing batches",
        status: 400,
      });
    }

    // Delete course
    await prisma.course.delete({
      where: { id },
    });

    return sendResponse({
      success: true,
      message: "Course deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting course:", error);
    return sendResponse({
      success: false,
      message: "Internal server error",
      status: 500,
    });
  }
}
