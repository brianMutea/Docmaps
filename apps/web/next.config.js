/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@docmaps/ui', '@docmaps/database', '@docmaps/config', 'next-mdx-remote'],
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'gunercosxlagxvnbyvod.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
      {
        protocol: 'https',
        hostname: '**.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
    ],
    // Optimize images for blog posts
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
  // Enable experimental optimizations
  experimental: {
    optimizePackageImports: ['lucide-react', '@docmaps/ui'],
    esmExternals: 'loose', // Allow ESM packages to be bundled
  },
  webpack: (config, { isServer }) => {
    config.infrastructureLogging = {
      level: 'error',
    };
    
    // Fix for shiki ESM resolution issues in monorepo
    if (isServer) {
      config.resolve.alias = {
        ...config.resolve.alias,
        'shiki': require.resolve('shiki'),
      };
    }
    
    return config;
  },
};

module.exports = nextConfig;
