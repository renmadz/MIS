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
      // pdfjs-dist ships true ESM; forcing it to 'javascript/auto' breaks its
      // module interop ("Object.defineProperty called on non-object"), so exclude it.
      exclude: /pdfjs-dist/,
      type: 'javascript/auto',
    });
    // pdfjs-dist optionally requires the Node-only 'canvas' package; stub it out
    // for the browser bundle so the client-side viewer builds cleanly.
    config.resolve.alias = { ...config.resolve.alias, canvas: false };
    return config;
  },
};

export default nextConfig;