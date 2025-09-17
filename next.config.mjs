/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: true,
  },
  images: {
    domains: ['cdn.simpleicons.org', 'localhost', 'paddle-billing.vercel.app'],
  },
};

export default nextConfig;
