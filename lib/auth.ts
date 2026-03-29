import bcrypt from "bcryptjs";
import type { NextAuthOptions } from "next-auth";
import { getServerSession } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

import { prisma } from "@/lib/prisma";
import { loginSchema } from "@/lib/validations";

export async function verifyUserCredentials(identifier: string, password: string) {
  const user = await prisma.user.findFirst({
    where: {
      OR: [{ email: identifier.toLowerCase() }, { username: identifier }],
    },
  });

  if (!user) {
    return null;
  }

  const isValid = await bcrypt.compare(password, user.passwordHash);

  if (!isValid) {
    return null;
  }

  return user;
}

export const authOptions: NextAuthOptions = {
  session: { strategy: "jwt" },
  secret: process.env.AUTH_SECRET,
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        identifier: { label: "Email or Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const parsed = loginSchema.safeParse(credentials);

        if (!parsed.success) {
          return null;
        }

        const user = await verifyUserCredentials(parsed.data.identifier, parsed.data.password);

        if (!user) {
          return null;
        }

        return {
          id: user.id,
          name: user.username,
          email: user.email,
          image: user.profileImage,
          timezone: user.timezone,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.username = user.name ?? undefined;
        token.timezone = (user as { timezone?: string }).timezone ?? "UTC";
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user && token.id) {
        // Fetch user from database to get billing fields
        const dbUser = await prisma.user.findUnique({
          where: { id: token.id as string },
          select: {
            tier: true,
            stripeCustomerId: true,
          },
        });

        session.user.id = token.id as string;
        session.user.username = (token.username as string) ?? session.user.name ?? "";
        session.user.timezone = (token.timezone as string) ?? "UTC";

        // Add billing fields to session
        if (dbUser) {
          Object.assign(session.user, {
            tier: dbUser.tier,
            stripeCustomerId: dbUser.stripeCustomerId,
          });
        }
      }

      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
};

export async function getAuthSession() {
  return getServerSession(authOptions);
}

export async function getRequiredUser() {
  const session = await getAuthSession();

  if (!session?.user?.id) {
    return null;
  }

  return prisma.user.findUnique({
    where: { id: session.user.id },
  });
}
