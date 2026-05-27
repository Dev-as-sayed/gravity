import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { authenticate } from "@/lib/apiAuthenticator";
import { sendResponse } from "@/lib/sendResponse";

export async function GET(req: NextRequest) {
  try {
    const auth = await authenticate(req, "TEACHER", "MODERATOR", "STUDENT");
    if (!auth.success) {
      return sendResponse({ success: false, message: auth.error || "Unauthorized", status: auth.status || 401 });
    }
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const skip = (page - 1) * limit;
    const batchId = searchParams.get("batchId");
    const type = searchParams.get("type");
    const status = searchParams.get("status");

    const where: any = {};
    if (batchId) where.batchId = batchId;
    if (type) where.type = type;
    if (status) where.status = status;

    if (auth.user?.role === "TEACHER" && auth.user.teacherId) {
      where.teacherId = auth.user.teacherId;
    }

    const [assignments, total] = await Promise.all([
      prisma.assignment.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          batch: { select: { id: true, name: true } },
          _count: { select: { submissions: true } },
        },
      }),
      prisma.assignment.count({ where }),
    ]);

    return sendResponse({
      success: true,
      data: assignments,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit), hasNextPage: skip + limit < total, hasPreviousPage: page > 1 },
    });
  } catch (error) {
    console.error("Error fetching assignments:", error);
    return sendResponse({ success: false, message: "Internal server error", status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const auth = await authenticate(req, "TEACHER");
    if (!auth.success) {
      return sendResponse({ success: false, message: auth.error || "Unauthorized", status: auth.status || 401 });
    }
    const body = await req.json();

    if (!body.title || !body.batchId) {
      return sendResponse({ success: false, message: "title and batchId required", status: 400 });
    }

    const assignment = await prisma.assignment.create({
      data: {
        title: body.title,
        description: body.description,
        teacherId: auth.user.teacherId!,
        batchId: body.batchId,
        type: body.type || "HOMEWORK",
        totalMarks: body.totalMarks || 20,
        passingMarks: body.passingMarks,
        dueDate: new Date(body.dueDate || Date.now() + 7 * 86400000),
        issuedDate: new Date(),
        lateSubmission: body.lateSubmission ?? false,
        latePenalty: body.latePenalty,
        status: body.status || "PUBLISHED",
        isPublished: body.isPublished ?? true,
      },
    });

    return sendResponse({ success: true, data: assignment, status: 201 });
  } catch (error) {
    console.error("Error creating assignment:", error);
    return sendResponse({ success: false, message: "Internal server error", status: 500 });
  }
}
