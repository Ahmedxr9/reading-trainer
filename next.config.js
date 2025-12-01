const createNextIntlPlugin = require('next-intl/plugin');

const withNextIntl = createNextIntlPlugin('./i18n/request.ts');

/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      // Fix for transformers.js
      "sharp$": false,
      "onnxruntime-node$": false,
    };
    return config;
  },
  // Enable experimental features for transformers.js
  experimental: {
    serverComponentsExternalPackages: ['@xenova/transformers'],
  },
};

module.exports = withNextIntl(nextConfig);


