import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { authenticate } from "@/lib/apiAuthenticator";
import { sendResponse } from "@/lib/sendResponse";

export async function GET(req: NextRequest) {
  try {
    const auth = await authenticate(req, "TEACHER", "MODERATOR");
    if (!auth.success) {
      return sendResponse({ success: false, message: auth.error || "Unauthorized", status: auth.status || 401 });
    }
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "50");
    const skip = (page - 1) * limit;
    const studentId = searchParams.get("studentId");
    const batchId = searchParams.get("batchId");
    const dateFrom = searchParams.get("dateFrom");
    const dateTo = searchParams.get("dateTo");

    const where: any = {};
    if (studentId) where.studentId = studentId;
    if (batchId) where.batchId = batchId;
    if (dateFrom || dateTo) {
      where.date = {};
      if (dateFrom) where.date.gte = new Date(dateFrom);
      if (dateTo) where.date.lte = new Date(dateTo);
    }

    if (auth.user?.role === "TEACHER" && auth.user.teacherId) {
      where.batch = { teacherId: auth.user.teacherId };
    }

    const [records, total] = await Promise.all([
      prisma.attendance.findMany({
        where,
        skip,
        take: limit,
        orderBy: { date: "desc" },
        include: {
          student: { select: { id: true, name: true, profileImage: true } },
          batch: { select: { id: true, name: true, subject: true } },
        },
      }),
      prisma.attendance.count({ where }),
    ]);

    return sendResponse({
      success: true,
      data: records,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit), hasNextPage: skip + limit < total, hasPreviousPage: page > 1 },
    });
  } catch (error) {
    console.error("Error fetching attendance:", error);
    return sendResponse({ success: false, message: "Internal server error", status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const auth = await authenticate(req, "TEACHER", "MODERATOR");
    if (!auth.success) {
      return sendResponse({ success: false, message: auth.error || "Unauthorized", status: auth.status || 401 });
    }
    const body = await req.json();

    if (!body.studentId || !body.batchId) {
      return sendResponse({ success: false, message: "studentId and batchId required", status: 400 });
    }

    const record = await prisma.attendance.create({
      data: {
        studentId: body.studentId,
        batchId: body.batchId,
        date: body.date ? new Date(body.date) : new Date(),
        status: body.status || "PRESENT",
        checkInTime: body.checkInTime ? new Date(body.checkInTime) : null,
        checkOutTime: body.checkOutTime ? new Date(body.checkOutTime) : null,
        duration: body.duration,
        markedBy: auth.user.teacherId || auth.user.moderatorId || null,
        verified: true,
      },
    });

    return sendResponse({ success: true, data: record, status: 201 });
  } catch (error) {
    console.error("Error creating attendance:", error);
    return sendResponse({ success: false, message: "Internal server error", status: 500 });
  }
}
