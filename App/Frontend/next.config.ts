import type { NextConfig } from 'next';

// ----------------------------------------------------------------------

const isStaticExport = false;

// ----------------------------------------------------------------------

const nextConfig: NextConfig = {
  trailingSlash: true,
  output: isStaticExport ? 'export' : undefined,
  env: {
    BUILD_STATIC_EXPORT: JSON.stringify(isStaticExport),
  },

  // ------------------------------------------------------------------
  // ✔ CORREÇÃO: allowedDevOrigins DEVE FICAR NA RAIZ, NÃO EM "experimental"
  // ------------------------------------------------------------------
  allowedDevOrigins: [
    "http://localhost:8082",
    "https://8082-firebase-gov-system-1764806218760.cluster-dwvm25yncracsxpd26rcd5ja3m.cloudworkstations.dev",
  ],

  // ------------------------------------------------------------------
  // Webpack
  // ------------------------------------------------------------------
  webpack(config) {
    config.module.rules.push({
      test: /\.svg$/,
      use: ['@svgr/webpack'],
    });

    return config;
  },

  // ------------------------------------------------------------------
  // Turbopack
  // ------------------------------------------------------------------
  turbopack: {
    rules: {
      '*.svg': {
        loaders: ['@svgr/webpack'],
        as: '*.js',
      },
    },
  },
};

export default nextConfig;
