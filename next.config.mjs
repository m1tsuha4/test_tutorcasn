/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async rewrites() {
    return [
      {
        source: '/beranda',
        destination: '/user/beranda',
      },
      {
        source: '/bahanAjar',
        destination: '/user/bahanAjar',
      },
      {
        source: '/bahanAjar/:path*',
        destination: '/user/bahanAjar/:path*',
      },
      {
        source: '/search',
        destination: '/user/search',
      },

    ]
  },
};

export default nextConfig;






