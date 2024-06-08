import { initTRPC, TRPCError } from "@trpc/server";
import { type CreateNextContextOptions } from "@trpc/server/adapters/next";
// import { type Session } from "next-auth";
import superjson from "superjson";
import { ZodError } from "zod";
import { getServerAuthSession } from "../auth";
import { prisma } from "../db";
import { token } from "@/lib/getSession";
import { Session } from "next-auth";

// Definisi tipe untuk opsi pembuatan konteks
interface CreateContextOptions {
  session: Session | null;
}

// Fungsi yang menghasilkan konteks yang digunakan dalam setiap request tRPC
const createInnerTRPCContext = (opts: CreateContextOptions) => {
  return {
    session: opts.session,
    prisma,
  };
};

// Fungsi pembantu untuk membuat konteks internal tRPC
export const createTRPCContext = async (opts: CreateNextContextOptions) => {
  const { req, res } = opts;

  const session = await getServerAuthSession({ req, res });

  return createInnerTRPCContext({
    session,
  });
};

// Inisialisasi tRPC dengan konteks yang spesifik
const t = initTRPC.context<typeof createTRPCContext>().create({
  transformer: superjson,
  errorFormatter({ shape, error }: any) {
    return {
      ...shape,
      data: {
        ...shape.data,
        zodError:
          error.cause instanceof ZodError ? error.cause.flatten() : null,
      },
    };
  },
});

export const createTRPCRouter = t.router;

export const publicProcedure = t.procedure;

const isAuth = t.middleware(({ ctx, next }: any) => {
  // console.log("isAuth---------", ctx.session)
  if (!ctx.session || !ctx.session.user) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }
  return next({
    ctx: {
      // infers the `session` as non-nullable
      session: { ...ctx.session, user: ctx.session.user },
    },
  });
});

const isAdmin = t.middleware(({ ctx, next }: any) => {
  // console.log("isAdmin---------", ctx.session)
  if (!ctx.session || !ctx.session.user) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }
  if (ctx.session.user.role !== "ADMIN") {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }
  return next({
    ctx: {
      // infers the `session` as non-nullable
      session: { ...ctx.session, user: ctx.session.user },
    },
  });
});

export const isAuthentication = t.procedure.use(isAuth);
export const protectedProcedure = t.procedure.use(isAuth);
export const adminProtectedProcedure = t.procedure.use(isAdmin);

export const createCallerFactory = t.createCallerFactory;
