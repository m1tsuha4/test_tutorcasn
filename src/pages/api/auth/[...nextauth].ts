// Mengimpor modul NextAuth yang digunakan untuk autentikasi di aplikasi Next.js
import NextAuth from "next-auth";

// Mengimpor konfigurasi autentikasi yang telah ditentukan di direktori 'servers/auth'
import { authOptions } from "@/servers/auth";

export default NextAuth(authOptions);
