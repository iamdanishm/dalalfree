/** @type {import('next').NextConfig} */
const nextConfig = {
  // Disable Turbopack to prevent fdprocessedid attributes
  // You can re-enable this later when the issue is resolved
  experimental: {
    // turbo: {
    //   rules: {},
    // },
  },
  poweredByHeader: false,
  // Add reactStrictMode to help with hydration issues
  reactStrictMode: true,
};

export default nextConfig;
