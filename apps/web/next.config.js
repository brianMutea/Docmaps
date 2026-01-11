/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@docmaps/ui', '@docmaps/database', '@docmaps/config'],
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
