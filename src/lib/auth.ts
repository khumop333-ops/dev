import type { NextAuthOptions } from "next-auth";
import { getServerSession } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "./prisma";
import { checkRateLimit } from "./rate-limit";
import { writeAuditLog } from "./audit";
import { redirect } from "next/navigation";

export const authOptions: NextAuthOptions = {
  session: {
    strategy: "jwt",
    maxAge: 60 * 60 * 12, // 12 hours
  },
  pages: {
    signIn: "/admin/login",
  },
  providers: [
    CredentialsProvider({
      name: "Staff & Admin Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Please enter both your email address and password.");
        }

        const email = credentials.email.trim().toLowerCase();

        const rate = checkRateLimit(`admin-login:${email}`, {
          maxRequests: 10,
          windowMs: 15 * 60 * 1000, // 15 minutes
        });

        if (!rate.allowed) {
          throw new Error(
            `Too many sign-in attempts. Please wait ${rate.resetInSeconds} seconds before trying again.`
          );
        }

        const user = await prisma.user.findUnique({
          where: { email },
        });

        if (!user || !user.active) {
          throw new Error("Invalid email address or password.");
        }

        const validPassword = await bcrypt.compare(
          credentials.password,
          user.passwordHash
        );

        if (!validPassword) {
          throw new Error("Invalid email address or password.");
        }

        await writeAuditLog({
          userId: user.id,
          userEmail: user.email,
          action: "ADMIN_LOGIN",
          entityType: "User",
          entityId: user.id,
          metadata: { role: user.role },
        });

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token) {
        session.user.id = token.id;
        session.user.role = token.role;
      }
      return session;
    },
  },
  secret:
    process.env.NEXTAUTH_SECRET ||
    "local-dev-secret-key-for-highveld-herbal-template-32-chars",
};

export async function getAdminSession() {
  return getServerSession(authOptions);
}

export async function requireStaffOrAdmin() {
  const session = await getAdminSession();
  if (!session?.user?.id) {
    redirect("/admin/login");
  }
  const dbUser = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, name: true, email: true, role: true, active: true },
  });
  if (!dbUser || !dbUser.active) {
    redirect("/admin/login");
  }
  return dbUser;
}

export async function requireAdminOnly() {
  const user = await requireStaffOrAdmin();
  if (user.role !== "ADMIN") {
    throw new Error("Forbidden: This action requires ADMIN privileges.");
  }
  return user;
}
