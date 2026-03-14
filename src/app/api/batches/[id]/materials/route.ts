// src/app/api/batches/[id]/materials/route.ts
import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { authenticate } from "@/lib/apiAuthenticator";
import { sendResponse } from "@/lib/sendResponse";

// GET /api/batches/[id]/materials - Get batch materials
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } },
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

    const { id } = params;

    const materials = await prisma.batchMaterial.findMany({
      where: { batchId: id },
      orderBy: { createdAt: "desc" },
    });

    return sendResponse({
      success: true,
      message: "Materials fetched successfully",
      data: materials,
    });
  } catch (error) {
    console.error("Error fetching materials:", error);
    return sendResponse({
      success: false,
      message: "Internal server error",
      status: 500,
    });
  }
}

// POST /api/batches/[id]/materials - Add material to batch
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const auth = await authenticate(req, "ADMIN", "SUPER_ADMIN", "TEACHER");

    if (!auth.success) {
      return sendResponse({
        success: false,
        message: auth.error || "Unauthorized",
        status: auth.status || 401,
      });
    }

    const { id } = params;
    const body = await req.json();

    // Check if batch exists
    const batch = await prisma.batch.findUnique({
      where: { id },
    });

    if (!batch) {
      return sendResponse({
        success: false,
        message: "Batch not found",
        status: 404,
      });
    }

    // Create material
    const material = await prisma.batchMaterial.create({
      data: {
        batchId: id,
        title: body.title,
        description: body.description,
        type: body.type,
        fileUrl: body.fileUrl,
        fileSize: body.fileSize,
        duration: body.duration,
        isFree: body.isFree || false,
        uploadedBy: auth.user.id,
      },
    });

    return sendResponse({
      success: true,
      message: "Material added successfully",
      data: material,
      status: 201,
    });
  } catch (error) {
    console.error("Error adding material:", error);
    return sendResponse({
      success: false,
      message: "Internal server error",
      status: 500,
    });
  }
}
