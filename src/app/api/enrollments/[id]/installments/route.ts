// src/app/api/enrollments/[id]/installments/route.ts
import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { authenticate } from "@/lib/apiAuthenticator";
import { sendResponse } from "@/lib/sendResponse";

// GET /api/enrollments/[id]/installments - Get all installments for enrollment
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
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

    const { id } = await params;

    const installments = await prisma.installment.findMany({
      where: { enrollmentId: id },
      orderBy: { dueDate: "asc" },
    });

    return sendResponse({
      success: true,
      message: "Installments fetched successfully",
      data: installments,
    });
  } catch (error) {
    console.error("Error fetching installments:", error);
    return sendResponse({
      success: false,
      message: "Internal server error",
      status: 500,
    });
  }
}

// POST /api/enrollments/[id]/installments - Create installment plan
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
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

    const enrollment = await prisma.enrollment.findUnique({
      where: { id },
    });

    if (!enrollment) {
      return sendResponse({
        success: false,
        message: "Enrollment not found",
        status: 404,
      });
    }

    // Create installments
    const installments = await prisma.$transaction(
      body.installments.map((inst: any) =>
        prisma.installment.create({
          data: {
            enrollmentId: id,
            amount: inst.amount,
            dueDate: new Date(inst.dueDate),
            status: "PENDING",
          },
        }),
      ),
    );

    // Update enrollment with installment plan
    await prisma.enrollment.update({
      where: { id },
      data: {
        installmentPlan: {
          total: body.installments.length,
          totalAmount: body.installments.reduce(
            (sum: number, inst: any) => sum + inst.amount,
            0,
          ),
          frequency: body.frequency,
        },
      },
    });

    return sendResponse({
      success: true,
      message: "Installment plan created successfully",
      data: installments,
      status: 201,
    });
  } catch (error) {
    console.error("Error creating installments:", error);
    return sendResponse({
      success: false,
      message: "Internal server error",
      status: 500,
    });
  }
}
