import type { NextConfig } from "next";
import withPWA from "@ducanh2912/next-pwa";
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./src/i18n.ts');

const nextConfig: NextConfig = {
  // SVG configuration removed - Turbopack doesn't support @svgr/webpack
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
