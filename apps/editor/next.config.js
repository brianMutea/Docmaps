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
    ],
  },
};

module.exports = nextConfig;
