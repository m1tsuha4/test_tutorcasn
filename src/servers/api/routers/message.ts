import { createTRPCRouter, protectedProcedure } from "../trpc";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { getError } from "./help";

export const messageRouter = createTRPCRouter({
  getAllByDocId: protectedProcedure
    .input(
      z.object({
        docId: z.string(),
      })
    )
    .query(async ({ ctx, input }) => {
      const res = await ctx.prisma.document.findUnique({
        where: {
          id: input.docId,
        },
        select: {
          messages: true,
        },
      });

      if (!res) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Document not found or you do not have access to it.",
        });
      }

      return res?.messages?.map((c) => ({
        id: c.id,
        content: c.text,
        role: c.isUserMessage ? "user" : "assistant",
      }));
    }),
  getAllByDocIdAndUserId: protectedProcedure.input(z.object({
    documentId: z.string()
  })).query(async ({ ctx, input }) => {
    try {
      const messages = await ctx.prisma.message.findMany({
        where: {
          documentId: input.documentId,
          userId: ctx.session?.user.id
        },
        orderBy: {
          createdAt: "asc"
        },
        include: {
          document: true
        }
      })
      if (messages.length === 0) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Message Not Found"
        })
      }
      return messages.map((item: any) => ({
        id: item.id,
        content: item.text,
        role: item.isUserMessage ? "user" : "assistant",
        createdAt: item.createdAt,
        like: item.like,
        dislike: item.dislike
      }))
    } catch (error: any) {
      getError(error, error?.message)
      return error;
    }
  }),
  resetMessage: protectedProcedure.input(z.object({
    docId: z.string()
  })).mutation(async ({ ctx, input }) => {
    await ctx.prisma.message.deleteMany({
      where: {
        userId: ctx.session?.user.id,
        documentId: input.docId
      }
    })
  }),
  editMessages: protectedProcedure.input(z.object({
    docId: z.string(),
    index: z.number()
  })).mutation(async ({ ctx, input }) => {
    const data = await ctx.prisma.message.findMany({
      where: {
        userId: ctx.session?.user.id,
        documentId: input.docId
      },
      orderBy: {
        createdAt: "asc"
      },
    })
    const messagesToDelete = data.filter((_, i) => i >= input.index - 1);
    await ctx.prisma.message.deleteMany({
      where: {
        id: {
          in: messagesToDelete.map(message => message.id)
        }
      }
    });
  }),
  regenerateMessage: protectedProcedure.input(z.object({
    docId: z.string(),
    index: z.number()
  })).mutation(async ({ ctx, input }) => {
    const data = await ctx.prisma.message.findMany({
      where: {
        userId: ctx.session?.user.id,
        documentId: input.docId
      },
      orderBy: {
        createdAt: "asc"
      },
    })
    const messagesToDelete = data.filter((_, i) => i >= input.index - 2);
    await ctx.prisma.message.deleteMany({
      where: {
        id: {
          in: messagesToDelete.map(message => message.id)
        }
      }
    });
  }),
  likeMessage: protectedProcedure.input(z.object({ id: z.string() })).mutation(async ({ ctx, input }) => {
    const check = await ctx.prisma.message.findFirst({
      where: {
        id: input.id
      },
    })
    if (check?.like) {
      await ctx.prisma.message.update({
        where: {
          id: input.id
        },
        data: {
          like: false
        }
      })
    } else {
      await ctx.prisma.message.update({
        where: {
          id: input.id
        },
        data: {
          like: true
        }
      })
    }
  }),
  dislikeMessage: protectedProcedure.input(z.object({ id: z.string() })).mutation(async ({ ctx, input }) => {
    const check = await ctx.prisma.message.findFirst({
      where: {
        id: input.id
      },
    })
    if (check?.dislike) {
      await ctx.prisma.message.update({
        where: {
          id: input.id
        },
        data: {
          dislike: false
        }
      })
    } else {
      await ctx.prisma.message.update({
        where: {
          id: input.id
        },
        data: {
          dislike: true
        }
      })
    }
  })
});
