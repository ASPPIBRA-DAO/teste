import { Hono } from 'hono';
import { html } from 'hono/html';
import { cors } from 'hono/cors';
import { Bindings } from './types/bindings';
import { createDb, Database } from './db';
import { success, error } from './utils/response';
import userRoutes from './routes/users';
import authRoutes from './routes/auth';
import postRoutes from './routes/posts';

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

  const today = new Date().toISOString().split('T')[0];

  const query = `
    query {
      viewer {
        accounts(filter: { accountTag: "${accountId}" }) {
          d1AnalyticsAdaptiveGroups(limit: 1, filter: { date_geq: "${today}" }) {
            sum { readQueries, writeQueries }
          }
        }
        zones(filter: { zoneTag: "${zoneId}" }) {
          httpRequestsAdaptiveGroups(limit: 5, filter: { date_geq: "${today}" }, orderBy: [count_DESC]) {
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

    const dbMetrics = cfData?.data?.viewer?.accounts?.[0]?.d1AnalyticsAdaptiveGroups?.[0]?.sum || { readQueries: 0, writeQueries: 0 };
    const rawCountries = cfData?.data?.viewer?.zones?.[0]?.httpRequestsAdaptiveGroups || [];

    const countries = rawCountries.map((item: any) => ({
      code: item.dimensions.clientCountryName,
      count: item.count
    }));

    return c.json({ db: dbMetrics, countries });
  } catch (e) {
    console.error("Monitoring Error:", e);
    return c.json({ error: 'Failed to fetch metrics' }, 500);
  }
});

// --- 4. ROTA VISUAL: Dashboard HTML ---
app.get('/', (c) => {
  const statusInfo = {
    status: "Operational",
    service: "ASPPIBRA Governance API",
    version: "1.0.3",
    environment: "Production"
  };

  return c.html(html`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>ASPPIBRA | API Status</title>
      <link rel="icon" type="image/x-icon" href="/favicon.ico">
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600;800&display=swap" rel="stylesheet">
      <style>
        :root { 
          --primary-glow: #4ade80;
          --glass-bg: rgba(255, 255, 255, 0.05);
          --glass-border: rgba(255, 255, 255, 0.1);
          --glass-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.3);
          --text-main: #ffffff;
          --text-muted: #94a3b8;
        }

        body { 
          font-family: 'Inter', sans-serif; 
          background: radial-gradient(circle at 10% 20%, #0f3618 0%, #020617 90%);
          background-attachment: fixed;
          color: var(--text-main); 
          display: flex; flex-direction: column; min-height: 100vh; margin: 0; 
        }

        .glass-panel {
          background: var(--glass-bg);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          border: 1px solid var(--glass-border);
          box-shadow: var(--glass-shadow);
          border-radius: 20px;
        }

        header { 
          background: rgba(0, 0, 0, 0.2); backdrop-filter: blur(10px);
          border-bottom: 1px solid var(--glass-border);
          padding: 1rem 0; width: 100%; z-index: 1000; position: sticky; top: 0;
        }
        header h1 { margin: 0; font-weight: 300; letter-spacing: 1px; font-size: 1.2rem; opacity: 0.9; text-align: center; }

        main { flex: 1; display: flex; flex-direction: column; align-items: center; width: 100%; padding: 40px 20px; box-sizing: border-box; }
        .main-container { width: 100%; max-width: 1100px; }
        
        .welcome-card { 
          background: linear-gradient(135deg, rgba(34, 197, 94, 0.2) 0%, rgba(0,0,0,0) 100%);
          border: 1px solid rgba(34, 197, 94, 0.3);
          padding: 2.5rem; border-radius: 24px; margin-bottom: 2.5rem; position: relative; overflow: hidden;
        }
        .welcome-card::before {
            content: ''; position: absolute; top: -50%; left: -50%; width: 200%; height: 200%;
            background: radial-gradient(circle, rgba(74, 222, 128, 0.1) 0%, transparent 60%); z-index: -1;
        }
        .welcome-card h2 { margin: 0; font-size: 2rem; font-weight: 700; background: linear-gradient(to right, #fff, #a7f3d0); -webkit-background-clip: text; -webkit-text-fill-color: transparent; } 
        .welcome-card p { margin-top: 0.8rem; color: var(--text-muted); font-size: 1rem; }
        
        .summary-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 1.5rem; margin-bottom: 2.5rem; }
        .summary-card { padding: 1.8rem; transition: transform 0.2s ease, border-color 0.2s; }
        .summary-card:hover { transform: translateY(-5px); border-color: rgba(255,255,255,0.3); }
        .summary-card h3 { font-size: 0.85rem; color: var(--text-muted); margin: 0; text-transform: uppercase; letter-spacing: 1px; } 
        .summary-card .value { font-size: 2.5rem; font-weight: 700; margin: 0.8rem 0; color: #fff; text-shadow: 0 0 20px rgba(74, 222, 128, 0.2); }
        .summary-card .change { font-size: 0.85rem; font-weight: 500; display: inline-block; padding: 4px 10px; border-radius: 12px; background: rgba(255,255,255,0.05); }
        .change.positive { color: #4ade80; } .change.negative { color: #f87171; }

        .tech-dashboard { display: flex; flex-wrap: wrap; gap: 24px; align-items: stretch; }
        
        .col-system { flex: 1; min-width: 320px; }
        .governance-card { 
          padding: 3rem; text-align: center; height: 100%; box-sizing: border-box; 
          display: flex; flex-direction: column; justify-content: center; 
          background: linear-gradient(180deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.01) 100%);
        }
        .logo-container {
            width: 100px; height: 100px; margin: 0 auto 1.5rem;
            background: rgba(255,255,255,0.05); border-radius: 50%;
            display: flex; align-items: center; justify-content: center;
            border: 1px solid rgba(255,255,255,0.1); box-shadow: 0 0 30px rgba(74, 222, 128, 0.1);
        }
        .logo-img { width: 60px; height: 60px; object-fit: contain; }
        
        .status-badge { 
          display: inline-flex; align-items: center; gap: 8px; 
          background: rgba(34, 197, 94, 0.15); color: #4ade80; 
          padding: 8px 20px; border-radius: 99px; font-weight: 600; font-size: 0.9rem; margin: 1.5rem auto; 
          border: 1px solid rgba(34, 197, 94, 0.3); box-shadow: 0 0 15px rgba(34, 197, 94, 0.2);
        }
        .dot { width: 8px; height: 8px; background: #4ade80; border-radius: 50%; box-shadow: 0 0 8px #4ade80; }
        
        .sys-details { 
          background: rgba(0,0,0,0.2); border-radius: 12px; padding: 1.2rem; 
          text-align: left; font-size: 0.9rem; margin-top: auto; 
          border: 1px solid rgba(255,255,255,0.05);
        }
        .sys-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid rgba(255,255,255,0.05); color: var(--text-muted); }
        .sys-row:last-child { border-bottom: none; }
        .sys-val { color: #fff; font-family: monospace; }

        .col-infra { flex: 1; min-width: 320px; display: flex; flex-direction: column; gap: 24px; }
        
        .db-metrics-row { display: flex; gap: 24px; }
        .metric-card { flex: 1; padding: 1.5rem; position: relative; overflow: hidden; }
        .metric-title { font-size: 0.75rem; color: var(--text-muted); text-transform: uppercase; letter-spacing: 1px; margin-bottom: 8px; }
        .metric-value { font-size: 2rem; font-weight: 700; color: #fff; margin: 0; }
        
        .metric-bar { height: 6px; width: 100%; background: rgba(255,255,255,0.1); margin-top: 15px; border-radius: 3px; }
        .bar-fill { height: 100%; border-radius: 3px; position: relative; }
        .bar-fill.green { background: #4ade80; box-shadow: 0 0 10px rgba(74, 222, 128, 0.5); }
        .bar-fill.blue { background: #60a5fa; box-shadow: 0 0 10px rgba(96, 165, 250, 0.5); }

        .countries-card { padding: 1.5rem; flex-grow: 1; }
        .card-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; padding-bottom: 15px; border-bottom: 1px solid rgba(255,255,255,0.1); }
        .country-list { list-style: none; padding: 0; margin: 0; }
        .country-item { 
            display: flex; justify-content: space-between; align-items: center;
            padding: 12px 10px; border-bottom: 1px solid rgba(255,255,255,0.05); 
            color: #e2e8f0; font-size: 0.95rem;
            transition: background 0.2s; border-radius: 8px;
        }
        .country-item:hover { background: rgba(255,255,255,0.05); }
        
        footer { margin-top: 3rem; color: var(--text-muted); font-size: 0.8rem; background: transparent; padding: 2rem; text-align: center; }

        @keyframes pulse { 0% { opacity: 0.4; } 50% { opacity: 0.8; } 100% { opacity: 0.4; } }
        .loading { animation: pulse 1.5s infinite; color: var(--text-muted); }
      </style>
    </head>
    <body>
      <header><h1>ASPPIBRA DAO</h1></header>

      <main>
        <div class="main-container">
          
          <div class="welcome-card glass-panel">
            <h2>Welcome back Jaydon Frankie</h2>
            <p>System metrics and real-time governance overview.</p>
          </div>

          <div class="summary-grid">
            <div class="summary-card glass-panel">
              <h3>Total active users</h3>
              <p class="value">18,765</p>
              <div class="change positive">▲ +2.6% last 7 days</div>
            </div>
            <div class="summary-card glass-panel">
              <h3>Total installed</h3>
              <p class="value">4,876</p>
              <div class="change positive">▲ +0.2% last 7 days</div>
            </div>
            <div class="summary-card glass-panel">
              <h3>Total downloads</h3>
              <p class="value">678</p>
              <div class="change negative">▼ -0.1% last 7 days</div>
            </div>
          </div>

          <div class="tech-dashboard">
            
            <div class="col-system">
              <div class="governance-card glass-panel">
                <div class="logo-container">
                    <img src="/android-chrome-192x192.png" alt="Logo" class="logo-img" onerror="this.style.display='none'">
                </div>
                <h2 style="margin: 0; font-size: 1.5rem; font-weight: 700; color: #fff;">Governance System</h2>
                <p style="color: var(--text-muted); margin-top: 0.5rem; font-size: 0.9rem;">API Backend & DAO Services</p>
                
                <div class="status-badge">
                  <span class="dot"></span> ${statusInfo.status}
                </div>
                
                <div class="sys-details">
                  <div class="sys-row"><span>Version</span> <span class="sys-val">${statusInfo.version}</span></div>
                  <div class="sys-row"><span>Service</span> <span class="sys-val">Core API</span></div>
                  <div class="sys-row"><span>Region</span> <span class="sys-val">Global Edge</span></div>
                  <div class="sys-row"><span>Env</span> <span class="sys-val">${statusInfo.environment}</span></div>
                </div>
              </div>
            </div>

            <div class="col-infra">
              
              <div class="db-metrics-row">
                <div class="metric-card glass-panel">
                  <div class="metric-title">DB Reads (24h)</div>
                  <div class="metric-value" id="lbl-reads"><span class="loading">--</span></div>
                  <div class="metric-bar"><div class="bar-fill green" style="width: 10%;"></div></div>
                </div>
                <div class="metric-card glass-panel">
                  <div class="metric-title">DB Writes (24h)</div>
                  <div class="metric-value" id="lbl-writes"><span class="loading">--</span></div>
                  <div class="metric-bar"><div class="bar-fill blue" style="width: 5%;"></div></div>
                </div>
              </div>

              <div class="countries-card glass-panel">
                <div class="card-header">
                  <h4 style="margin:0; font-weight:600;">🌍 Top Traffic Origin</h4>
                  <span style="font-size: 0.7rem; background: rgba(255,255,255,0.1); padding: 4px 10px; border-radius: 4px; color: #cbd5e1;">Live</span>
                </div>
                <ul class="country-list" id="list-countries">
                   <li class="country-item"><span class="loading">Scanning network...</span></li>
                </ul>
              </div>

            </div>
          </div>

        </div>
      </main>

      <footer><p>Powered by ASPPIBRA DAO • Secured by Cloudflare</p></footer>

      <script>
        async function fetchMetrics() {
          const lblReads = document.getElementById('lbl-reads');
          const lblWrites = document.getElementById('lbl-writes');
          const listCountries = document.getElementById('list-countries');

          try {
            console.log("Fetching metrics...");
            const response = await fetch('/monitoring');
            
            // Verificação de erro HTTP
            if (!response.ok) {
                throw new Error(\`HTTP error! status: \${response.status}\`);
            }

            const data = await response.json();
            
            // Atualiza DB Metrics
            if(data.db) {
                const reads = data.db.readQueries || 0;
                const writes = data.db.writeQueries || 0;
                
                lblReads.innerText = reads.toLocaleString();
                lblWrites.innerText = writes.toLocaleString();
                
                const readWidth = Math.min(100, Math.max(5, (reads / 500) * 100)); 
                const writeWidth = Math.min(100, Math.max(5, (writes / 100) * 100)); 
                
                document.querySelector('.bar-fill.green').style.width = readWidth + '%';
                document.querySelector('.bar-fill.blue').style.width = writeWidth + '%';
            } else {
                lblReads.innerText = "N/A";
                lblWrites.innerText = "N/A";
            }

            // Atualiza Lista de Países
            listCountries.innerHTML = ''; 
            
            if(data.countries && data.countries.length > 0) {
                data.countries.forEach(country => {
                    const li = document.createElement('li');
                    li.className = 'country-item';
                    const code = country.code || 'UNK';
                    const flagUrl = 'https://flagsapi.com/' + code + '/flat/32.png';
                    
                    li.innerHTML = \`
                        <div style="display:flex; align-items:center; gap:12px;">
                            <img src="\${flagUrl}" style="width:20px; height:20px; object-fit:contain; filter: drop-shadow(0 0 2px rgba(255,255,255,0.3));" onerror="this.style.display='none'">
                            <span style="font-weight:500;">\${code}</span>
                        </div>
                        <span style="font-weight:700; color: #fff;">\${country.count}</span>
                    \`;
                    list.appendChild(li);
                });
            } else {
                listCountries.innerHTML = '<li class="country-item" style="justify-content:center; color: #64748b;">No recent traffic</li>';
            }

          } catch (e) {
            console.error('Error loading metrics', e);
            // FEEDBACK VISUAL DO ERRO
            listCountries.innerHTML = '<li class="country-item" style="color: #f87171;">Connection Failed</li>';
            lblReads.innerText = "Err";
            lblWrites.innerText = "Err";
          }
        }
        
        fetchMetrics();
      </script>
    </body>
    </html>
  `);
});

app.get('/health-db', async (c) => {
  const db = c.get('db');
  return success(c, { status: 'ok', message: 'DB Connected' }, 'DB Check');
});

app.route('/users', userRoutes);
app.route('/auth', authRoutes);
app.route('/post', postRoutes);

export default app;