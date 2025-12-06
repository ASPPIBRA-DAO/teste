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
    method: 'jwt' | 'supabase'; // Deixei Supabase como opção futura
    skip: boolean;
    redirectPath: string;
  };
  supabase: { url: string; key: string };
};

// ----------------------------------------------------------------------

export const CONFIG: ConfigValue = {
  appName: 'Gov-System', // ✅ Atualizado
  appVersion: packageJson.version,
  
  // ✅ Ponto Crucial: Essa variável deve apontar para o seu Cloudflare Worker
  serverUrl: process.env.NEXT_PUBLIC_HOST_API ?? '', 
  
  assetsDir: process.env.NEXT_PUBLIC_ASSETS_DIR ?? '',
  isStaticExport: JSON.parse(process.env.BUILD_STATIC_EXPORT ?? 'false'),
  
  /**
   * Auth
   * @method jwt | supabase
   */
  auth: {
    method: 'jwt', // ✅ Mantém 'jwt' pois seu action.ts usa axios manual
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