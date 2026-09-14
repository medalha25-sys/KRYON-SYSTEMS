const withPWA = require('next-pwa')({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development'
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  turbopack: {},
  typescript: {
    ignoreBuildErrors: true,
  },
  experimental: {
    turbopackUseSystemTlsCerts: true,
    // missingSuspenseWithCSRBailout: false,
  },
};

module.exports = withPWA(nextConfig);
