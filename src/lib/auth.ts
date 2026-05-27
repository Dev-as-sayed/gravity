// lib/auth.ts
import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "./prisma";
import { verifyPassword } from "./password";
import { checkRateLimit } from "./rateLimiter";

export const authOptions: NextAuthOptions = {
  session: {
    strategy: "jwt",
    maxAge: 24 * 60 * 60,
  },
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Invalid credentials");
        }

        const rateLimit = checkRateLimit(
          `login:${credentials.email.toLowerCase()}`,
        );
        if (!rateLimit.allowed) {
          const retryAfter = Math.ceil(
            (rateLimit.resetAt - Date.now()) / 1000 / 60,
          );
          throw new Error(
            `Too many attempts. Try again in ${retryAfter} minutes.`,
          );
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email.toLowerCase() },
          include: {
            teacher: true,
            student: true,
            guardian: true,
            moderator: true,
          },
        });

        if (!user || !user.password) {
          throw new Error("Invalid credentials");
        }

        const isValid = await verifyPassword(
          credentials.password,
          user.password,
        );
        if (!isValid) {
          throw new Error("Invalid credentials");
        }

        if (!user.isActive) {
          throw new Error("Account is deactivated");
        }

        await prisma.user.update({
          where: { id: user.id },
          data: { lastLogin: new Date() },
        });

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          phone: user.phone,
          profileImage: user.profileImage,
          teacherId: user.teacher?.id,
          studentId: user.student?.id,
          guardianId: user.guardian?.id,
          moderatorId: user.moderator?.id,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
        token.role = user.role;
        token.phone = user.phone;
        token.profileImage = user.profileImage;
        token.teacherId = user.teacherId;
        token.studentId = user.studentId;
        token.guardianId = user.guardianId;
        token.moderatorId = user.moderatorId;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user = {
          id: token.id as string,
          email: token.email as string,
          name: token.name as string,
          role: token.role as string,
          phone: token.phone as string,
          profileImage: token.profileImage as string,
          teacherId: token.teacherId as string,
          studentId: token.studentId as string,
          guardianId: token.guardianId as string,
          moderatorId: token.moderatorId as string,
        };
      }
      return session;
    },
  },
  pages: {
    signIn: "/auth/login",
    error: "/auth/error",
  },
  secret: process.env.NEXTAUTH_SECRET,
};
