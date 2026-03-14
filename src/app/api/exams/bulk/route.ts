// src/app/api/exams/bulk/route.ts
import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { authenticate } from "@/lib/apiAuthenticator";
import { sendResponse } from "@/lib/sendResponse";

// POST /api/exams/bulk - Bulk operations on exams
export async function POST(req: NextRequest) {
  try {
    const auth = await authenticate(req, "ADMIN", "SUPER_ADMIN", "TEACHER");

    if (!auth.success) {
      return sendResponse({
        success: false,
        message: auth.error || "Unauthorized",
        status: auth.status || 401,
      });
    }

    const body = await req.json();
    const { examIds, action } = body;

    if (!examIds || !Array.isArray(examIds) || examIds.length === 0) {
      return sendResponse({
        success: false,
        message: "examIds array is required",
        status: 400,
      });
    }

    if (
      !action ||
      !["publish", "archive", "delete", "publishResults"].includes(action)
    ) {
      return sendResponse({
        success: false,
        message:
          "Invalid action. Must be 'publish', 'archive', 'delete', or 'publishResults'",
        status: 400,
      });
    }

    let result;

    switch (action) {
      case "publish":
        result = await prisma.exam.updateMany({
          where: { id: { in: examIds } },
          data: { status: "SCHEDULED" },
        });
        break;

      case "archive":
        result = await prisma.exam.updateMany({
          where: { id: { in: examIds } },
          data: { status: "ARCHIVED" },
        });
        break;

      case "publishResults":
        result = await prisma.exam.updateMany({
          where: { id: { in: examIds } },
          data: {
            isResultPublished: true,
            resultDate: new Date(),
          },
        });
        break;

      case "delete":
        // Check if exams have results
        const examsWithResults = await prisma.exam.findMany({
          where: {
            id: { in: examIds },
            results: { some: {} },
          },
          select: { id: true },
        });

        if (examsWithResults.length > 0) {
          return sendResponse({
            success: false,
            message: "Cannot delete exams with existing results",
            status: 400,
          });
        }

        result = await prisma.exam.deleteMany({
          where: { id: { in: examIds } },
        });
        break;
    }

    return sendResponse({
      success: true,
      message: `${result.count} exams ${action}d successfully`,
      data: { count: result.count },
    });
  } catch (error) {
    console.error("Error in bulk exam operation:", error);
    return sendResponse({
      success: false,
      message: "Internal server error",
      status: 500,
    });
  }
}
