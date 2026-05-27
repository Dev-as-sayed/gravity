import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { authenticate } from "@/lib/apiAuthenticator";
import { sendResponse } from "@/lib/sendResponse";

export async function GET(req: NextRequest) {
  try {
    const auth = await authenticate(
      req,
      "TEACHER", "STUDENT", "GUARDIAN",
    );

    if (!auth.success) {
      return sendResponse({
        success: false,
        message: auth.error || "Unauthorized",
        status: auth.status || 401,
      });
    }

    const { searchParams } = new URL(req.url);
    const batchId = searchParams.get("batchId");
    const batchIdsParam = searchParams.get("batchIds");

    let ids: string[] = [];
    if (batchId) ids = [batchId];
    else if (batchIdsParam) ids = batchIdsParam.split(",");

    if (ids.length === 0) {
      return sendResponse({
        success: false,
        message: "batchId or batchIds query parameter is required",
        status: 400,
      });
    }

    const batches = await prisma.batch.findMany({
      where: { id: { in: ids } },
      include: {
        sessions: true,
        teacher: { select: { id: true, name: true } },
      },
    });

    const schedule: Array<{
      id: string;
      day: string;
      startTime: string;
      endTime: string;
      subject: string;
      teacher: string | null;
      room: string | null;
      batchId: string;
      sessionName: string;
    }> = [];

    for (const batch of batches) {
      for (const session of batch.sessions) {
        for (const day of session.days) {
          schedule.push({
            id: session.id,
            day: day.charAt(0).toUpperCase() + day.slice(1),
            startTime: session.startTime,
            endTime: session.endTime,
            subject: batch.subject,
            teacher: batch.teacher?.name || null,
            room: session.room,
            batchId: batch.id,
            sessionName: session.name,
          });
        }
      }
    }

    schedule.sort((a, b) => {
      const dayOrder = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];
      const dayDiff = dayOrder.indexOf(a.day.toLowerCase()) - dayOrder.indexOf(b.day.toLowerCase());
      if (dayDiff !== 0) return dayDiff;
      return a.startTime.localeCompare(b.startTime);
    });

    return sendResponse({
      success: true,
      message: "Schedule fetched successfully",
      data: schedule,
    });
  } catch (error) {
    console.error("Error fetching schedule:", error);
    return sendResponse({
      success: false,
      message: "Internal server error",
      status: 500,
    });
  }
}
