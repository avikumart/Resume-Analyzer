/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
 
  // Proxy /api/* → backend on Vercel in production
  // In development, set NEXT_PUBLIC_API_URL in .env.local instead
  async rewrites() {
    const backendUrl = process.env.BACKEND_URL;
    if (!backendUrl) return [];
 
    return [
      {
        source: "/api/:path*",
        destination: `${backendUrl}/api/:path*`,
      },
    ];
  },
};
 
module.exports = nextConfig;
 