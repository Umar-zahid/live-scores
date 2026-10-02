/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  poweredByHeader: false,
  productionBrowserSourceMaps: false,
  images: { unoptimized: true },
  eslint: {
    ignoreDuringBuilds: true,
  },
  experimental: {
    cpus: 1,
    workerThreads: false,
    serverComponentsExternalPackages: ['@modelcontextprotocol/sdk'],
  },
};

export default nextConfig;
