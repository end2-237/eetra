/** @type {import('next').NextConfig} */

const supabaseHost = process.env.NEXT_PUBLIC_SUPABASE_URL
  ? new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).hostname
  : '*.supabase.co'

const securityHeaders = [
  { key: 'X-DNS-Prefetch-Control',  value: 'on'                          },
  { key: 'X-XSS-Protection',        value: '1; mode=block'               },
  { key: 'X-Frame-Options',         value: 'SAMEORIGIN'                  },
  { key: 'X-Content-Type-Options',  value: 'nosniff'                     },
  { key: 'Referrer-Policy',         value: 'strict-origin-when-cross-origin' },
  {
    key:   'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=()',
  },
  {
    key: 'Content-Security-Policy',
    value: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://fonts.googleapis.com",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com",
      "img-src 'self' data: blob: https://api.qrserver.com https://*.supabase.co",
      `connect-src 'self' https://api.anthropic.com https://*.supabase.co wss://*.supabase.co https://*.upstash.io https://www.monetbil.com`,
      "frame-src https://www.monetbil.com",
      "frame-ancestors 'none'",
    ].join('; '),
  },
]

const nextConfig = {
  reactStrictMode: true,

  typescript: { ignoreBuildErrors: true },
  eslint:     { ignoreDuringBuilds: true },

  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '*.supabase.co' },
      { protocol: 'https', hostname: 'api.qrserver.com' },
    ],
  },

  async headers() {
    return [{ source: '/(.*)', headers: securityHeaders }]
  },

  trailingSlash: false,
}

module.exports = nextConfig