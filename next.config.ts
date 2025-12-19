import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  compress: true,
  images: {
    formats: ['image/avif', 'image/webp'],
  },
  turbopack: {
    resolveExtensions: ['.ts', '.tsx', '.js', '.jsx'],
  },
  serverExternalPackages: [
    'fluent-ffmpeg',
    '@ffmpeg-installer/ffmpeg',
    '@ffprobe-installer/ffprobe',
    'canvas'
  ],
  allowedDevOrigins: [
    'https://*.replit.dev',
    'https://*.repl.co',
    'https://*.riker.replit.dev',
  ],
};

export default nextConfig;
