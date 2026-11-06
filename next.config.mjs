/** @type {import('next').NextConfig} */
const nextConfig = {
  // zevion.bond/support goes straight to the support server.
  async redirects() {
    const support = process.env.NEXT_PUBLIC_SUPPORT_URL || 'https://discord.gg/75WUGBKbd5'
    return [
      { source: '/support', destination: support, permanent: false },
      { source: '/discord', destination: support, permanent: false },
    ]
  },
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cdn.discordapp.com',
      },
    ],
  },
};

export default nextConfig;
