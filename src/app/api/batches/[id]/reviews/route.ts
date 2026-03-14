// src/app/api/batches/[id]/reviews/route.ts
import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { authenticate } from "@/lib/apiAuthenticator";
import { sendResponse } from "@/lib/sendResponse";

// GET /api/batches/[id]/reviews - Get batch reviews
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const { id } = params;

    const reviews = await prisma.batchReview.findMany({
      where: { batchId: id },
      include: {
        student: {
          select: {
            name: true,
            profileImage: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    // Calculate average rating
    const avgRating = reviews.length
      ? reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length
      : 0;

    return sendResponse({
      success: true,
      message: "Reviews fetched successfully",
      data: {
        reviews,
        stats: {
          total: reviews.length,
          averageRating: avgRating,
          distribution: {
            1: reviews.filter((r) => r.rating === 1).length,
            2: reviews.filter((r) => r.rating === 2).length,
            3: reviews.filter((r) => r.rating === 3).length,
            4: reviews.filter((r) => r.rating === 4).length,
            5: reviews.filter((r) => r.rating === 5).length,
          },
        },
      },
    });
  } catch (error) {
    console.error("Error fetching reviews:", error);
    return sendResponse({
      success: false,
      message: "Internal server error",
      status: 500,
    });
  }
}

// POST /api/batches/[id]/reviews - Add review to batch
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const auth = await authenticate(req, "STUDENT");

    if (!auth.success || !auth.user?.studentId) {
      return sendResponse({
        success: false,
        message: "Only students can review",
        status: 401,
      });
    }

    const { id } = params;
    const body = await req.json();

    // Check if student is enrolled
    const enrollment = await prisma.enrollment.findUnique({
      where: {
        studentId_batchId: {
          studentId: auth.user.studentId,
          batchId: id,
        },
      },
    });

    if (!enrollment) {
      return sendResponse({
        success: false,
        message: "You must be enrolled to review",
        status: 400,
      });
    }

    // Check if already reviewed
    const existingReview = await prisma.batchReview.findUnique({
      where: {
        batchId_studentId: {
          batchId: id,
          studentId: auth.user.studentId,
        },
      },
    });

    if (existingReview) {
      return sendResponse({
        success: false,
        message: "You have already reviewed this batch",
        status: 400,
      });
    }

    // Create review
    const review = await prisma.batchReview.create({
      data: {
        batchId: id,
        studentId: auth.user.studentId,
        rating: body.rating,
        comment: body.comment,
        pros: body.pros || [],
        cons: body.cons || [],
        isAnonymous: body.isAnonymous || false,
        isVerified: true,
      },
    });

    // Update batch average rating
    const allReviews = await prisma.batchReview.findMany({
      where: { batchId: id },
      select: { rating: true },
    });

    const avgRating =
      allReviews.reduce((acc, r) => acc + r.rating, 0) / allReviews.length;

    await prisma.batch.update({
      where: { id },
      data: {
        averageRating: avgRating,
        totalReviews: allReviews.length,
      },
    });

    return sendResponse({
      success: true,
      message: "Review added successfully",
      data: review,
      status: 201,
    });
  } catch (error) {
    console.error("Error adding review:", error);
    return sendResponse({
      success: false,
      message: "Internal server error",
      status: 500,
    });
  }
}
