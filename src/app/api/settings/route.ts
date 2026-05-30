// src/app/api/settings/route.ts
import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { authenticate } from "@/lib/apiAuthenticator";
import { sendResponse } from "@/lib/sendResponse";

// GET /api/settings - Get settings
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

    const settings = await prisma.systemConfig.findMany({
      orderBy: { category: "asc" },
    });

    const grouped = settings.reduce(
      (acc, s) => {
        if (!acc[s.category]) acc[s.category] = [];
        acc[s.category].push({ key: s.key, value: s.value, description: s.description });
        return acc;
      },
      {} as Record<string, any[]>,
    );

    return sendResponse({
      success: true,
      message: "Settings fetched successfully",
      data: grouped,
    });
  } catch (error) {
    console.error("Error fetching settings:", error);
    return sendResponse({
      success: false,
      message: "Internal server error",
      status: 500,
    });
  }
}

// PUT /api/settings - Update settings
export async function PUT(req: NextRequest) {
  try {
    const auth = await authenticate(req, "TEACHER", "MODERATOR");

    if (!auth.success) {
      return sendResponse({
        success: false,
        message: auth.error || "Unauthorized",
        status: auth.status || 401,
      });
    }

    const body = await req.json();

    if (Array.isArray(body)) {
      const results = await Promise.all(
        body.map((s: { key: string; value: any; category?: string; description?: string }) =>
          prisma.systemConfig.upsert({
            where: { key: s.key },
            update: { value: s.value },
            create: {
              key: s.key,
              value: s.value,
              category: s.category || "general",
              description: s.description || null,
            },
          }),
        ),
      );

      return sendResponse({
        success: true,
        message: "Settings updated successfully",
        data: results,
      });
    }

    const { key, value, category, description } = body;

    if (!key || value === undefined) {
      return sendResponse({
        success: false,
        message: "Key and value are required",
        status: 400,
      });
    }

    const setting = await prisma.systemConfig.upsert({
      where: { key },
      update: { value },
      create: {
        key,
        value,
        category: category || "general",
        description: description || null,
      },
    });

    return sendResponse({
      success: true,
      message: "Setting updated successfully",
      data: setting,
    });
  } catch (error) {
    console.error("Error updating settings:", error);
    return sendResponse({
      success: false,
      message: "Internal server error",
      status: 500,
    });
  }
}
