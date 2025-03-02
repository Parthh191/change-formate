/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone', // Optimize for Docker deployments
  eslint: {
    // Only run ESLint on build to prevent failing on unresolved issues during development
    ignoreDuringBuilds: process.env.NODE_ENV === 'development',
  },
  typescript: {
    // Only check TypeScript when needed, not during hot-reloads
    ignoreBuildErrors: process.env.NODE_ENV === 'development',
  }
  // Removed the experimental.esmExternals option that was causing issues with Turbopack
}

module.exports = nextConfig
