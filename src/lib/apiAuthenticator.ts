// src/lib/apiAuthenticator.ts
import { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";
import { prisma } from "@/lib/prisma";

export type UserRole =
  | "SUPER_ADMIN"
  | "ADMIN"
  | "TEACHER"
  | "STUDENT"
  | "GUARDIAN"
  | "MODERATOR";

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
  adminId?: string | null;
}

export interface AuthResult {
  success: boolean;
  user?: AuthenticatedUser;
  error?: string;
  status?: number;
}

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

  /**
   * Authenticate a request with required roles
   * Usage: authenticate(req, "ADMIN", "TEACHER")
   */
  async authenticate(
    req: NextRequest,
    ...allowedRoles: UserRole[]
  ): Promise<AuthResult> {
    return this.authenticateWithOptions(req, { allowedRoles });
  }

  /**
   * Authenticate with additional options
   */
  async authenticateWithOptions(
    req: NextRequest,
    options: {
      allowedRoles?: UserRole[];
      requireVerified?: boolean;
      requireActive?: boolean;
    } = {},
  ): Promise<AuthResult> {
    try {
      // Get token from NextAuth
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

      // Get user from database with role-specific data
      const user = await prisma.user.findUnique({
        where: { id: token.sub as string },
        include: {
          teacher: true,
          student: true,
          guardian: true,
          moderator: true,
          admin: true,
        },
      });

      if (!user) {
        return {
          success: false,
          error: "Unauthorized: User not found",
          status: 401,
        };
      }

      // Check if user is active (if required)
      if (options.requireActive && !user.isActive) {
        return {
          success: false,
          error: "Forbidden: Account is deactivated",
          status: 403,
        };
      }

      // Check if email is verified (if required)
      if (options.requireVerified && !user.emailVerified) {
        return {
          success: false,
          error: "Forbidden: Email not verified",
          status: 403,
        };
      }

      // Check role-based access
      const userRole = user.role as UserRole;

      if (options.allowedRoles && options.allowedRoles.length > 0) {
        // SUPER_ADMIN always has access to everything
        if (userRole === "SUPER_ADMIN") {
          // Allow access
        }
        // Check if user's role is in allowed roles
        else if (!options.allowedRoles.includes(userRole)) {
          return {
            success: false,
            error: `Forbidden: Required roles: ${options.allowedRoles.join(", ")}. Your role: ${userRole}`,
            status: 403,
          };
        }
      }

      // Build authenticated user object
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
        adminId: user.admin?.id,
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

  /**
   * Check if user has any of the specified roles
   */
  hasRole(
    user: AuthenticatedUser | null,
    roles: UserRole | UserRole[],
  ): boolean {
    if (!user) return false;

    // SUPER_ADMIN has all roles
    if (user.role === "SUPER_ADMIN") return true;

    const roleList = Array.isArray(roles) ? roles : [roles];
    return roleList.includes(user.role);
  }

  /**
   * Get role hierarchy - checks if user has sufficient role level
   * SUPER_ADMIN > ADMIN > TEACHER > MODERATOR > STUDENT > GUARDIAN
   */
  hasRoleLevel(user: AuthenticatedUser | null, minimumRole: UserRole): boolean {
    if (!user) return false;

    const roleHierarchy: Record<UserRole, number> = {
      SUPER_ADMIN: 100,
      ADMIN: 80,
      TEACHER: 60,
      MODERATOR: 40,
      STUDENT: 20,
      GUARDIAN: 10,
    };

    const userLevel = roleHierarchy[user.role];
    const requiredLevel = roleHierarchy[minimumRole];

    return userLevel >= requiredLevel;
  }

  /**
   * Check if user is the owner of a resource
   */
  async isResourceOwner(
    user: AuthenticatedUser | null,
    resourceType: string,
    resourceId: string,
  ): Promise<boolean> {
    if (!user) return false;

    // Admins and super admins are considered owners
    if (user.role === "SUPER_ADMIN" || user.role === "ADMIN") return true;

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

// Create a singleton instance
export const apiAuthenticator = APIAuthenticator.getInstance();

// Convenience function for easy usage
export async function authenticate(
  req: NextRequest,
  ...allowedRoles: UserRole[]
): Promise<AuthResult> {
  return apiAuthenticator.authenticate(req, ...allowedRoles);
}
