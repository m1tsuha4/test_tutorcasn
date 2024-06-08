/**
 * Ini adalah entrypoint di sisi klien untuk API tRPC . Digunakan untuk membuat objek `api`
 * yang berisi pembungkus Aplikasi Next.js, serta hook React Query yang aman secara tipe.
 
 */
import { httpBatchLink, loggerLink } from "@trpc/client";
import { createTRPCNext } from "@trpc/next";
import { type inferRouterInputs } from "@trpc/server";
import superjson from "superjson";

import { type AppRouter } from "@/servers/api/root";

const getBaseUrl = () => {
  if (typeof window !== "undefined") return ""; // browser harus menggunakan URL relatif
  //if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`; // SSR harus menggunakan URL Vercel
  return `http://localhost:${process.env.PORT ?? 3000}`; // SSR dev harus menggunakan localhost
};

/** Sekumpulan hook React Query yang aman secara tipe untuk API tRPC . */
export const api = createTRPCNext<AppRouter>({
  config() {
    return {
      /**
       * Transformer yang digunakan untuk deserialisasi data dari server.
       *
       * @see https://trpc.io/docs/data-transformers
       */
      transformer: superjson,

      /**
       * Link yang digunakan untuk menentukan alur permintaan dari klien ke server.
       *
       * @see https://trpc.io/docs/links
       */
      links: [
        loggerLink({
          enabled: (opts) =>
            process.env.NODE_ENV === "development" ||
            (opts.direction === "down" && opts.result instanceof Error),
        }),
        httpBatchLink({
          url: `${getBaseUrl()}/api/trpc`,
        }),
      ],
    };
  },
  /**
   * Apakah tRPC harus menunggu query saat rendering server halaman.
   *
   * @see https://trpc.io/docs/nextjs#ssr-boolean-default-false
   */
  ssr: false,
});

/**
 * Pembantu inferensi untuk input.
 *
 * @example type HelloInput = RouterInputs['example']['hello']
 */
export type RouterInputs = inferRouterInputs<AppRouter>;
