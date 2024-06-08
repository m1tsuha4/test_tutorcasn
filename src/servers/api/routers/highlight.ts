import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "../trpc";
import { HighlightTypeEnum } from "@prisma/client";
import { TRPCError } from "@trpc/server";

export const highlightRouter = createTRPCRouter({
  // add: protectedProcedure
  //   .input(
  //     z.object({
  //       documentId: z.string(),
  //       id: z.string(),
  //       boundingRect: z.object({
  //         x1: z.number(),
  //         y1: z.number(),
  //         x2: z.number(),
  //         y2: z.number(),
  //         width: z.number(),
  //         height: z.number(),
  //         // see when this becomes optional => for text highlights?
  //         pageNumber: z.number().optional(),
  //       }),
  //       rects: z.array(
  //         z.object({
  //           x1: z.number(),
  //           y1: z.number(),
  //           x2: z.number(),
  //           y2: z.number(),
  //           width: z.number(),
  //           height: z.number(),
  //           // see when this becomes optional => for imagehighlights?
  //           pageNumber: z.number().optional(),
  //         })
  //       ),
  //       pageNumber: z.number(),
  //       type: z.nativeEnum(HighlightTypeEnum),
  //     })
  //   )
  //   .mutation(async ({ ctx, input }) => {

  //     console.log("Input Highlight:", input)
  //     const doc = await ctx.prisma.document.findUnique({
  //       where: {
  //         id: input.documentId,
  //       },
  //     });

  //     if (!doc) {
  //       throw new TRPCError({
  //         code: "UNAUTHORIZED",
  //         message: "You are not authorized to edit this document",
  //       });
  //     }

  //     const pageNumber =
  //       typeof input.boundingRect.pageNumber === "number" &&
  //         !isNaN(input.boundingRect.pageNumber)
  //         ? { pageNumber: input.boundingRect.pageNumber }
  //         : {};

  //     await ctx.prisma.highlight.create({
  //       data: {
  //         id: input.id,
  //         boundingRectangle: {
  //           create: {
  //             x1: input.boundingRect.x1,
  //             y1: input.boundingRect.y1,
  //             x2: input.boundingRect.x2,
  //             y2: input.boundingRect.y2,
  //             width: input.boundingRect.width,
  //             height: input.boundingRect.height,
  //             ...pageNumber,
  //           },
  //         },
  //         type: input.type,
  //         ...pageNumber,
  //         rectangles: {
  //           createMany: {
  //             data: input.rects.map((rect) => ({
  //               x1: rect.x1,
  //               y1: rect.y1,
  //               x2: rect.x2,
  //               y2: rect.y2,
  //               width: rect.width,
  //               height: rect.height,
  //               ...(typeof rect.pageNumber === "number" &&
  //                 !isNaN(rect.pageNumber)
  //                 ? { pageNumber: rect.pageNumber }
  //                 : {}),
  //             })),
  //           },
  //         },
  //         document: {
  //           connect: {
  //             id: input.documentId,
  //           },
  //         },
  //       },
  //     });

  //     return true;
  //   }),
  add: protectedProcedure
    .input(
      z.object({
        documentId: z.string(),
        id: z.string(),
        boundingRect: z.object({
          x1: z.number(),
          y1: z.number(),
          x2: z.number(),
          y2: z.number(),
          width: z.number(),
          height: z.number(),
          pageNumber: z.number().optional(),
        }),
        rects: z.array(
          z.object({
            x1: z.number(),
            y1: z.number(),
            x2: z.number(),
            y2: z.number(),
            width: z.number(),
            height: z.number(),
            pageNumber: z.number().optional(),
          })
        ),
        pageNumber: z.number(),
        type: z.nativeEnum(HighlightTypeEnum)
      })
    )
    .mutation(async ({ ctx, input }) => {
      console.log("Input Highlight:", input);

      try {
        const doc = await ctx.prisma.document.findUnique({
          where: {
            id: input.documentId,
          },
        });

        if (!doc) {
          throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "You are not authorized to edit this document",
          });
        }

        const pageNumber =
          typeof input.boundingRect.pageNumber === "number" &&
            !isNaN(input.boundingRect.pageNumber)
            ? { pageNumber: input.boundingRect.pageNumber }
            : {};

        await ctx.prisma.highlight.create({
          data: {
            id: input.id,
            boundingRectangle: {
              create: {
                x1: input.boundingRect.x1,
                y1: input.boundingRect.y1,
                x2: input.boundingRect.x2,
                y2: input.boundingRect.y2,
                width: input.boundingRect.width,
                height: input.boundingRect.height,
                ...pageNumber,
              },
            },
            type: input.type,
            ...pageNumber,
            rectangles: {
              createMany: {
                data: input.rects.map((rect) => ({
                  x1: rect.x1,
                  y1: rect.y1,
                  x2: rect.x2,
                  y2: rect.y2,
                  width: rect.width,
                  height: rect.height,
                  ...(typeof rect.pageNumber === "number" &&
                    !isNaN(rect.pageNumber)
                    ? { pageNumber: rect.pageNumber }
                    : {}),
                })),
              },
            },
            document: {
              connect: {
                id: input.documentId,
              },
            },
            user: {
              connect: {
                id: ctx.session?.user.id,
              },
            },
          },
        });

        return true;
      } catch (error) {
        console.error("Error creating highlight:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "An error occurred while creating the highlight",
        });
      }
    }),



  delete: protectedProcedure
    .input(
      z.object({
        highlightId: z.string(),
        documentId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const doc = await ctx.prisma.document.findUnique({
        where: {
          id: input.documentId,

        },
      });

      if (!doc) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "You are not authorized to edit this document",
        });
      }

      await ctx.prisma.highlight.delete({
        where: {
          id: input.highlightId,
          documentId: input.documentId,
        },
      });

      return true;
    }),

  updateAreaHighlight: protectedProcedure
    .input(
      z.object({
        documentId: z.string(),
        id: z.string(),
        boundingRect: z.object({
          x1: z.number(),
          y1: z.number(),
          x2: z.number(),
          y2: z.number(),
          width: z.number(),
          height: z.number(),
          pageNumber: z.number().optional(),
        }),
        pageNumber: z.number().optional(),
        type: z.nativeEnum(HighlightTypeEnum),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const doc = await ctx.prisma.document.findUnique({
        where: {
          id: input.documentId,

        },
      });

      if (!doc) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "You are not authorized to edit this document",
        });
      }

      const pageNumber =
        typeof input.boundingRect.pageNumber === "number" &&
          !isNaN(input.boundingRect.pageNumber)
          ? { pageNumber: input.boundingRect.pageNumber }
          : {};

      await ctx.prisma.highlight.update({
        where: {
          id: input.id,
        },

        data: {
          id: input.id,
          boundingRectangle: {
            create: {
              x1: input.boundingRect.x1,
              y1: input.boundingRect.y1,
              x2: input.boundingRect.x2,
              y2: input.boundingRect.y2,
              width: input.boundingRect.width,
              height: input.boundingRect.height,
              ...pageNumber,
            },
          },
          type: input.type,
          ...pageNumber,
          document: {
            connect: {
              id: input.documentId,
            },
          },
        },
      });

      return true;
    }),

  getHighlightCoordinate: protectedProcedure.input(z.object({
    documentId: z.string(),
    pageNumber: z.number(),
    x1: z.number(),
    y1: z.number(),
    x2: z.number(),
    y2: z.number()
  })).query(async ({ ctx, input }) => {

    const data = await ctx.prisma.cordinate.findMany({
      where: {
        highlightedRectangleId: "ypjdlpubjrrim9vqahl0bsa9",

      },
    });
    return data;
  }),
  getAllHighlight: protectedProcedure.query(async ({ ctx }) => {
    const data = await ctx.prisma.highlight.findMany({
      where: {
        userId: ctx.session?.user.id,
      },
      include: {
        boundingRectangle: true,
        rectangles: true
      }
    });
    return data;
  })
});
