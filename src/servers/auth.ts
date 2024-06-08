import NextAuth, { getServerSession } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { supabase } from "./supabase/supabaseClient";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { GetServerSidePropsContext } from "next";
const prisma = new PrismaClient();

// Opsi konfigurasi untuk NextAuth

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {},
      authorize: async (credentials: any) => {
        // console.log("credentials", credentials);
        const user = await prisma.user.findUnique({
          where: {
            email: credentials.email
          }
        });

        if (user && bcrypt.compareSync(credentials.password, user.password)) {
          return { id: user.id, name: user.name, email: user.email, role: user.Role };
        } else {
          throw new Error('Email atau password salah');
        }
      }
    })
  ],
  callbacks: {
    jwt: async ({ token, user }: any) => {
      // console.log("jwt:", user, token);
      if (user) {
        token.id = user.id;
        token.name = user.name;
        token.email = user.email;
        token.role = user.role;
      }

      return token;
    },
    session: async ({ session, token }: any) => {
      // console.log("session:", session, token);
      session.user = {
        id: token.id,
        name: token.name,
        email: token.email,
        role: token.role
      };
      // console.log("session2:", session, token);
      return session;
    }
  },
  pages: {
    signIn: '/auth/login',
    error: '/auth/error'
  },
  secret: process.env.NEXTAUTH_SECRET
};

export default NextAuth(authOptions);

// Fungsi untuk mendapatkan sesi autentikasi di server-side
export const getServerAuthSession = (ctx: {
  req: GetServerSidePropsContext["req"];
  res: GetServerSidePropsContext["res"];
}) => {
  return getServerSession(ctx.req, ctx.res, authOptions);
};
