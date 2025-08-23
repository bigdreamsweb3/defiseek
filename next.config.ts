import type { NextConfig } from 'next';
import { createCivicAuthPlugin } from '@civic/auth/nextjs';

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

const withCivicAuth = createCivicAuthPlugin({
  clientId: '03cdd59c-481d-46dc-adf4-d42f1d6b7c0c',
  loginUrl: '/login',
});

export default withCivicAuth(nextConfig);
