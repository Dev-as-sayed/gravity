// src/lib/apiAuthenticator.ts
import { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";
import { prisma } from "@/lib/prisma";

export type UserRole =
  | "TEACHER"
  | "MODERATOR"
  | "STUDENT"
  | "GUARDIAN";

export interface AuthenticatedUser {
  id: string;
  email: string;
  name: string | null;
  role: UserRole;
  isActive: boolean;
  isVerified: boolean;
  teacherId?: string | null;
  studentId?: string | null;
  guardianId?: string | null;
  moderatorId?: string | null;
}

export type AuthResult =
  | { success: true; user: AuthenticatedUser }
  | { success: false; error: string; status: number };

export interface AuthOptions {
  requireVerified?: boolean;
  requireActive?: boolean;
  allowGuest?: boolean;
}

class APIAuthenticator {
  private static instance: APIAuthenticator;

  private constructor() {}

  public static getInstance(): APIAuthenticator {
    if (!APIAuthenticator.instance) {
      APIAuthenticator.instance = new APIAuthenticator();
    }
    return APIAuthenticator.instance;
  }

  async authenticate(
    req: NextRequest,
    ...allowedRoles: UserRole[]
  ): Promise<AuthResult> {
    return this.authenticateWithOptions(req, { allowedRoles });
  }

  async authenticateWithOptions(
    req: NextRequest,
    options: {
      allowedRoles?: UserRole[];
      requireVerified?: boolean;
      requireActive?: boolean;
    } = {},
  ): Promise<AuthResult> {
    try {
      const token = await getToken({
        req,
        secret: process.env.NEXTAUTH_SECRET,
      });

      if (!token) {
        return {
          success: false,
          error: "Unauthorized: No token provided",
          status: 401,
        };
      }

      const user = await prisma.user.findUnique({
        where: { id: token.sub as string },
        include: {
          teacher: true,
          student: true,
          guardian: true,
          moderator: true,
        },
      });

      if (!user) {
        return {
          success: false,
          error: "Unauthorized: User not found",
          status: 401,
        };
      }

      if (options.requireActive && !user.isActive) {
        return {
          success: false,
          error: "Forbidden: Account is deactivated",
          status: 403,
        };
      }

      if (options.requireVerified && !user.emailVerified) {
        return {
          success: false,
          error: "Forbidden: Email not verified",
          status: 403,
        };
      }

      const userRole = user.role as UserRole;

      if (options.allowedRoles && options.allowedRoles.length > 0) {
        if (!options.allowedRoles.includes(userRole)) {
          return {
            success: false,
            error: `Forbidden: Required roles: ${options.allowedRoles.join(", ")}. Your role: ${userRole}`,
            status: 403,
          };
        }
      }

      const authenticatedUser: AuthenticatedUser = {
        id: user.id,
        email: user.email,
        name: user.name,
        role: userRole,
        isActive: user.isActive,
        isVerified: user.emailVerified,
        teacherId: user.teacher?.id,
        studentId: user.student?.id,
        guardianId: user.guardian?.id,
        moderatorId: user.moderator?.id,
      };

      return {
        success: true,
        user: authenticatedUser,
      };
    } catch (error) {
      console.error("Authentication error:", error);
      return {
        success: false,
        error: "Internal server error during authentication",
        status: 500,
      };
    }
  }

  hasRole(
    user: AuthenticatedUser | null,
    roles: UserRole | UserRole[],
  ): boolean {
    if (!user) return false;

    const roleList = Array.isArray(roles) ? roles : [roles];
    return roleList.includes(user.role);
  }

  hasRoleLevel(user: AuthenticatedUser | null, minimumRole: UserRole): boolean {
    if (!user) return false;

    const roleHierarchy: Record<UserRole, number> = {
      TEACHER: 100,
      MODERATOR: 60,
      STUDENT: 20,
      GUARDIAN: 10,
    };

    const userLevel = roleHierarchy[user.role];
    const requiredLevel = roleHierarchy[minimumRole];

    return userLevel >= requiredLevel;
  }

  async isResourceOwner(
    user: AuthenticatedUser | null,
    resourceType: string,
    resourceId: string,
  ): Promise<boolean> {
    if (!user) return false;

    if (user.role === "TEACHER") return true;

    try {
      switch (resourceType) {
        case "batch":
          const batch = await prisma.batch.findUnique({
            where: { id: resourceId },
            select: { teacherId: true },
          });
          return batch?.teacherId === user.teacherId;

        case "course":
          const course = await prisma.course.findUnique({
            where: { id: resourceId },
            select: { teacherId: true },
          });
          return course?.teacherId === user.teacherId;

        case "post":
          const post = await prisma.post.findUnique({
            where: { id: resourceId },
            select: { teacherId: true, studentId: true },
          });
          return (
            post?.teacherId === user.teacherId ||
            post?.studentId === user.studentId
          );

        case "comment":
          const comment = await prisma.comment.findUnique({
            where: { id: resourceId },
            select: { teacherId: true, studentId: true, guardianId: true },
          });
          return (
            comment?.teacherId === user.teacherId ||
            comment?.studentId === user.studentId ||
            comment?.guardianId === user.guardianId
          );

        case "enrollment":
          const enrollment = await prisma.enrollment.findUnique({
            where: { id: resourceId },
            select: { studentId: true },
          });
          return enrollment?.studentId === user.studentId;

        default:
          return false;
      }
    } catch (error) {
      return false;
    }
  }
}

export const apiAuthenticator = APIAuthenticator.getInstance();

export async function authenticate(
  req: NextRequest,
  ...allowedRoles: UserRole[]
): Promise<AuthResult> {
  return apiAuthenticator.authenticate(req, ...allowedRoles);
}
