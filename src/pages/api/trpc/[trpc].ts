// Mengimpor fungsi pembuat handler API dari adapter tRPC untuk Next.js
import { createNextApiHandler } from "@trpc/server/adapters/next";

// Mengimpor appRouter yang mendefinisikan semua router tRPC dari direktori 'servers/api/root'
import { appRouter } from "@/servers/api/root";

// Mengimpor konfigurasi environment dari file konfigurasi environment
import { env } from "@/env.mjs";

// Mengimpor fungsi untuk membuat konteks tRPC dari 'servers/api/trpc'
import { createTRPCContext } from "@/servers/api/trpc";

// Menentukan default export untuk file ini sebagai handler API yang dihasilkan oleh tRPC
export default createNextApiHandler({
  // Menetapkan router yang digunakan oleh handler API ini
  router: appRouter,
  
  // Menetapkan fungsi pembuat konteks yang akan digunakan untuk setiap request yang diterima oleh router
  createContext: createTRPCContext,
  
  // Konfigurasi perilaku ketika terjadi error pada saat produksi
  onError:
    env.NODE_ENV === "production"
      ? ({ path, error }) => {
          // Menampilkan pesan error ke konsol jika aplikasi berada dalam lingkungan produksi
          console.error(
            `❌ tRPC failed on ${path ?? "<no-path>"}: ${error.message}`
          );
        }
      : undefined, // Jika tidak dalam produksi, tidak melakukan tindakan khusus ketika error
});
