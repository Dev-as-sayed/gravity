// src/app/api/media/[id]/reactions/route.ts
import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { authenticate } from "@/lib/apiAuthenticator";
import { sendResponse } from "@/lib/sendResponse";

// GET /api/media/[id]/reactions - Get all reactions for a post
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    const auth = await authenticate(
      req,
      "ADMIN",
      "SUPER_ADMIN",
      "TEACHER",
      "STUDENT",
      "GUARDIAN",
    );

    if (!auth.success) {
      return sendResponse({
        success: false,
        message: auth.error || "Unauthorized",
        status: auth.status || 401,
      });
    }

    const reactions = await prisma.postReaction.findMany({
      where: { postId: id },
      include: {
        teacher: {
          select: {
            id: true,
            name: true,
            profileImage: true,
          },
        },
        student: {
          select: {
            id: true,
            name: true,
            profileImage: true,
          },
        },
        guardian: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    // Group reactions by type
    const grouped = reactions.reduce((acc: any, reaction) => {
      acc[reaction.type] = (acc[reaction.type] || 0) + 1;
      return acc;
    }, {});

    return sendResponse({
      success: true,
      message: "Reactions fetched successfully",
      data: {
        reactions,
        summary: grouped,
        total: reactions.length,
      },
    });
  } catch (error) {
    console.error("Error fetching reactions:", error);
    return sendResponse({
      success: false,
      message: "Internal server error",
      status: 500,
    });
  }
}

// POST /api/media/[id]/reactions - Add/update reaction
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    const auth = await authenticate(
      req,
      "ADMIN",
      "SUPER_ADMIN",
      "TEACHER",
      "STUDENT",
      "GUARDIAN",
    );

    if (!auth.success || !auth.user) {
      return sendResponse({
        success: false,
        message: "Authentication required",
        status: 401,
      });
    }

    const body = await req.json();

    if (!body.type) {
      return sendResponse({
        success: false,
        message: "Reaction type is required",
        status: 400,
      });
    }

    // Check if post exists
    const post = await prisma.post.findUnique({
      where: { id },
    });

    if (!post) {
      return sendResponse({
        success: false,
        message: "Post not found",
        status: 404,
      });
    }

    // Prepare user data
    const userData: any = {};
    if (auth.user.role === "TEACHER" && auth.user.teacherId) {
      userData.teacherId = auth.user.teacherId;
    } else if (auth.user.role === "STUDENT" && auth.user.studentId) {
      userData.studentId = auth.user.studentId;
    } else if (auth.user.role === "GUARDIAN" && auth.user.guardianId) {
      userData.guardianId = auth.user.guardianId;
    } else {
      return sendResponse({
        success: false,
        message: "Invalid user role for reactions",
        status: 400,
      });
    }

    // Check if reaction already exists
    const existingReaction = await prisma.postReaction.findFirst({
      where: {
        postId: id,
        ...(userData.teacherId && { teacherId: userData.teacherId }),
        ...(userData.studentId && { studentId: userData.studentId }),
        ...(userData.guardianId && { guardianId: userData.guardianId }),
      },
    });

    let reaction;

    if (existingReaction) {
      // Update existing reaction
      reaction = await prisma.postReaction.update({
        where: { id: existingReaction.id },
        data: { type: body.type },
      });
    } else {
      // Create new reaction
      reaction = await prisma.postReaction.create({
        data: {
          postId: id,
          ...userData,
          type: body.type,
        },
      });
    }

    return sendResponse({
      success: true,
      message: existingReaction ? "Reaction updated" : "Reaction added",
      data: reaction,
    });
  } catch (error) {
    console.error("Error managing reaction:", error);
    return sendResponse({
      success: false,
      message: "Internal server error",
      status: 500,
    });
  }
}

// DELETE /api/media/[id]/reactions - Remove reaction
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    const auth = await authenticate(
      req,
      "ADMIN",
      "SUPER_ADMIN",
      "TEACHER",
      "STUDENT",
      "GUARDIAN",
    );

    if (!auth.success || !auth.user) {
      return sendResponse({
        success: false,
        message: "Authentication required",
        status: 401,
      });
    }

    // Prepare user data for finding reaction
    const where: any = { postId: id };

    if (auth.user.role === "TEACHER" && auth.user.teacherId) {
      where.teacherId = auth.user.teacherId;
    } else if (auth.user.role === "STUDENT" && auth.user.studentId) {
      where.studentId = auth.user.studentId;
    } else if (auth.user.role === "GUARDIAN" && auth.user.guardianId) {
      where.guardianId = auth.user.guardianId;
    }

    const reaction = await prisma.postReaction.findFirst({ where });

    if (!reaction) {
      return sendResponse({
        success: false,
        message: "Reaction not found",
        status: 404,
      });
    }

    await prisma.postReaction.delete({
      where: { id: reaction.id },
    });

    return sendResponse({
      success: true,
      message: "Reaction removed successfully",
    });
  } catch (error) {
    console.error("Error removing reaction:", error);
    return sendResponse({
      success: false,
      message: "Internal server error",
      status: 500,
    });
  }
}
