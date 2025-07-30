import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // Fixes npm packages that depend on `fs` module
      config.resolve.fallback = {
        ...config.resolve.fallback,
        encoding: false,
      };
    }

    return config;
  },
  experimental: {},
  images: {
    remotePatterns: [
      {
        hostname: 'avatar.vercel.sh',
      },
      {
        hostname: 'tokens.1inch.io',
      },
      {
        hostname: 'token.1inch.io',
      },
    ],
  },
};

export default nextConfig;
