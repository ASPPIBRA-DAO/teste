import { Hono } from 'hono';
import { cors } from 'hono/cors';
// ⚠️ ServeStatic REMOVIDO para evitar erros (Wrangler cuida disso)
import { Bindings } from './types/bindings';
import { createDb, Database } from './db';
import { success, error } from './utils/response';
import userRoutes from './routes/users';
import authRoutes from './routes/auth';
import postRoutes from './routes/posts';
// 🆕 IMPORTAÇÃO DO TEMPLATE (Separamos a View)
import { DashboardTemplate } from './views/dashboard';

type Variables = {
  db: Database;
};

type AppType = {
  Bindings: Bindings;
  Variables: Variables;
};

const app = new Hono<AppType>();

// --- 1. Configuração de CORS ---
app.use('/*', cors({
  origin: (origin) => {
    const allowedOrigins = [
      'http://localhost:8082', 'http://localhost:3000', 'http://127.0.0.1:8082',
      'https://asppibra.com', 'https://www.asppibra.com', 'https://api.asppibra.com'
    ];
    if (origin && (origin.includes('localhost') || origin.includes('cloudworkstations.dev'))) return origin;
    if (allowedOrigins.includes(origin)) return origin;
    return origin;
  },
  allowHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  allowMethods: ['POST', 'GET', 'OPTIONS', 'PUT', 'DELETE'],
  exposeHeaders: ['Content-Length'],
  maxAge: 600,
  credentials: true,
}));

// --- 2. Middleware de Banco de Dados ---
app.use(async (c, next) => {
  try {
    const db = createDb(c.env.DB);
    c.set('db', db);
    await next();
  } catch (e) {
    return error(c, 'Erro interno ao conectar no banco de dados', null, 500);
  }
});

// --- 3. ROTA DE DADOS: Monitoramento ---
app.get('/monitoring', async (c) => {
  const accountId = c.env.CLOUDFLARE_ACCOUNT_ID;
  const zoneId = c.env.CLOUDFLARE_ZONE_ID;
  const apiToken = c.env.CLOUDFLARE_API_TOKEN;

  if (!accountId || !zoneId || !apiToken) {
    return c.json({ error: 'Configuração incompleta' }, 500);
  }

  // --- CORREÇÃO DE TEMPO ---
  const now = new Date();
  const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const isoStart = oneDayAgo.toISOString();
  const isoEnd = now.toISOString();
  const dateStart = isoStart.split('T')[0];

  const query = `
    query {
      viewer {
        accounts(filter: { accountTag: "${accountId}" }) {
          d1: d1AnalyticsAdaptiveGroups(limit: 1, filter: { date_geq: "${dateStart}" }) {
            sum { readQueries, writeQueries }
          }
        }
        zones(filter: { zoneTag: "${zoneId}" }) {
          traffic: httpRequestsAdaptiveGroups(limit: 1, filter: { datetime_geq: "${isoStart}", datetime_lt: "${isoEnd}" }) {
            count
            sum { edgeResponseBytes }
          }
          cache: httpRequestsAdaptiveGroups(limit: 5, filter: { datetime_geq: "${isoStart}", datetime_lt: "${isoEnd}" }, orderBy: [count_DESC]) {
            count
            dimensions { cacheStatus }
          }
          countries: httpRequestsAdaptiveGroups(limit: 5, filter: { datetime_geq: "${isoStart}", datetime_lt: "${isoEnd}" }, orderBy: [count_DESC]) {
            count
            dimensions { clientCountryName }
          }
        }
      }
    }
  `;

  try {
    const cfResponse = await fetch('https://api.cloudflare.com/client/v4/graphql', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiToken}` },
      body: JSON.stringify({ query })
    });

    const cfData: any = await cfResponse.json();

    if (cfData.errors) {
      console.error("Erro Cloudflare Detalhado:", JSON.stringify(cfData.errors, null, 2));
      return c.json({ error: 'Erro API Cloudflare', details: cfData.errors }, 500);
    }

    const zoneData = cfData?.data?.viewer?.zones?.[0] || {};
    const accountData = cfData?.data?.viewer?.accounts?.[0] || {};
    const trafficRaw = zoneData.traffic?.[0] || { count: 0, sum: { edgeResponseBytes: 0 } };
    const dbMetrics = accountData.d1?.[0]?.sum || { readQueries: 0, writeQueries: 0 };
    const cacheRaw = zoneData.cache || [];
    const totalCacheReqs = cacheRaw.reduce((acc: number, item: any) => acc + item.count, 0);
    const hits = cacheRaw.find((i: any) => ['hit', 'revalidated'].includes(i.dimensions.cacheStatus))?.count || 0;
    const cacheRatio = totalCacheReqs > 0 ? ((hits / totalCacheReqs) * 100).toFixed(0) : "0";

    const countries = (zoneData.countries || []).map((item: any) => ({
      code: item.dimensions.clientCountryName,
      count: item.count
    }));

    return c.json({
      requests: trafficRaw.count,
      bytes: trafficRaw.sum.edgeResponseBytes,
      cacheRatio: cacheRatio,
      dbReads: dbMetrics.readQueries,
      dbWrites: dbMetrics.writeQueries,
      countries: countries
    });

  } catch (e: any) {
    console.error("Monitoring Exception:", e.message);
    return c.json({ error: 'Falha interna', msg: e.message }, 500);
  }
});

// --- 4. ROTA VISUAL (Refatorada) ---
app.get('/', (c) => {
  const domain = "https://api.asppibra.com";

  // Prepara os dados para o Template
  const dashboardData = {
    version: "1.0.6",
    service: "Core API",
    cacheRatio: "--%",
    domain: domain,
    // Garante que a imagem está na pasta public e é acessível
    imageUrl: `${domain}/social-preview.png`
  };

  // Renderiza usando o arquivo separado
  return c.html(DashboardTemplate(dashboardData));
});

app.get('/health-db', async (c) => {
  const db = c.get('db');
  return success(c, { status: 'ok', message: 'DB Connected' }, 'DB Check');
});

app.route('/users', userRoutes);
app.route('/auth', authRoutes);
app.route('/post', postRoutes);

export default app;