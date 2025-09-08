/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  reactStrictMode: true,
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    domains: ["assets.co.dev", "images.unsplash.com"],
  },
  webpack: (config, context) => {
    config.optimization.minimize = process.env.NEXT_PUBLIC_CO_DEV_ENV !== "preview";
    return config;
  },
  env: {
    NEXT_PUBLIC_CO_DEV_ENV: process.env.VERCEL_ENV === 'preview' ? 'mock' : process.env.NEXT_PUBLIC_CO_DEV_ENV,
  },
};

export default nextConfig;
