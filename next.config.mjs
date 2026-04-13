/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  // Add server configuration for Render
  serverRuntimeConfig: {
    port: process.env.PORT || 10000,
  },
};

export default nextConfig;
