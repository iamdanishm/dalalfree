import path from "path";

/** @type {import('next').NextConfig} */
const nextConfig = {
  poweredByHeader: false,
  reactStrictMode: true,

  // Allow access to external uploads directory
  webpack: (config, { isServer }) => {
    config.resolve.alias["@uploads"] = path.join(
      process.cwd(),
      "..",
      "dalalfree-uploads"
    );
    return config;
  },

  // Turbopack configuration (empty to silence warnings)
  turbopack: {},

  // Better caching for files
  async headers() {
    return [
      {
        source: "/api/files/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
