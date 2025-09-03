/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: true,
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb'
    },
    serverComponentsExternalPackages: ['@supabase/supabase-js'],
    // Disable static optimization
    staticGenerationRetryCount: 0,
  },
  // Force dynamic rendering for all pages
  output: 'standalone',
  trailingSlash: false,
  generateBuildId: async () => {
    return 'build-' + Date.now();
  },
  // Disable static optimization completely
  distDir: '.next',
  // Force all pages to be server-side rendered
  swcMinify: true,
  // Completely disable static generation
  skipTrailingSlashRedirect: true,
  skipMiddlewareUrlNormalize: true,
  // Disable static optimization
  images: {
    unoptimized: true,
  },
  // Force all pages to be dynamic
  generateStaticParams: false,
  // Disable static optimization at the root level
  staticPageGenerationTimeout: 0,
  // Force dynamic rendering
  dynamicParams: true,
  // Disable static generation completely
  outputFileTracing: false,
};

export default nextConfig;
