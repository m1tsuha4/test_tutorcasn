import { generateFlashcards as generateFlashcardsHelper } from "@/lib/flashcard";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { TRPCError } from "@trpc/server";
import { prisma } from "@/servers/db";
import { z } from "zod";

export const flashcardRouter = createTRPCRouter({
  getFlashcards: protectedProcedure
    .input(
      z.object({
        documentId: z.string(),
      })
    )
    .query(async ({ ctx, input }) => {
      const res = await ctx.prisma.document.findUnique({
        where: {
          id: input.documentId,
        },

        select: {
          flashcards: {
            where: {
              userId: ctx.session?.user.id
            },
            select: {
              answer: true,
              question: true,
              id: true,
              userId: true,
              flashcardAttempts: {
                select: {
                  userResponse: true,
                  correctResponse: true,
                  incorrectResponse: true,
                  moreInfo: true,
                  createdAt: true,
                },
              },
            },
          },
        },
      });

      if (!res) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Document not found or you do not have access to it.",
        });
      }

      if (res.flashcards.length === 0) {
        return [];
      }

      return res.flashcards;
    }),

  generateFlashcards: protectedProcedure
    .input(
      z.object({
        documentId: z.string(),
        // pages: z.array(z.number()),
        // numberOfQuestions: z.number(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session?.user.id;
      const checkFlashcard = await ctx.prisma.flashcard.deleteMany({
        where: {
          userId,
          documentId: input.documentId
        }
      })
      const res = await ctx.prisma.document.findUnique({
        where: {
          id: input.documentId,
          // OR: [{ ownerId: ctx.session.user.id }],
        },
        select: {
          url: true,
        },
      });

      if (!res) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Document not found or you do not have access to it.",
        });
      }

      const flashcards = await generateFlashcardsHelper(res.url);

      if (!userId) {
        throw new Error('User ID is required');
      }
      const newData = flashcards.map((item) => ({
        question: item.question,
        answer: item.answer,
        userId,
        documentId: input.documentId,
      }))
      console.log("flascard:", newData)
      const saveToDbs = await ctx.prisma.flashcard.createMany({
        data: [
          ...newData
        ]
      })
      console.log("flascard2:", saveToDbs)
      return saveToDbs
    }),
});
