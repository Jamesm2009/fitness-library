/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'static.exercisedb.dev',
        pathname: '/media/**',
      },
      {
        protocol: 'https',
        hostname: 'raw.githubusercontent.com',
        pathname: '/hasaneyldrm/exercises-dataset/**',
      },
    ],
  },
};

module.exports = nextConfig;
