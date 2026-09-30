/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  poweredByHeader: false,
  productionBrowserSourceMaps: false,
  images: { unoptimized: true },
  experimental: {
    cpus: 1,
    workerThreads: false,
  },
};

export default nextConfig;
