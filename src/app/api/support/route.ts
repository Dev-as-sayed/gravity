// src/app/api/support/route.ts
import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { authenticate } from "@/lib/apiAuthenticator";
import { sendResponse } from "@/lib/sendResponse";

// GET /api/support - List support tickets
export async function GET(req: NextRequest) {
  try {
    const auth = await authenticate(req, "TEACHER", "STUDENT", "MODERATOR");

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
    const priority = searchParams.get("priority");
    const category = searchParams.get("category");

    const skip = (page - 1) * limit;

    const where: any = {};

    if (status) where.status = status;
    if (priority) where.priority = priority;
    if (category) where.category = category;

    if (auth.user?.role === "STUDENT") {
      where.userId = auth.user.id;
    }

    const [tickets, total] = await Promise.all([
      prisma.supportTicket.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              role: true,
            },
          },
          _count: { select: { messages: true } },
        },
      }),
      prisma.supportTicket.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return sendResponse({
      success: true,
      message: "Support tickets fetched successfully",
      data: tickets,
      meta: { page, limit, total, totalPages },
    });
  } catch (error) {
    console.error("Error fetching support tickets:", error);
    return sendResponse({
      success: false,
      message: "Internal server error",
      status: 500,
    });
  }
}

// POST /api/support - Create a support ticket
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
    const { subject, description, category, priority } = body;

    if (!subject || !description || !category) {
      return sendResponse({
        success: false,
        message: "Subject, description, and category are required",
        status: 400,
      });
    }

    const ticketNumber = `TKT-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

    const ticket = await prisma.supportTicket.create({
      data: {
        ticketNumber,
        userId: auth.user.id,
        subject,
        description,
        category,
        priority: priority || "MEDIUM",
      },
    });

    return sendResponse({
      success: true,
      message: "Support ticket created successfully",
      data: ticket,
      status: 201,
    });
  } catch (error) {
    console.error("Error creating support ticket:", error);
    return sendResponse({
      success: false,
      message: "Internal server error",
      status: 500,
    });
  }
}
