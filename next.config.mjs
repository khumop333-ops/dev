/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    dangerouslyAllowSVG: true,
    contentDispositionType: "attachment",
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    unoptimized: true,
  },
  experimental: {
    serverActions: {
      allowedOrigins: [
        "localhost:3000",
        "*.e2b.app",
        "*.vercel.app",
        "highveld-herbal.vercel.app",
        "highveld-herbal-khumo.vercel.app",
      ],
    },
  },
};

export default nextConfig;
