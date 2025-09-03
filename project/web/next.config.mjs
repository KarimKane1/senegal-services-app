/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb'
    }
  },
  // Completely disable static generation
  output: 'standalone',
  trailingSlash: false,
  generateBuildId: async () => {
    return 'build-' + Date.now()
  },
  distDir: '.next',
  swcMinify: true,
  skipTrailingSlashRedirect: true,
  skipMiddlewareUrlNormalize: true,
  images: {
    unoptimized: true
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  // Disable static optimization
  staticPageGenerationTimeout: 0,
};

export default nextConfig;
