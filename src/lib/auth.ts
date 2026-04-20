// lib/auth.ts
import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "./prisma"; // Import the singleton instance
import bcrypt from "bcryptjs";

export const authOptions: NextAuthOptions = {
  session: {
    strategy: "jwt",
  },
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        console.log("Authorizing user with email:", credentials?.email);
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Invalid credentials");
        }

        const user = await prisma.user.findUnique({
          where: {
            email: credentials.email,
          },
          include: {
            teacher: true,
            student: true,
            guardian: true,
            moderator: true,
            admin: true,
          },
        });

        console.log(
          `User lookup for email: ${credentials.email} - Found: ${!!user}`,
          user,
        );
        if (!user || !user.password) {
          throw new Error("Invalid credentials");
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.password,
        );

        if (!isPasswordValid) {
          console.log(`Password mismatch for user: ${credentials.email}`);
          throw new Error("Invalid credentials");
        }

        if (!user.isActive) {
          throw new Error("Account is deactivated");
        }

        // Update last login
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
          adminId: user.admin?.id,
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
        token.adminId = user.adminId;
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
          adminId: token.adminId as string,
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
