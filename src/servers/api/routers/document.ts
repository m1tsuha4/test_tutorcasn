import {
  addDays,
  endOfDay,
  startOfDay,
} from 'date-fns';
import { z } from 'zod';

import { vectorizePDF } from '@/lib/vectorise';
import { TRPCError } from '@trpc/server';

import {
  adminProtectedProcedure,
  createTRPCRouter,
  protectedProcedure,
} from '../trpc';
import * as pdfjsLib from 'pdfjs-dist';
import { getError } from './help';

export const documentRouter = createTRPCRouter({
  addDocument: adminProtectedProcedure.input(
    z.object({
      title: z.string(),
      categoryId: z.string(),
      subCategoryId: z.string(),
      url: z.string(),
      img: z.string()
    })
  ).mutation(async ({ ctx, input }: any) => {
    try {
      const data = await ctx.prisma.document.create({
        data: {
          title: input.title,
          categoryId: input.categoryId,
          subCategoryId: input.subCategoryId,
          url: input.url,
          img: input.img
        },
      });
      const userDocs = await ctx.prisma.userDocument.findFirst({
        where: {
          userId: ctx.session?.user.id,
          documentId: data.id,
        },
      });
      if (!data) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Document not found or you are not the owner.",
        });
      }
      if (userDocs && userDocs.isVectorised) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "User has already vectorised this document.",
        });
      }

      try {
        await vectorizePDF(data.url, data.id, ctx.session?.user.id);
        return {
          status: 200,
          message: "Succesfully Add Document",
          data,
        };
      } catch (err: any) {
        await ctx.prisma.document.delete({
          where: {
            id: data.id
          }
        })
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: err.message,
        });
      }
    } catch (error) {
      console.log("backendErr", error);
      if (error instanceof TRPCError) {
        if (error.code === "CONFLICT") {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Add Dokument Error",
          });
        }
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Internal Server Error",
        });
      }
      return error;
    }
  }),
  deleteDocument: adminProtectedProcedure
    .input(
      z.object({
        title: z.string(),
        id: z.string(),
      })
    )
    .mutation(async ({ ctx, input }: any) => {
      try {
        const dataEmbedding = await ctx.prisma.embedding.deleteMany({
          where: {
            documentId: input.id,
          },
        });
        const data = await ctx.prisma.document.delete({
          where: {
            id: input.id,
          },
        });
        return {
          status: 200,
          message: "Succesfully Delete Document",
          data: {
            dataEmbedding,
            data
          }
        };
      } catch (error) {
        console.log("backendErr", error);
        if (error instanceof TRPCError) {
          if (error.code === "CONFLICT") {
            throw new TRPCError({
              code: "BAD_REQUEST",
              message: "Add Dokument Error",
            });
          }
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Internal Server Error",
          });
        }
        return error;
      }
    }),
  getCategoryAndSubCategory: protectedProcedure.query(async ({ ctx }) => {
    try {
      const Category = await ctx.prisma.category.findMany();
      const SubCategory = await ctx.prisma.subcategory.findMany();
      return {
        category: Category,
        subCategory: SubCategory,
      };
    } catch (error) {
      if (error instanceof TRPCError) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Internal Server Error",
        });
      }
      return error;
    }
  }),
  getAllDocument: protectedProcedure.query(async ({ ctx }) => {
    try {
      const data = await ctx.prisma.document.findMany({
        include: {
          category: true,
          subCategory: true,
        },
      });
      if (data) {
        return data;
      } else {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Internal Server Error",
        });
      }
    } catch (error) {
      if (error instanceof TRPCError) {
        if (error.code === "NOT_FOUND") {
          return [];
        }
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Internal Server Error",
        });
      }
      return [];
    }
  }),
  getDocumentByCategoryId: protectedProcedure
    .input(z.string())
    .query(async ({ ctx, input }) => {
      try {
        console.log("test", input);
        const data = await ctx.prisma.document.findMany({
          where: {
            categoryId: input,
          },
          include: {
            category: true,
            subCategory: true,
          },
        });
        return [...data];
      } catch (error) {
        if (error instanceof TRPCError) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Internal Server Error",
          });
        }
        console.log(error);
        return error;
      }
    }),
  getDocumentByCategoryAndSubId: protectedProcedure
    .input(
      z.object({
        categoryId: z.string(),
        subCategoryId: z.string(),
      })
    )
    .query(async ({ ctx, input }) => {
      try {
        const data = await ctx.prisma.document.findMany({
          where: {
            categoryId: input.categoryId,
            subCategoryId: input.subCategoryId,
          },
          include: {
            category: true,
            subCategory: true,
          },
        });
        return [...data];
      } catch (error) {
        if (error instanceof TRPCError) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Internal Server Error",
          });
        }
        console.log(error);
        return error;
      }
    }),
  sortDocumentByCategoryAndSubId: protectedProcedure
    .input(
      z.object({
        categoryId: z.string(),
        subCategoryId: z.string(),
        option: z.string()
      })
    )
    .query(async ({ ctx, input }) => {
      try {
        if (input.subCategoryId) {
          if (input.option === "ascending") {
            const data = await ctx.prisma.document.findMany({
              where: {
                categoryId: input.categoryId,
                subCategoryId: input.subCategoryId,
              },
              orderBy: {
                title: "asc"
              },
              include: {
                category: true,
                subCategory: true,
              },
            });
            return [...data];
          }
          if (input.option === "latest") {
            const data = await ctx.prisma.document.findMany({
              where: {
                categoryId: input.categoryId,
                subCategoryId: input.subCategoryId,
              },
              orderBy: {
                createdAt: "desc"
              },
              include: {
                category: true,
                subCategory: true,
              },
            });
            return [...data];
          }
          if (input.option === "popular") {
            const popularDocuments = await ctx.prisma.userDocument.groupBy({
              by: ['documentId'],
              _count: {
                documentId: true,
              },
              orderBy: {
                _count: {
                  documentId: 'desc',
                },
              },
            });

            const documentDetails = await ctx.prisma.document.findMany({
              where: {
                id: {
                  in: popularDocuments.map(doc => doc.documentId),
                },
                categoryId: input.categoryId,
                subCategoryId: input.subCategoryId
              },
              include: {
                category: true,
                subCategory: true
              }
            });

            const data = popularDocuments.map(popularDoc => {
              const docDetail = documentDetails.find(doc => doc.id === popularDoc.documentId);
              if (docDetail) {
                return {
                  documentId: popularDoc.documentId,
                  accessCount: popularDoc._count.documentId,
                  ...docDetail,
                };
              } else {
                return null
              }
            }).filter((item) => item)

            // console.log(data)
            return [...data]
          }
        } else {
          if (input.option === "ascending") {
            const data = await ctx.prisma.document.findMany({
              where: {
                categoryId: input.categoryId,
              },
              orderBy: {
                title: "asc"
              },
              include: {
                category: true,
                subCategory: true,
              },
            });
            return [...data];
          }
          if (input.option === "latest") {
            const data = await ctx.prisma.document.findMany({
              where: {
                categoryId: input.categoryId,
              },
              orderBy: {
                createdAt: "desc"
              },
              include: {
                category: true,
                subCategory: true,
              },
            });
            return [...data];
          }
          if (input.option === "popular") {
            const popularDocuments = await ctx.prisma.userDocument.groupBy({
              by: ['documentId'],
              _count: {
                documentId: true,
              },
              orderBy: {
                _count: {
                  documentId: 'desc',
                },
              },
            });

            const documentDetails = await ctx.prisma.document.findMany({
              where: {
                id: {
                  in: popularDocuments.map(doc => doc.documentId),
                },
                categoryId: input.categoryId
              },
              include: {
                category: true,
                subCategory: true
              }
            });

            const data = popularDocuments.map(popularDoc => {
              const docDetail = documentDetails.find(doc => doc.id === popularDoc.documentId);
              if (docDetail) {
                return {
                  documentId: popularDoc.documentId,
                  accessCount: popularDoc._count.documentId,
                  ...docDetail,
                };
              } else {
                return null
              }
            }).filter((item) => item)

            // console.log(data)
            return [...data]
          }
        }
      } catch (error) {
        if (error instanceof TRPCError) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Internal Server Error",
          });
        }
        console.log(error);
        return error;
      }
    }),
  getDocumentByCategoimport: protectedProcedure
    .input(
      z.object({
        categoryId: z.string(),
        subCategoryId: z.string(),
      })
    )
    .query(async ({ ctx, input }) => {
      try {
        const data = await ctx.prisma.document.findMany({
          where: {
            categoryId: input.categoryId,
            subCategoryId: input.subCategoryId,
          },
          include: {
            category: true,
            subCategory: true,
          },
        });
        return [...data];
      } catch (error) {
        if (error instanceof TRPCError) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Internal Server Error",
          });
        }
        console.log(error);
        return error;
      }
    }),
  searchDocs: protectedProcedure
    .input(z.string())
    .query(async ({ ctx, input }) => {
      try {
        if (input.length > 0) {
          const data = await ctx.prisma.document.findMany({
            where: {
              title: {
                contains: input,
                mode: "insensitive",
              },
            },
            include: {
              category: true,
              subCategory: true,
            },
          });
          return [...data];
        } else {
          return [];
        }
      } catch (error) {
        if (error instanceof TRPCError) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Internal Server Error",
          });
        }
        console.log(error);
        return error;
      }
    }),

  searchDocsByCategory: protectedProcedure
    .input(
      z.object({
        value: z.string(),
        categoryId: z.string(),
      })
    )
    .query(async ({ ctx, input }) => {
      try {
        if (input.value.length > 0) {
          const data = await ctx.prisma.document.findMany({
            where: {
              title: {
                contains: input.value,
                mode: "insensitive",
              },
              categoryId: input.categoryId,
            },
            include: {
              category: true,
              subCategory: true,
            },
          });
          return [...data];
        } else {
          return [];
        }
      } catch (error) {
        if (error instanceof TRPCError) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Internal Server Error",
          });
        }
        console.log(error);
        return error;
      }
    }),

  getDocData: protectedProcedure
    .input(
      z.object({
        docId: z.string(),
      })
    )
    .query(async ({ ctx, input }) => {
      const test = input.docId.split("?")[0];
      const res = await ctx.prisma.document.findUnique({
        where: {
          id: input.docId,
        },

        include: {
          highlights: {
            include: {
              boundingRectangle: true,
              rectangles: true,
            },
          },
          // messages: true,
        },
      });

      if (!res) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Document not found or you do not have access to it.",
        });
      }

      const highlightData = res.highlights.map((highlight) => ({
        id: highlight.id,
        position: {
          boundingRect: {
            id: highlight.boundingRectangle?.id,
            x1: highlight.boundingRectangle?.x1,
            y1: highlight.boundingRectangle?.y1,
            x2: highlight.boundingRectangle?.x2,
            y2: highlight.boundingRectangle?.y2,
            width: highlight.boundingRectangle?.width,
            height: highlight.boundingRectangle?.height,
            pageNumber: highlight.boundingRectangle?.pageNumber,
          },
          rects: highlight.rectangles.map((rect) => ({
            id: rect.id,
            x1: rect.x1,
            y1: rect.y1,
            x2: rect.x2,
            y2: rect.y2,
            width: rect.width,
            height: rect.height,
            pageNumber: rect.pageNumber,
          })),
          pageNumber: highlight.pageNumber,
        },
      }));

      return {
        id: res.id,
        title: res.title,
        highlights: highlightData!,
        // messages: res.messages,
        url: res.url,
        userPermissions: {
          canEdit: true,
        },
      };
    }),



  getUserDocData: protectedProcedure
    .input(
      z.object({
        userId: z.string(),
        documentId: z.string(),
      }),
    )
    .query(async ({ ctx, input }) => {
      try {
        const userDoc = await ctx.prisma.userDocument.findUnique({
          where: {
            userId_documentId: {
              userId: input.userId,
              documentId: input.documentId,
            },
          },
          include: {
            user: true,
            document: true,
          },
        });

        if (!userDoc) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'User document not found',
          });
        }

        return {
          userId: userDoc.userId,
          isVectorised: userDoc.isVectorised,
          documentId: userDoc.documentId,
          lastAccessed: userDoc.lastAccessed,
          user: userDoc.user,
          document: userDoc.document,
        };
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error; // re-throw the original error
        }
        console.error(error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'An unexpected error occurred',
        });
      }
    }),

  vectorise: protectedProcedure
    .input(
      z.object({
        documentId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const userId = ctx.session?.user.id;
        if (!userId) {
          throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "User ID is missing",
          });
        }

        const userDocs = await ctx.prisma.userDocument.findFirst({
          where: {
            userId: userId,
            documentId: input.documentId,
          },
        });

        if (userDocs && userDocs.isVectorised) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "User has already vectorised this document.",
          });
        }

        await ctx.prisma.userDocument.create({
          data: {
            userId: userId,
            documentId: input.documentId,
            isVectorised: true,
          },
        });
        return true;
      } catch (error: any) {
        getError(error, error?.message);
      }
    }),

  getPopularDocuments: protectedProcedure
    .query(async ({ ctx }) => {
      try {
        const popularDocuments = await ctx.prisma.userDocument.groupBy({
          by: ['documentId'],
          _count: {
            documentId: true,
          },
          orderBy: {
            _count: {
              documentId: 'desc',
            },
          },
          take: 10,
        });

        const documentDetails = await ctx.prisma.document.findMany({
          where: {
            id: {
              in: popularDocuments.map(doc => doc.documentId),
            },
          },
          include: {
            category: true,
            subCategory: true
          }
        });

        const result = popularDocuments.map(popularDoc => {
          const docDetail = documentDetails.find(doc => doc.id === popularDoc.documentId);
          return {
            documentId: popularDoc.documentId,
            accessCount: popularDoc._count.documentId,
            ...docDetail,
          };
        });

        return result;
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch popular documents',
          cause: error,
        });
      }
    }),
  getHistoryByUser: protectedProcedure.query(async ({ ctx, input }) => {

    const today = new Date();
    const yesterday = addDays(today, -1);

    const todayHistory = await ctx.prisma.userDocument.findMany({
      where: {
        userId: ctx.session?.user.id,
        lastAccessed: {
          gte: startOfDay(today),
          lte: endOfDay(today),
        },
      },
      include: {
        document: {
          include: {
            category: true,
            subCategory: true
          }
        }
      },
      orderBy: {
        lastAccessed: "desc"
      }
    });

    const yesterdayHistory = await ctx.prisma.userDocument.findMany({
      where: {
        userId: ctx.session?.user.id,
        lastAccessed: {
          gte: startOfDay(yesterday),
          lte: endOfDay(yesterday),
        },
      },
      include: {
        document: {
          include: {
            category: true,
            subCategory: true
          }
        }
      },
      orderBy: {
        lastAccessed: "desc"
      }
    });

    const lastAccessedHistory = await ctx.prisma.userDocument.findFirst({
      where: {
        userId: ctx.session?.user.id,
      },
      orderBy: {
        lastAccessed: 'desc',
      },
      include: {
        document: {
          include: {
            category: true,
            subCategory: true
          }
        }
      },
    });

    return {
      today: todayHistory,
      yesterday: yesterdayHistory,
      lastAccessed: lastAccessedHistory,
    };
  }),
  updateHistory: protectedProcedure
    .input(z.object({ documentId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session?.user.id;
      const documentId = input.documentId;

      if (!userId || !documentId) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "User ID or Document ID is missing.",
        });
      }

      await ctx.prisma.userDocument.update({
        where: {
          userId_documentId: {
            userId: userId,
            documentId: documentId,
          },
        },
        data: {
          lastAccessed: new Date(),
        },
      });
    }),
  getDocumentTotalPage: protectedProcedure.input(z.object({ docId: z.string() })).query(async ({ ctx, input }) => {
    const total = await ctx.prisma.embedding.count({
      where: {
        documentId: input.docId,
      }
    })
    return total;
  }),
  getDocumentInfo: protectedProcedure.query(async ({ ctx, input }) => {
    try {
      const totalDocument = await ctx.prisma.document.findMany({
        select: {
          id: true
        }
      })
      const category = await ctx.prisma.category.findMany({
        include: {
          Document: {
            select: {
              id: true
            }
          }
        }
      })
      const data = [
        {
          name: "Total Document",
          Document: totalDocument
        },
        ...category
      ]

      // const totalCategory = category.map(async (item) => {
      //   const totalDocument = await ctx.prisma.document.count({
      //     where: {
      //       categoryId: item.id
      //     }
      //   })
      //   return {
      //     total
      //   }
      // })
      return data
    } catch (error: any) {
      getError(error, error.message)
    }
  })

});

// Via download
// getDocumentText: protectedProcedure.input(z.object({
//   docId: z.string(),
// })).query(async ({ ctx, input }) => {
//   const content: any = await ctx.prisma.embedding.findFirst({
//     where: {
//       documentId: input.docId,
//       userId: ctx.session?.user.id,
//     }
//   });

//   const doc = await ctx.prisma.document.findUnique({
//     where: {
//       id: input.docId,
//     },
//     include: {
//       highlights: {
//         include: {
//           boundingRectangle: true,
//           rectangles: true,
//         },
//       },
//     },
//   });

//   if (!doc) {
//     throw new TRPCError({
//       code: "BAD_REQUEST",
//       message: "Dokumen tidak ditemukan.",
//     });
//   }
//   if (!content) {
//     throw new TRPCError({
//       code: "BAD_REQUEST",
//       message: "Konten tidak ditemukan.",
//     });
//   }

//   // Download PDF data from Supabase
//   const { data, error } = await supabase.storage
//     .from('pdf')
//     .download(doc.title);

//   if (error) {
//     throw new Error(`Failed to download PDF: ${error.message}`);
//   }

//   const pdfBuffer = await data.arrayBuffer();

//   // Load specific page using pdfjs-dist
//   const pdfDocument = await pdfjsLib.getDocument({ data: pdfBuffer }).promise;
//   const page = await pdfDocument.getPage(content.metadata.pageNumber);
//   const textContent = await page.getTextContent();

//   const { x1, y1, x2, y2 }: any = doc.highlights[0].boundingRectangle;
//   const extractedTexts: any = [];

//   // Extract text based on coordinates
//   textContent.items.forEach((item: any) => {
//     const { transform, str } = item;
//     const [, , x, y, width, height] = transform;
//     console.log(transform, str)

//     if (x >= x1 && x + width <= x2 && y >= y1 && y + height <= y2) {
//       extractedTexts.push(str);
//     }
//   });

//   return extractedTexts.join(' ');
// }),