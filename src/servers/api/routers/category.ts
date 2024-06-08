// Import the necessary utilities from your tRPC and Zod setup
import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { TRPCError } from "@trpc/server";

// Define the schema for category input using Zod
const CategoryInput = z.object({
  name: z.string(),
});

const CategoryIdInput = z.object({
  id: z.string(),
});


export const categoryRouter = createTRPCRouter({
  // menambahkan kategori
  addCategory: protectedProcedure
    .input(CategoryInput)
    .mutation(async ({ ctx, input }) => {
      const existingCategory = await ctx.prisma.category.findUnique({
        where: { name: input.name },
      });

      if (existingCategory) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "A category with this name already exists.",
        });
      }

      // buat kategori
      const category = await ctx.prisma.category.create({
        data: {
          name: input.name,
        },
      });

      return category;
    }),

  //  getting all categories
  getAllCategories: protectedProcedure.query(async ({ ctx }) => {
    const categories = await ctx.prisma.category.findMany();
    return categories;
  }),

  // logic hapus kategori
  deleteCategory: protectedProcedure
    .input(CategoryIdInput)
    .mutation(async ({ ctx, input }) => {
      try {
        const category = await ctx.prisma.category.delete({
          where: { id: input.id },
        });
        return category;
      } catch (error) {
        // Handle case where category with given ID doesn't exist
        if (error instanceof Error && error.name === "NotFoundError") {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Category not found.",
          });
        }
        throw error;
      }
    }),
});


