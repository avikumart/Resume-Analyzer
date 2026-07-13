/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
 
  // Proxy /api/* to the backend in every environment. BACKEND_URL remains
  // server-only so browsers always communicate through the frontend origin.
  async rewrites() {
    const backendUrl = process.env.BACKEND_URL?.replace(/\/$/, "");
    if (!backendUrl) {
      if (process.env.VERCEL_ENV === "production") {
        throw new Error("BACKEND_URL must be set for the production frontend deployment");
      }
      return [];
    }
 
    return [
      {
        source: "/api/:path*",
        destination: `${backendUrl}/api/:path*`,
      },
    ];
  },
};

module.exports = nextConfig;
