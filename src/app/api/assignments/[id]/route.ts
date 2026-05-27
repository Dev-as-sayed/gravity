import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { authenticate } from "@/lib/apiAuthenticator";
import { sendResponse } from "@/lib/sendResponse";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = await authenticate(req, "TEACHER", "MODERATOR", "STUDENT");
    if (!auth.success) {
      return sendResponse({ success: false, message: auth.error || "Unauthorized", status: auth.status || 401 });
    }
    const { id } = await params;
    const assignment = await prisma.assignment.findUnique({
      where: { id },
      include: {
        batch: { select: { id: true, name: true } },
        submissions: {
          include: {
            student: { select: { id: true, name: true, profileImage: true } },
          },
        },
      },
    });
    if (!assignment) {
      return sendResponse({ success: false, message: "Assignment not found", status: 404 });
    }
    return sendResponse({ success: true, data: assignment });
  } catch (error) {
    console.error("Error fetching assignment:", error);
    return sendResponse({ success: false, message: "Internal server error", status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = await authenticate(req, "TEACHER");
    if (!auth.success) {
      return sendResponse({ success: false, message: auth.error || "Unauthorized", status: auth.status || 401 });
    }
    const { id } = await params;
    const body = await req.json();

    const assignment = await prisma.assignment.update({
      where: { id },
      data: {
        title: body.title,
        description: body.description,
        type: body.type,
        totalMarks: body.totalMarks,
        passingMarks: body.passingMarks,
        dueDate: body.dueDate ? new Date(body.dueDate) : undefined,
        lateSubmission: body.lateSubmission,
        latePenalty: body.latePenalty,
        status: body.status,
        isPublished: body.isPublished,
      },
    });

    return sendResponse({ success: true, data: assignment });
  } catch (error) {
    console.error("Error updating assignment:", error);
    return sendResponse({ success: false, message: "Internal server error", status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = await authenticate(req, "TEACHER");
    if (!auth.success) {
      return sendResponse({ success: false, message: auth.error || "Unauthorized", status: auth.status || 401 });
    }
    const { id } = await params;
    await prisma.assignment.delete({ where: { id } });
    return sendResponse({ success: true, message: "Assignment deleted" });
  } catch (error) {
    console.error("Error deleting assignment:", error);
    return sendResponse({ success: false, message: "Internal server error", status: 500 });
  }
}
