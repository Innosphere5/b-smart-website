/** @type {import('next').NextConfig} */
const nextConfig = {
  // Allow Cloudinary, Unsplash, and Supabase images in next/image
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: '*.supabase.co',
      },
    ],
  },

  // Proxy /api/realtime/stream to the Express backend for SSE (Server-Sent Events)
  // This allows the client-side EventSource to connect via the same domain
  async rewrites() {
    const expressBackend = process.env.EXPRESS_BACKEND_URL || 'https://admin-app-backend-i5tk.onrender.com';
    return [
      {
        source: '/api/realtime/stream',
        destination: `${expressBackend.replace(/\/+$/, '')}/api/realtime/stream`,
      },
    ];
  },

  // Production security headers
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'origin-when-cross-origin' },
        ],
      },
      {
        // Allow CORS for API routes (needed for mobile app or cross-origin consumers)
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET, POST, PUT, DELETE, OPTIONS' },
          { key: 'Access-Control-Allow-Headers', value: 'Content-Type, Authorization' },
        ],
      },
    ];
  },
};

export default nextConfig;
