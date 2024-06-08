import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { TRPCError } from "@trpc/server";

// Define the schema for subcategory input using Zod
const SubcategoryInput = z.object({
  name: z.string(),
  categoryId: z.string(),
});

const SubcategoryIdInput = z.object({
  id: z.string(),
});

export const subcategoryRouter = createTRPCRouter({

  addSubcategory: protectedProcedure
    .input(SubcategoryInput)
    .mutation(async ({ ctx, input }) => {
      const categoryExists = await ctx.prisma.category.findUnique({
        where: { id: input.categoryId },
      });

      if (!categoryExists) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Category not found.",
        });
      }

      const subcategoryExists = await ctx.prisma.subcategory.findFirst({
        where: {
          name: input.name,
          categoryId: input.categoryId,
        },
      });

      if (subcategoryExists) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "Subcategory with the given name already exists in this category.",
        });
      }

      const subcategory = await ctx.prisma.subcategory.create({
        data: {
          name: input.name,
          categoryId: input.categoryId,
        },
      });

      return subcategory;
    }),

  getAllSubcategories: protectedProcedure.query(async ({ ctx }) => {
    const subcategories = await ctx.prisma.subcategory.findMany({
      include: {
        category: true,
      },
    });
    return subcategories;
  }),
  getAllSubcategoryByCategoryId: protectedProcedure.input(z.string()).query(async ({ ctx, input }) => {
    const subcategories = await ctx.prisma.subcategory.findMany({
      where: {
        categoryId: input
      },
      include: {
        category: true,
      },
    });
    return subcategories;
  }),

  deleteSubcategory: protectedProcedure
    .input(SubcategoryIdInput)
    .mutation(async ({ ctx, input }) => {
      try {
        const subcategory = await ctx.prisma.subcategory.delete({
          where: { id: input.id },
        });
        return subcategory;
      } catch (error) {
        if (error instanceof Error && error.name === "NotFoundError") {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Subcategory not found.",
          });
        }
        throw error;
      }
    }),

});
