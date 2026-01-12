/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@docmaps/ui', '@docmaps/database', '@docmaps/config'],
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '*.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },
  webpack: (config, { isServer }) => {
    // Suppress the big strings warning - it's a known webpack cache issue
    // that doesn't affect runtime performance
    config.infrastructureLogging = {
      level: 'error',
    };
    return config;
  },
};

module.exports = nextConfig;
