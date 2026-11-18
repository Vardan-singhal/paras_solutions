import { loadFrontendEnv } from '../scripts/load-env.mjs';
loadFrontendEnv();
const backend = process.env.API_INTERNAL_URL || 'http://127.0.0.1:4000';
export default {
  poweredByHeader: false,
  images: {
    formats: ['image/avif', 'image/webp'],
    qualities: [75, 80, 85],
    remotePatterns:
      process.env.CLOUDINARY_PUBLIC_CLOUD_NAME &&
      /^[a-z0-9-]+$/.test(process.env.CLOUDINARY_PUBLIC_CLOUD_NAME)
        ? [
            {
              protocol: 'https',
              hostname: 'res.cloudinary.com',
              pathname: `/${process.env.CLOUDINARY_PUBLIC_CLOUD_NAME}/image/upload/**`,
            },
          ]
        : [],
  },
  async rewrites() {
    return [{ source: '/api/v1/:path*', destination: `${backend}/api/v1/:path*` }];
  },
  async redirects() {
    return [
      ['/quote', '/request-a-quote'],
      ['/manufacturing', '/manufacturing-process'],
      ['/quality', '/quality-assurance'],
      ['/products/duplex-boxes-monocartons', '/products/duplex-boxes'],
      ['/legal', '/privacy-policy'],
    ].map(([source, destination]) => ({ source, destination, permanent: true }));
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
        ],
      },
    ];
  },
};
