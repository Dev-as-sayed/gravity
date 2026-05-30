// src/app/api/reports/attendance/route.ts
import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { authenticate } from "@/lib/apiAuthenticator";
import { sendResponse } from "@/lib/sendResponse";

// GET /api/reports/attendance - Attendance report
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
    const batchId = searchParams.get("batchId");
    const studentId = searchParams.get("studentId");
    const fromDate = searchParams.get("fromDate");
    const toDate = searchParams.get("toDate");
    const groupBy = searchParams.get("groupBy") || "student"; // student or batch

    const where: any = {};

    if (batchId) where.batchId = batchId;
    if (studentId) where.studentId = studentId;

    if (fromDate || toDate) {
      where.date = {};
      if (fromDate) where.date.gte = new Date(fromDate);
      if (toDate) where.date.lte = new Date(toDate);
    }

    if (auth.user?.role === "TEACHER" && auth.user.teacherId) {
      where.batch = { teacherId: auth.user.teacherId };
    }

    if (groupBy === "batch") {
      const byBatch = await prisma.attendance.groupBy({
        by: ["batchId", "status"],
        where,
        _count: true,
      });

      const batches = await prisma.batch.findMany({
        where: { id: { in: [...new Set(byBatch.map((a) => a.batchId))] } },
        select: { id: true, name: true },
      });

      const batchMap = new Map(batches.map((b) => [b.id, b.name]));

      const grouped: Record<string, any> = {};
      for (const entry of byBatch) {
        if (!grouped[entry.batchId]) {
          grouped[entry.batchId] = {
            batchId: entry.batchId,
            batchName: batchMap.get(entry.batchId) || "Unknown",
            total: 0,
            byStatus: {},
          };
        }
        grouped[entry.batchId].byStatus[entry.status] = entry._count;
        grouped[entry.batchId].total += entry._count;
      }

      return sendResponse({
        success: true,
        message: "Attendance report fetched successfully",
        data: Object.values(grouped),
      });
    }

    const byStudent = await prisma.attendance.groupBy({
      by: ["studentId", "status"],
      where,
      _count: true,
    });

    const students = await prisma.student.findMany({
      where: { id: { in: [...new Set(byStudent.map((a) => a.studentId))] } },
      select: { id: true, name: true, class: true, profileImage: true },
    });

    const studentMap = new Map(students.map((s) => [s.id, s]));

    const grouped: Record<string, any> = {};
    for (const entry of byStudent) {
      if (!grouped[entry.studentId]) {
        const student = studentMap.get(entry.studentId);
        grouped[entry.studentId] = {
          studentId: entry.studentId,
          studentName: student?.name || "Unknown",
          studentClass: student?.class || null,
          profileImage: student?.profileImage || null,
          total: 0,
          byStatus: {},
        };
      }
      grouped[entry.studentId].byStatus[entry.status] = entry._count;
      grouped[entry.studentId].total += entry._count;
    }

    return sendResponse({
      success: true,
      message: "Attendance report fetched successfully",
      data: Object.values(grouped),
    });
  } catch (error) {
    console.error("Error fetching attendance report:", error);
    return sendResponse({
      success: false,
      message: "Internal server error",
      status: 500,
    });
  }
}
