// src/app/api/reported/route.ts
import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { authenticate } from "@/lib/apiAuthenticator";
import { sendResponse } from "@/lib/sendResponse";

// GET /api/reported - List reported content
export async function GET(req: NextRequest) {
  try {
    const auth = await authenticate(req, "TEACHER", "MODERATOR");

    if (!auth.success) {
      return sendResponse({
        success: false,
        message: auth.error || "Unauthorized",
        status: auth.status || 401,
      });
    }

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const status = searchParams.get("status");

    const skip = (page - 1) * limit;

    const where: any = {};

    if (status) where.status = status;

    const [reports, total] = await Promise.all([
      prisma.reportedContent.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          reporter: {
            select: { id: true, name: true, email: true, role: true },
          },
          moderator: {
            select: { id: true, name: true, email: true },
          },
        },
      }),
      prisma.reportedContent.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return sendResponse({
      success: true,
      message: "Reports fetched successfully",
      data: reports,
      meta: { page, limit, total, totalPages },
    });
  } catch (error) {
    console.error("Error fetching reports:", error);
    return sendResponse({
      success: false,
      message: "Internal server error",
      status: 500,
    });
  }
}

// POST /api/reported - Report content
export async function POST(req: NextRequest) {
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
    const { entityType, entityId, reason } = body;

    if (!entityType || !entityId || !reason) {
      return sendResponse({
        success: false,
        message: "entityType, entityId, and reason are required",
        status: 400,
      });
    }

    const report = await prisma.reportedContent.create({
      data: {
        entityType,
        entityId,
        reason,
        reportedBy: auth.user.id,
      },
    });

    return sendResponse({
      success: true,
      message: "Content reported successfully",
      data: report,
      status: 201,
    });
  } catch (error) {
    console.error("Error reporting content:", error);
    return sendResponse({
      success: false,
      message: "Internal server error",
      status: 500,
    });
  }
}
