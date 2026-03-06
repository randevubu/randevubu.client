import type { NextConfig } from "next";
import withPWA from "@ducanh2912/next-pwa";
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./src/i18n.ts');

// Build hash is injected directly into SW by inject-build-hash.js script
// This ensures automatic cache busting on each deployment
// No need to set it via env - the build script handles it

const nextConfig: NextConfig = {
  // SVG configuration removed - Turbopack doesn't support @svgr/webpack
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
    ],
  },
  output: "standalone",
};

export default withNextIntl(
  withPWA({
    dest: "public",
    disable: process.env.NODE_ENV === "development",
    workboxOptions: {
      swSrc: "public/sw-custom.js",
      swDest: "public/sw.js",
    },
  })(nextConfig)
);
