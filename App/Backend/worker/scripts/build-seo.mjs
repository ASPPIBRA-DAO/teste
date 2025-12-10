
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// --- CONFIGURAÇÃO DE AMBIENTE (ES Modules) ---
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// =========================================================
// 1. CONFIGURAÇÕES
// =========================================================
const CONFIG = {
  domain: process.env.PUBLIC_URL || "https://api.asppibra.com",
  appName: "ASPPIBRA Governance",
  appShortName: "ASPPIBRA",
  appDescription: "Sistema de Governança e Monitoramento de API em Tempo Real.",
  themeColor: "#1A1A2E",
  backgroundColor: "#1A1A2E",
  
  // Caminhos Relativos (Script está em /scripts -> sobe um e entra em public)
  publicDir: path.join(__dirname, "../public"),
  routesDir: path.join(__dirname, "../src/routes"), 
};

// Páginas Fixas (Sempre existem)
const FIXED_PAGES = [
  { url: "/", priority: "1.0", freq: "always" },
];

// =========================================================
// 2. DETECÇÃO AUTOMÁTICA DE ROTAS (Nível NASA 🚀)
// =========================================================
function getDynamicRoutes() {
  const routes = [];
  
  if (fs.existsSync(CONFIG.routesDir)) {
    console.log(`🔎 Escaneando rotas em: ${CONFIG.routesDir}`);
    const files = fs.readdirSync(CONFIG.routesDir);
    
    files.forEach(file => {
      if (file.endsWith('.ts') || file.endsWith('.js')) {
        // Ex: "users.ts" vira "/users"
        const routeName = file.replace(/\.(ts|js)$/, "");
        // Ignora arquivos de sistema/index se houver
        if (routeName !== "index") {
          routes.push({ 
            url: `/${routeName}`, 
            priority: "0.8", 
            freq: "daily" 
          });
          console.log(`   + Rota detectada: /${routeName}`);
        }
      }
    });
  } else {
    console.warn(`⚠️  Diretório de rotas não encontrado: ${CONFIG.routesDir}`);
  }
  
  return routes;
}

// =========================================================
// 3. GERADORES DE CONTEÚDO
// =========================================================

const getRobotsTxt = () => `# https://www.robotstxt.org/robotstxt.html
User-agent: *
Allow: /
Allow: /site.webmanifest
Allow: /favicon.ico

# Segurança: Rotas Sensíveis
Disallow: /monitoring
Disallow: /health-db

# Arquivos de Sistema
Disallow: /wrangler.toml
Disallow: /package.json
Disallow: *.ts

Sitemap: ${CONFIG.domain}/sitemap.xml
`;

const getManifest = () => ({
  name: CONFIG.appName,
  short_name: CONFIG.appShortName,
  description: CONFIG.appDescription,
  start_url: "/",
  display: "standalone",
  orientation: "portrait",
  background_color: CONFIG.backgroundColor,
  theme_color: CONFIG.themeColor,
  icons: [
    { src: "/android-chrome-192x192.png", sizes: "192x192", type: "image/png" },
    { src: "/android-chrome-512x512.png", sizes: "512x512", type: "image/png" }
  ],
  categories: ["productivity", "utilities", "governance"]
});

// =========================================================
// 4. EXECUÇÃO
// =========================================================

console.log(`\n🚀 INICIANDO SEO BUILDER [${CONFIG.appName}]`);

try {
  // 1. Prepara Diretório
  if (!fs.existsSync(CONFIG.publicDir)) {
    fs.mkdirSync(CONFIG.publicDir, { recursive: true });
  }

  // 2. Robots.txt
  fs.writeFileSync(path.join(CONFIG.publicDir, "robots.txt"), getRobotsTxt());
  console.log("   ✅ Robots.txt gerado");

  // 3. Manifest.json
  fs.writeFileSync(
    path.join(CONFIG.publicDir, "site.webmanifest"), 
    JSON.stringify(getManifest(), null, 2)
  );
  console.log("   ✅ Manifest PWA gerado");

  // 4. Sitemap.xml (Com rotas dinâmicas)
  const today = new Date().toISOString().split("T")[0];
  const allPages = [...FIXED_PAGES, ...getDynamicRoutes()];
  
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allPages.map(p => `  <url>
    <loc>${CONFIG.domain}${p.url}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${p.freq}</changefreq>
    <priority>${p.priority}</priority>
  </url>`).join("\n")}
</urlset>`;
  
  fs.writeFileSync(path.join(CONFIG.publicDir, "sitemap.xml"), sitemap);
  console.log(`   ✅ Sitemap XML gerado com ${allPages.length} URLs`);

} catch (e) {
  console.error("\n❌ ERRO FATAL NO BUILD:", e);
  process.exit(1);
}

// =========================================================
// 5. AUDITORIA FINAL
// =========================================================
console.log("\n🔍 Auditando Integridade...");
const requiredFiles = [
  "android-chrome-192x192.png",
  "android-chrome-512x512.png",
  "favicon.ico",
  "social-preview.png"
];

let missing = 0;
requiredFiles.forEach(file => {
  if (!fs.existsSync(path.join(CONFIG.publicDir, file))) {
    console.error(`   ❌ [FALHA] Faltando imagem: ${file}`);
    missing++;
  } else {
    console.log(`   ok: ${file}`);
  }
});

if (missing > 0) {
  console.error(`\n⚠️  ATENÇÃO: ${missing} assets vitais estão faltando!`);
  // process.exit(1); // Descomente para bloquear deploy se faltar ícone
} else {
  console.log("\n✨ SUCESSO TOTAL. Sistema pronto para deploy.\n");
}
