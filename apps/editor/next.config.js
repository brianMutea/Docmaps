/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@docmaps/ui', '@docmaps/database', '@docmaps/config'],
};

module.exports = nextConfig;
