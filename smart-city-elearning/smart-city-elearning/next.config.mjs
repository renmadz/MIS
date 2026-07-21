/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  // pdfkit reads its .afm font metrics from disk relative to its own location.
  // Bundling it into vendor-chunks/ breaks that path, so load it from node_modules.
  serverExternalPackages: ['pdfkit'],
  images: {
    unoptimized: true,
  },
  webpack(config) {
    config.experiments = { ...config.experiments, topLevelAwait: true };
    config.module.rules.push({
      test: /\.mjs$/,
      include: /node_modules/,
      type: 'javascript/auto',
    });
    return config;
  },
};

export default nextConfig;