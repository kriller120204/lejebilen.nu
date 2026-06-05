import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
      {
        protocol: 'https',
        hostname: 'placehold.co',
      },
    ],
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 300,        // 5 min — opdaterede billeder vises hurtigt
    deviceSizes: [640, 1080, 1920],
    imageSizes: [96, 256, 512],
  },
}

export default nextConfig
