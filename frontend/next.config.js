/** @type {import('next').NextConfig} */
const backendUrl = process.env.BACKEND_URL?.replace(/\/$/, "") || "";

const nextConfig = {
  reactStrictMode: true,

  // This value is display-only. Requests still use the same-origin /api proxy.
  // Showing it in the UI makes the active frontend → backend route verifiable.
  env: {
    NEXT_PUBLIC_BACKEND_DISPLAY_URL: backendUrl,
  },
 
  // Proxy /api/* to the backend in every environment. BACKEND_URL remains
  // server-only so browsers always communicate through the frontend origin.
  async rewrites() {
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
