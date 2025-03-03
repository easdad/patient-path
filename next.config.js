/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    unoptimized: true,
    domains: [],
  },
  output: 'export',
  experimental: {
    appDir: true,
  },
  // Remove server actions since they won't work in static export
  // experimental: {
  //   serverActions: true
  // },
}

module.exports = nextConfig 