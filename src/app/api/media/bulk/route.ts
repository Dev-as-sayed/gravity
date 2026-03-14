// src/app/api/media/bulk/route.ts
import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { authenticate } from "@/lib/apiAuthenticator";
import { sendResponse } from "@/lib/sendResponse";

// POST /api/media/bulk - Bulk operations on posts
export async function POST(req: NextRequest) {
  try {
    const auth = await authenticate(req, "ADMIN", "SUPER_ADMIN");

    if (!auth.success) {
      return sendResponse({
        success: false,
        message: auth.error || "Unauthorized",
        status: auth.status || 401,
      });
    }

    const body = await req.json();
    const { postIds, action } = body;

    if (!postIds || !Array.isArray(postIds) || postIds.length === 0) {
      return sendResponse({
        success: false,
        message: "postIds array is required",
        status: 400,
      });
    }

    const validActions = [
      "publish",
      "unpublish",
      "feature",
      "unfeature",
      "pin",
      "unpin",
      "delete",
    ];
    if (!action || !validActions.includes(action)) {
      return sendResponse({
        success: false,
        message: `Invalid action. Must be one of: ${validActions.join(", ")}`,
        status: 400,
      });
    }

    let result;

    switch (action) {
      case "publish":
        result = await prisma.post.updateMany({
          where: { id: { in: postIds } },
          data: {
            status: "PUBLISHED",
            publishedAt: new Date(),
          },
        });
        break;

      case "unpublish":
        result = await prisma.post.updateMany({
          where: { id: { in: postIds } },
          data: { status: "DRAFT" },
        });
        break;

      case "feature":
        result = await prisma.post.updateMany({
          where: { id: { in: postIds } },
          data: {
            isFeatured: true,
          },
        });
        break;

      case "unfeature":
        result = await prisma.post.updateMany({
          where: { id: { in: postIds } },
          data: { isFeatured: false },
        });
        break;

      case "pin":
        result = await prisma.post.updateMany({
          where: { id: { in: postIds } },
          data: {
            isPinned: true,
            pinnedBy: auth.user.id,
          },
        });
        break;

      case "unpin":
        result = await prisma.post.updateMany({
          where: { id: { in: postIds } },
          data: {
            isPinned: false,
            pinnedBy: null,
            pinnedUntil: null,
          },
        });
        break;

      case "delete":
        // Delete posts and related data
        await prisma.$transaction([
          prisma.mediaAttachment.deleteMany({
            where: { postId: { in: postIds } },
          }),
          prisma.postReaction.deleteMany({
            where: { postId: { in: postIds } },
          }),
          prisma.comment.deleteMany({
            where: { postId: { in: postIds } },
          }),
          prisma.postBookmark.deleteMany({
            where: { postId: { in: postIds } },
          }),
          prisma.postView.deleteMany({
            where: { postId: { in: postIds } },
          }),
          prisma.postShare.deleteMany({
            where: { postId: { in: postIds } },
          }),
          prisma.poll.deleteMany({
            where: { postId: { in: postIds } },
          }),
          prisma.post.deleteMany({
            where: { id: { in: postIds } },
          }),
        ]);

        return sendResponse({
          success: true,
          message: `${postIds.length} posts deleted successfully`,
        });
    }

    return sendResponse({
      success: true,
      message: `${result.count} posts ${action}d successfully`,
      data: { count: result.count },
    });
  } catch (error) {
    console.error("Error in bulk post operation:", error);
    return sendResponse({
      success: false,
      message: "Internal server error",
      status: 500,
    });
  }
}
