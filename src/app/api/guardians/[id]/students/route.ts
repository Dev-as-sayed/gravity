// src/app/api/guardians/[id]/students/route.ts
import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { authenticate } from "@/lib/apiAuthenticator";
import { sendResponse } from "@/lib/sendResponse";

// GET /api/guardians/[id]/students - Get students associated with guardian
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    // Authenticate - ADMIN, SUPER_ADMIN can view
    const auth = await authenticate(req, "ADMIN", "SUPER_ADMIN");

    if (!auth.success) {
      return sendResponse({
        success: false,
        message: auth.error || "Unauthorized",
        status: auth.status || 401,
      });
    }

    const { id } = params;

    const guardian = await prisma.guardian.findUnique({
      where: { id },
      include: {
        students: {
          include: {
            user: {
              select: {
                email: true,
                phone: true,
              },
            },
          },
        },
      },
    });

    if (!guardian) {
      return sendResponse({
        success: false,
        message: "Guardian not found",
        status: 404,
      });
    }

    return sendResponse({
      success: true,
      message: "Guardian students fetched successfully",
      data: guardian.students,
    });
  } catch (error) {
    console.error("Error fetching guardian students:", error);
    return sendResponse({
      success: false,
      message: "Internal server error",
      status: 500,
    });
  }
}

// POST /api/guardians/[id]/students - Add students to guardian
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    // Authenticate - only ADMIN and SUPER_ADMIN can modify
    const auth = await authenticate(req, "ADMIN", "SUPER_ADMIN");

    if (!auth.success) {
      return sendResponse({
        success: false,
        message: auth.error || "Unauthorized",
        status: auth.status || 401,
      });
    }

    const { id } = params;
    const body = await req.json();
    const { studentIds } = body;

    if (!studentIds || !Array.isArray(studentIds) || studentIds.length === 0) {
      return sendResponse({
        success: false,
        message: "studentIds array is required",
        status: 400,
      });
    }

    // Check if guardian exists
    const guardian = await prisma.guardian.findUnique({
      where: { id },
    });

    if (!guardian) {
      return sendResponse({
        success: false,
        message: "Guardian not found",
        status: 404,
      });
    }

    // Update students with guardianId
    const result = await prisma.student.updateMany({
      where: { id: { in: studentIds } },
      data: { guardianId: id },
    });

    return sendResponse({
      success: true,
      message: `${result.count} students added to guardian successfully`,
      data: { count: result.count },
    });
  } catch (error) {
    console.error("Error adding students to guardian:", error);
    return sendResponse({
      success: false,
      message: "Internal server error",
      status: 500,
    });
  }
}

// DELETE /api/guardians/[id]/students - Remove students from guardian
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    // Authenticate - only ADMIN and SUPER_ADMIN can modify
    const auth = await authenticate(req, "ADMIN", "SUPER_ADMIN");

    if (!auth.success) {
      return sendResponse({
        success: false,
        message: auth.error || "Unauthorized",
        status: auth.status || 401,
      });
    }

    const { id } = params;
    const body = await req.json();
    const { studentIds } = body;

    if (!studentIds || !Array.isArray(studentIds) || studentIds.length === 0) {
      return sendResponse({
        success: false,
        message: "studentIds array is required",
        status: 400,
      });
    }

    // Check if guardian exists
    const guardian = await prisma.guardian.findUnique({
      where: { id },
    });

    if (!guardian) {
      return sendResponse({
        success: false,
        message: "Guardian not found",
        status: 404,
      });
    }

    // Remove guardianId from students
    const result = await prisma.student.updateMany({
      where: {
        id: { in: studentIds },
        guardianId: id,
      },
      data: { guardianId: null },
    });

    return sendResponse({
      success: true,
      message: `${result.count} students removed from guardian successfully`,
      data: { count: result.count },
    });
  } catch (error) {
    console.error("Error removing students from guardian:", error);
    return sendResponse({
      success: false,
      message: "Internal server error",
      status: 500,
    });
  }
}
