// src/app/api/batches/[id]/route.ts
import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { authenticate } from "@/lib/apiAuthenticator";
import { sendResponse } from "@/lib/sendResponse";

// GET /api/batches/[id] - Get single batch
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

    const batch = await prisma.batch.findUnique({
      where: { id },
      include: {
        teacher: {
          select: {
            id: true,
            name: true,
            qualification: true,
            expertise: true,
            profileImage: true,
            bio: true,
          },
        },
        course: {
          select: {
            id: true,
            title: true,
            description: true,
            thumbnail: true,
          },
        },
        moderators: {
          select: {
            id: true,
            name: true,
          },
        },
        enrollments:
          auth.user?.role === "ADMIN" || auth.user?.role === "TEACHER"
            ? {
                include: {
                  student: {
                    select: {
                      id: true,
                      name: true,
                      profileImage: true,
                    },
                  },
                  payments: true,
                },
              }
            : false,
        notes: {
          where: { isPublic: true },
          take: 10,
        },
        quizzes: {
          where: { status: "PUBLISHED" },
          select: {
            id: true,
            title: true,
            timeLimit: true,
            totalMarks: true,
            difficulty: true,
          },
        },
        exams: {
          where: { status: "ARCHIVED" },
          select: {
            id: true,
            title: true,
            examDate: true,
            duration: true,
            fullMarks: true,
          },
        },
        announcements: {
          where: { isPinned: true },
          orderBy: { createdAt: "desc" },
        },
        materials: true,
        reviews: {
          include: {
            student: {
              select: {
                name: true,
                profileImage: true,
              },
            },
          },
          orderBy: { createdAt: "desc" },
        },
        _count: {
          select: {
            enrollments: true,
            notes: true,
            quizzes: true,
            exams: true,
            materials: true,
          },
        },
      },
    });

    if (!batch) {
      return sendResponse({
        success: false,
        message: "Batch not found",
        status: 404,
      });
    }

    // Check if student is enrolled
    let enrollmentStatus = null;
    if (auth.user?.role === "STUDENT" && auth.user.studentId) {
      const enrollment = await prisma.enrollment.findFirst({
        where: {
          batchId: id,
          studentId: auth.user.studentId,
        },
      });
      enrollmentStatus = enrollment?.status || null;
    }

    return sendResponse({
      success: true,
      message: "Batch fetched successfully",
      data: {
        ...batch,
        studentEnrollmentStatus: enrollmentStatus,
      },
    });
  } catch (error) {
    console.error("Error fetching batch:", error);
    return sendResponse({
      success: false,
      message: "Internal server error",
      status: 500,
    });
  }
}

// PUT /api/batches/[id] - Update batch
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

    // Check if batch exists
    const existingBatch = await prisma.batch.findUnique({
      where: { id },
    });

    if (!existingBatch) {
      return sendResponse({
        success: false,
        message: "Batch not found",
        status: 404,
      });
    }

    console.log("check point 1");

    // Helper function to convert empty strings to null for optional fields
    const toNumberOrNull = (value: any): number | null => {
      if (value === undefined || value === null || value === "") return null;
      const num = Number(value);
      return isNaN(num) ? null : num;
    };

    const toDateOrNull = (value: any): Date | null => {
      if (!value || value === "") return null;
      return new Date(value);
    };

    // Update batch with proper type handling
    const batch = await prisma.batch.update({
      where: { id },
      data: {
        name: body.name,
        subject: body.subject,
        description: body.description,
        mode: body.mode,
        language: body.language,
        maxStudents: toNumberOrNull(body.maxStudents),
        minimumStudents: toNumberOrNull(body.minimumStudents),
        startDate: body.startDate ? new Date(body.startDate) : undefined,
        endDate: toDateOrNull(body.endDate),
        schedule: body.schedule || undefined,
        totalClasses: toNumberOrNull(body.totalClasses),
        liveClassLink: body.liveClassLink || undefined,
        liveClassPlatform: body.liveClassPlatform || undefined,
        meetingId: body.meetingId || undefined,
        meetingPassword: body.meetingPassword || undefined,
        recordingUrl: body.recordingUrl || undefined,
        studyMaterialUrl: body.studyMaterialUrl || undefined,
        resources: body.resources || undefined,
        price: body.price !== undefined ? Number(body.price) : undefined,
        offerPrice: toNumberOrNull(body.offerPrice),
        offerDeadline: toDateOrNull(body.offerDeadline),
        earlyBirdPrice: toNumberOrNull(body.earlyBirdPrice),
        earlyBirdDeadline: toDateOrNull(body.earlyBirdDeadline),
        discountPercent: toNumberOrNull(body.discountPercent),
        discountCode: body.discountCode || undefined,
        isActive: body.isActive,
        isPublished: body.isPublished ?? false,
        enrollmentOpen: body.enrollmentOpen,
        visibility: body.visibility,
        syllabus: body.syllabus || undefined,
        topics: body.topics || [],
        prerequisites: body.prerequisites || [],
      },
    });

    return sendResponse({
      success: true,
      message: "Batch updated successfully",
      data: batch,
    });
  } catch (error) {
    console.error("Error updating batch:", error);
    return sendResponse({
      success: false,
      message: "Internal server error",
      status: 500,
    });
  }
}

// DELETE /api/batches/[id] - Delete batch
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

    // Check if batch exists
    const existingBatch = await prisma.batch.findUnique({
      where: { id },
      include: {
        enrollments: { select: { id: true } },
      },
    });

    if (!existingBatch) {
      return sendResponse({
        success: false,
        message: "Batch not found",
        status: 404,
      });
    }

    // Check permission if user is teacher
    if (
      auth.user?.role === "TEACHER" &&
      existingBatch.teacherId !== auth.user.teacherId
    ) {
      return sendResponse({
        success: false,
        message: "You don't have permission to delete this batch",
        status: 403,
      });
    }

    // Check if batch has enrollments
    if (existingBatch.enrollments.length > 0) {
      return sendResponse({
        success: false,
        message: "Cannot delete batch with existing enrollments",
        status: 400,
      });
    }

    // Delete batch
    await prisma.batch.delete({
      where: { id },
    });

    return sendResponse({
      success: true,
      message: "Batch deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting batch:", error);
    return sendResponse({
      success: false,
      message: "Internal server error",
      status: 500,
    });
  }
}
