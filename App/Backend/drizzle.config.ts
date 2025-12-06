import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  dialect: 'sqlite', // O D1 do Cloudflare usa uma API compatível com SQLite
  schema: './worker/src/db/schema.ts', // Caminho para o nosso schema
  out: './worker/migrations', // Pasta onde as migrações SQL serão salvas
  driver: 'd1',
  dbCredentials: {
    wranglerConfigPath: './wrangler.toml', // Aponta para a config do Worker
    dbName: 'Gov-System-DB', // Nome do binding do D1 no wrangler.toml
  },
});
