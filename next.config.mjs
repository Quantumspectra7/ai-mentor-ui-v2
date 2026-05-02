/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  // Keep heavy binary libs out of the webpack/turbopack bundle
  serverExternalPackages: ['pdf-parse', 'mammoth', 'adm-zip'],
}

export default nextConfig
