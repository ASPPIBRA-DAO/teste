import { paths } from 'src/routes/paths';

import packageJson from '../package.json';

// ----------------------------------------------------------------------

export type ConfigValue = {
  appName: string;
  appVersion: string;
  serverUrl: string;
  assetsDir: string;
  isStaticExport: boolean;
  auth: {
    method: 'jwt' | 'supabase';
    skip: boolean;
    redirectPath: string;
  };
  supabase: { url: string; key: string };
};

// ----------------------------------------------------------------------

export const CONFIG: ConfigValue = {
  appName: 'Gov-System',
  appVersion: packageJson.version,

  // 🔧 AJUSTE DE SEGURANÇA:
  // Usa || em vez de ?? para garantir que strings vazias sejam ignoradas
  // e o fallback localhost:8787 seja usado em desenvolvimento local se necessário.
  serverUrl: process.env.NEXT_PUBLIC_HOST_API || 'http://localhost:8787',

  assetsDir: process.env.NEXT_PUBLIC_ASSETS_DIR ?? '',
  isStaticExport: JSON.parse(process.env.BUILD_STATIC_EXPORT ?? 'false'),

  /**
   * Auth
   * @method jwt | supabase
   */
  auth: {
    method: 'jwt',
    skip: false,
    redirectPath: paths.dashboard.root,
  },

  /**
   * Supabase
   * (Mantido caso você decida usar o Storage ou DB direto do front no futuro)
   */
  supabase: {
    url: process.env.NEXT_PUBLIC_SUPABASE_URL ?? '',
    key: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '',
  },
};