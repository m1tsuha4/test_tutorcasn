import bcrypt from 'bcryptjs';
import { z } from 'zod';

import { supabase } from '@/servers/supabase/supabaseClient';
import { TRPCError } from '@trpc/server';

import {
  createTRPCRouter,
  isAuthentication,
  protectedProcedure,
  publicProcedure,
} from '../trpc';

async function syncUserToSupabase(email: string, name: string) {
  const { data, error } = await supabase
    .from("users")
    .insert([{ email, name }]);
  if (error) {
    throw new Error(error.message);
  }
  return data;
}

export const userRouter = createTRPCRouter({
  // Mendapatkan dokumen pengguna yang terautentikasi
  getUsersDocs: protectedProcedure.query(async ({ ctx }) => {
    return await ctx.prisma.user.findUnique({
      where: {
        id: ctx?.session?.user?.id,
      },
      // include: {
      //   documents: {
      //     include: {
      //       category: true,
      //     },
      //   },
      // },
    });
  }),

  // Mendapatkan semua pengguna; hanya bisa diakses oleh pengguna dengan role tertentu
  getAllUsers: protectedProcedure.query(async ({ ctx }) => {
    const requestingUser = await ctx.prisma.user.findUnique({
      where: { id: ctx.session?.user.id },
    });

    if (requestingUser?.Role !== "ADMIN") {
      throw new TRPCError({ code: "UNAUTHORIZED" });
    }

    return await ctx.prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        Role: true,
        // documents: {
        //   select: {
        //     id: true,
        //     title: true,
        //   },
        // },
        // messages: {
        //   select: {
        //     id: true,
        //     text: true,
        //   },
        // },
      },
    });
  }),

  // Membuat pengguna baru
  createUser: publicProcedure
    .input(
      z.object({
        email: z.string().email(),
        password: z.string().min(6),
        name: z.string().min(1),
      })
    )
    .mutation(async ({ ctx, input }: any) => {
      try {
        const { email, password, name } = input;
        console.log("backend", input);
        const hashedPassword = bcrypt.hashSync(password, 10);
        const userExists = await ctx.prisma.user.findFirst({
          where: { email },
        });
        console.log("checkUsers", userExists);
        if (userExists) {
          throw new TRPCError({
            code: "CONFLICT",
            message: "Email is already used",
          });
        }
        const newUser = await ctx.prisma.user.create({
          data: {
            email,
            password: hashedPassword,
            name: name,
          },
        });

        await syncUserToSupabase(email, name);
        return {
          status: 200,
          message: "Succesfuly created user",
          data: newUser,
        };
      } catch (error: any) {
        console.log("backendErr", error);
        if (error instanceof TRPCError) {
          if (error.code === "CONFLICT") {
            throw new TRPCError({
              code: "CONFLICT",
              message: "Email is already used",
            });
          }
        }
        return error;
      }
    }),
  userData: isAuthentication.query(async ({ input }: any) => {
    console.log("ayay");
    return "awdawd";
  }),
});
