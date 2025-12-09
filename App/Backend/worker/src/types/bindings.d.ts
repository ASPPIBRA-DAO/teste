import { D1Database, R2Bucket } from "@cloudflare/workers-types";

export type Bindings = {
  // Conecta com o "d1_databases" do wrangler.jsonc
  DB: D1Database;

  // Conecta com o "r2_buckets" do wrangler.jsonc
  ASSETS: R2Bucket;

  // Adiciona as variáveis de ambiente do Cloudflare
  CLOUDFLARE_ACCOUNT_ID: string;
  CLOUDFLARE_ZONE_ID: string;
  CLOUDFLARE_API_TOKEN: string;
};