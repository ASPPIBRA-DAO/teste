import type { NextConfig } from 'next';
import path from 'path';

// ----------------------------------------------------------------------

const isStaticExport = false;

// ----------------------------------------------------------------------
// CONFIGURAÇÃO DE SEGURANÇA (CSP)
// ----------------------------------------------------------------------
// 1. script-src: Permite 'unsafe-eval' para o React DevTools/Hot Reload funcionar.
// 2. connect-src: Permite o frontend (8082) falar com o backend (8787).
// ----------------------------------------------------------------------
const cspHeader = `
    default-src 'self';
    script-src 'self' 'unsafe-eval' 'unsafe-inline' https:;
    style-src 'self' 'unsafe-inline' https:;
    img-src 'self' blob: data: https:;
    font-src 'self' data: https:;
    connect-src 'self' http://localhost:8787 http://127.0.0.1:8787 https://asppibra.com;
    object-src 'none';
    base-uri 'self';
    form-action 'self';
    frame-ancestors 'none';
    upgrade-insecure-requests;
`;

const nextConfig: NextConfig = {
  trailingSlash: true,
  output: isStaticExport ? 'export' : undefined,
  env: {
    BUILD_STATIC_EXPORT: JSON.stringify(isStaticExport),
  },

  // ✅ CORREÇÃO 1: Mantendo outputFileTracingRoot na raiz
  outputFileTracingRoot: path.join(__dirname, '../../'),

  // Deixando 'experimental' vazio
  experimental: {},

  // ------------------------------------------------------------------
  // allowedDevOrigins
  // ------------------------------------------------------------------
  allowedDevOrigins: [
    "http://localhost:8082",
    "https://8082-firebase-gov-system-1764806218760.cluster-dwvm25yncracsxpd26rcd5ja3m.cloudworkstations.dev",
  ],

  // ------------------------------------------------------------------
  // Injeção dos Headers de Segurança
  // ------------------------------------------------------------------
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: cspHeader.replace(/\n/g, ''),
          },
        ],
      },
    ];
  },

  // ------------------------------------------------------------------
  // Webpack
  // ------------------------------------------------------------------
  webpack(config) {
    // 👇 SOLUÇÃO FORÇADA: Adiciona o alias 'src' diretamente ao Webpack
    config.resolve.alias = {
      ...(config.resolve.alias || {}),
      'src': path.join(__dirname, 'src'), // Mapeia 'src' para o caminho real: App/Frontend/src
    };
    
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