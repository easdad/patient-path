/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    domains: [],
  },
  experimental: {
    appDir: true,
    serverActions: true
  },
  output: 'standalone',
}

module.exports = nextConfig 