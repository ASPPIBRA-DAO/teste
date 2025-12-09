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

// --- 1. Configuração de CORS (Sem Alterações) ---
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

// --- 2. Middleware de Banco de Dados (Sem Alterações) ---
app.use(async (c, next) => {
  try {
    const db = createDb(c.env.DB);
    c.set('db', db);
    await next();
  } catch (e) {
    return error(c, 'Erro interno ao conectar no banco de dados', null, 500);
  }
});

// --- 3. ROTA DE DADOS: Monitoramento (ATUALIZADO) ---
app.get('/monitoring', async (c) => {
  const accountId = c.env.CLOUDFLARE_ACCOUNT_ID;
  const zoneId = c.env.CLOUDFLARE_ZONE_ID;
  const apiToken = c.env.CLOUDFLARE_API_TOKEN;

  // Calculate 24h ago
  const startDateTime = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

  const query = `
    query {
      viewer {
        accounts(filter: { accountTag: "${accountId}" }) {
          d1AnalyticsAdaptiveGroups(limit: 1, filter: { datetime_geq: "${startDateTime}" }) {
            sum { readQueries, writeQueries }
          }
        }
        zones(filter: { zoneTag: "${zoneId}" }) {
          # Aggregate traffic stats for the last 24h
          traffic: httpRequestsAdaptiveGroups(
            limit: 1,
            filter: { datetime_geq: "${startDateTime}" }
          ) {
            count
            sum { 
              visits
            }
          }
          # Top Countries
          countries: httpRequestsAdaptiveGroups(limit: 5, filter: { datetime_geq: "${startDateTime}" }, orderBy: [count_DESC]) {
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
      console.error("GraphQL Errors:", JSON.stringify(cfData.errors));
    }

    const dbMetrics = cfData?.data?.viewer?.accounts?.[0]?.d1AnalyticsAdaptiveGroups?.[0]?.sum || { readQueries: 0, writeQueries: 0 };

    // Parse Traffic
    const trafficNode = cfData?.data?.viewer?.zones?.[0]?.traffic?.[0];
    const trafficMetrics = {
        requests: trafficNode?.count || 0,
        viewer: { unique: trafficNode?.sum?.visits || 0 }
    };

    // Parse Countries
    const rawCountries = cfData?.data?.viewer?.zones?.[0]?.countries || [];
    const countries = rawCountries.map((item: any) => ({
      code: item.dimensions.clientCountryName,
      count: item.count
    }));

    // Return 'traffic' in JSON
    return c.json({ db: dbMetrics, countries, traffic: trafficMetrics });
  } catch (e) {
    console.error("Monitoring Error:", e);
    return c.json({ error: 'Failed to fetch metrics' }, 500);
  }
});

// --- 4. ROTA VISUAL: Dashboard HTML (ATUALIZADO) ---
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
        /* Variáveis Comuns */
        :root { 
          --primary-glow: #F56040; 
          --accent-blue: #00FFFF;
        }

        /* Variáveis do Tema Dark (Padrão) */
        .theme-dark {
          /* Cores de Fundo */
          --bg-main: linear-gradient(135deg, #1A1A2E 0%, #0F0F1A 100%);
          --bg-card: rgba(255, 255, 255, 0.05);
          --bg-card-header: rgba(0, 0, 0, 0.2);
          
          /* Cores de Texto e Borda */
          --text-main: #ffffff;
          --text-muted: #94a3b8;
          --border-main: rgba(255, 255, 255, 0.1);
          
          /* Efeito Glassmorphism (Sombra e Blur) */
          --card-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.3);
          --card-blur: blur(12px);
          
          /* Destaques */
          --status-bg: rgba(0, 255, 255, 0.1);
          --status-glow: #00FFFF;
          --pos-change: var(--primary-glow); /* Laranja */
          --neg-change: #f87171; /* Vermelho Suave */
        }

        /* Variáveis do Tema Light */
        .theme-light {
          /* Cores de Fundo */
          --bg-main: #F4F7FC; /* Cinza muito claro */
          --bg-card: #FFFFFF;
          --bg-card-header: #FFFFFF;
          
          /* Cores de Texto e Borda */
          --text-main: #1C2A3A;
          --text-muted: #6B7A90;
          --border-main: #E0E0E0; /* Borda cinza clara */
          
          /* Efeito Sutil (Limpo e Suave) */
          --card-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
          --card-blur: none;
          
          /* Destaques */
          --status-bg: rgba(0, 150, 136, 0.1); /* Verde Água Claro */
          --status-glow: #009688;
          --pos-change: #3BB579; /* Verde Suave */
          --neg-change: #E04F5F; /* Vermelho Suave */
        }
        
        /* Aplicação de Estilos Baseados no Tema */
        body { 
          font-family: 'Inter', sans-serif; 
          background: var(--bg-main);
          background-attachment: fixed;
          color: var(--text-main); 
          display: flex; flex-direction: column; min-height: 100vh; margin: 0; 
          transition: background-color 0.5s, color 0.5s;
        }

        .glass-panel {
          background: var(--bg-card);
          backdrop-filter: var(--card-blur);
          -webkit-backdrop-filter: var(--card-blur);
          border: 1px solid var(--border-main);
          box-shadow: var(--card-shadow);
          border-radius: 20px;
          transition: all 0.3s;
        }

        header { 
          background: var(--bg-card-header); 
          backdrop-filter: var(--card-blur);
          border-bottom: 1px solid var(--border-main);
          padding: 1rem 0; width: 100%; z-index: 1000; position: sticky; top: 0;
        }
        header h1 { margin: 0; font-weight: 300; letter-spacing: 1px; font-size: 1.2rem; opacity: 0.9; text-align: center; }

        /* Estilo do Botão de Alternância (Novo) */
        #theme-toggle {
            position: absolute; top: 1rem; right: 2rem;
            background: var(--bg-card); color: var(--text-main);
            border: 1px solid var(--border-main); border-radius: 50%;
            width: 40px; height: 40px; cursor: pointer;
            display: flex; align-items: center; justify-content: center;
            font-size: 1.2rem; transition: background 0.3s, color 0.3s;
            z-index: 1001;
        }
        #theme-toggle:hover {
            box-shadow: var(--card-shadow);
        }

        main { flex: 1; display: flex; flex-direction: column; align-items: center; width: 100%; padding: 40px 20px; box-sizing: border-box; }
        .main-container { width: 100%; max-width: 1100px; }
        
        .welcome-card { 
          background: linear-gradient(135deg, var(--bg-card) 0%, rgba(255,255,255,0) 100%);
          border: 1px solid var(--border-main);
          padding: 2.5rem; border-radius: 24px; margin-bottom: 2.5rem; position: relative; overflow: hidden;
        }
        .welcome-card::before {
            content: ''; position: absolute; top: -50%; left: -50%; width: 200%; height: 200%;
            background: radial-gradient(circle, var(--status-bg) 0%, transparent 60%); z-index: -1;
        }
        .welcome-card h2 { 
            margin: 0; font-size: 2rem; font-weight: 700; 
            /* Gradiente Light/Dark compatível */
            background: linear-gradient(to right, var(--text-main), var(--status-glow)); 
            -webkit-background-clip: text; 
            -webkit-text-fill-color: transparent; 
        } 
        .welcome-card p { margin-top: 0.8rem; color: var(--text-muted); font-size: 1rem; }
        
        .summary-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 1.5rem; margin-bottom: 2.5rem; }
        .summary-card { padding: 1.8rem; transition: transform 0.2s ease, border-color 0.2s; }
        .summary-card:hover { transform: translateY(-5px); border-color: var(--primary-glow); }
        .summary-card h3 { font-size: 0.85rem; color: var(--text-muted); margin: 0; text-transform: uppercase; letter-spacing: 1px; } 
        .summary-card .value { font-size: 2.5rem; font-weight: 700; margin: 0.8rem 0; color: var(--text-main); }
        .summary-card .change { font-size: 0.85rem; font-weight: 500; display: inline-block; padding: 4px 10px; border-radius: 12px; background: rgba(0,0,0,0.05); }
        
        /* Cor de Mudança Positiva/Negativa */
        .theme-light .change { background: rgba(0,0,0,0.05); }
        .theme-dark .change { background: rgba(255,255,255,0.05); }
        
        .change.positive { color: var(--pos-change); } 
        .change.negative { color: var(--neg-change); }

        .tech-dashboard { display: flex; flex-wrap: wrap; gap: 24px; align-items: stretch; }
        
        .col-system { flex: 1; min-width: 320px; }
        .governance-card { 
          padding: 3rem; text-align: center; height: 100%; box-sizing: border-box; 
          display: flex; flex-direction: column; justify-content: center; 
          background: linear-gradient(180deg, var(--bg-card) 0%, rgba(255,255,255,0) 100%);
        }
        .logo-container {
            width: 100px; height: 100px; margin: 0 auto 1.5rem;
            background: var(--bg-card); border-radius: 50%;
            display: flex; align-items: center; justify-content: center;
            border: 1px solid var(--border-main); 
            box-shadow: 0 0 30px rgba(0, 0, 0, 0.08);
        }
        .logo-img { width: 60px; height: 60px; object-fit: contain; }
        
        .status-badge { 
          display: inline-flex; align-items: center; gap: 8px; 
          background: var(--status-bg); 
          color: var(--status-glow); 
          padding: 8px 20px; border-radius: 99px; font-weight: 600; font-size: 0.9rem; margin: 1.5rem auto; 
          border: 1px solid rgba(0, 0, 0, 0.1); 
          box-shadow: 0 0 15px rgba(0, 0, 0, 0.05);
        }
        .dot { 
          width: 8px; height: 8px; 
          background: var(--status-glow); 
          border-radius: 50%; 
          box-shadow: 0 0 8px var(--status-glow); 
        }
        
        .sys-details { 
          background: var(--bg-card-header); border-radius: 12px; padding: 1.2rem; 
          text-align: left; font-size: 0.9rem; margin-top: auto; 
          border: 1px solid var(--border-main);
        }
        .sys-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid var(--border-main); color: var(--text-muted); }
        .sys-row:last-child { border-bottom: none; }
        .sys-val { color: var(--text-main); font-family: monospace; }

        .col-infra { flex: 1; min-width: 320px; display: flex; flex-direction: column; gap: 24px; }
        
        .db-metrics-row { display: flex; gap: 24px; }
        .metric-card { flex: 1; padding: 1.5rem; position: relative; overflow: hidden; }
        .metric-title { font-size: 0.75rem; color: var(--text-muted); text-transform: uppercase; letter-spacing: 1px; margin-bottom: 8px; }
        .metric-value { font-size: 2rem; font-weight: 700; color: var(--text-main); margin: 0; }
        
        .metric-bar { height: 6px; width: 100%; background: var(--border-main); margin-top: 15px; border-radius: 3px; }
        .bar-fill { height: 100%; border-radius: 3px; position: relative; }
        .bar-fill.green { background: var(--status-glow); box-shadow: 0 0 10px var(--status-glow); }
        .bar-fill.blue { background: #60a5fa; box-shadow: 0 0 10px rgba(96, 165, 250, 0.5); }

        .countries-card { padding: 1.5rem; flex-grow: 1; }
        .card-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; padding-bottom: 15px; border-bottom: 1px solid var(--border-main); }
        .country-list { list-style: none; padding: 0; margin: 0; }
        .country-item { 
            display: flex; justify-content: space-between; align-items: center;
            padding: 12px 10px; border-bottom: 1px solid var(--border-main); 
            color: var(--text-main); font-size: 0.95rem;
            transition: background 0.2s; border-radius: 8px;
        }
        .country-item:hover { background: rgba(0,0,0,0.05); }
        .theme-dark .country-item:hover { background: rgba(255,255,255,0.05); }
        
        footer { margin-top: 3rem; color: var(--text-muted); font-size: 0.8rem; background: transparent; padding: 2rem; text-align: center; }

        @keyframes pulse { 0% { opacity: 0.4; } 50% { opacity: 0.8; } 100% { opacity: 0.4; } }
        .loading { animation: pulse 1.5s infinite; color: var(--text-muted); }
      </style>
      </head>
    <body class="theme-dark"> 
      <header>
        <button id="theme-toggle" title="Alternar Tema">🌙</button>
        <h1>ASPPIBRA DAO</h1>
      </header>

      <main>
        <div class="main-container">
          
          <div class="welcome-card glass-panel">
            <h2>Welcome back Jaydon Frankie</h2>
            <p>System metrics and real-time governance overview.</p>
          </div>

          <div class="summary-grid">
            <div class="summary-card glass-panel">
              <h3>Total de Solicitações (24h)</h3>
              <p class="value" id="lbl-total-requests"><span class="loading">--</span></p>
              <div class="change positive">Monitorando...</div>
            </div>
            <div class="summary-card glass-panel">
              <h3>Visitantes Únicos (24h)</h3>
              <p class="value" id="lbl-unique-visitors"><span class="loading">--</span></p>
              <div class="change positive">Monitorando...</div>
            </div>
            <div class="summary-card glass-panel">
              <h3>DB Writes (24h)</h3>
              <p class="value" id="lbl-summary-writes"><span class="loading">--</span></p>
              <div class="change positive">DB Workload</div>
            </div>
          </div>

          <div class="tech-dashboard">
            
            <div class="col-system">
              <div class="governance-card glass-panel">
                <div class="logo-container">
                    <img src="/android-chrome-192x192.png" alt="Logo" class="logo-img" onerror="this.style.display='none'">
                </div>
                <h2 style="margin: 0; font-size: 1.5rem; font-weight: 700; color: var(--text-main);">Governance System</h2>
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
                  <h4 style="margin:0; font-weight:600; color: var(--text-main);">🌍 Top Traffic Origin</h4>
                  <span style="font-size: 0.7rem; background: rgba(0,0,0,0.1); padding: 4px 10px; border-radius: 4px; color: var(--text-muted);">Live</span>
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
        // --- FUNÇÕES DE TEMA ---
        const toggleButton = document.getElementById('theme-toggle');
        const body = document.body;

        // 1. Aplica o tema salvo ou o padrão do sistema
        function applyTheme(theme) {
            body.className = '';
            body.classList.add('theme-' + theme);
            toggleButton.innerText = theme === 'dark' ? '☀️' : '🌙';
            localStorage.setItem('theme', theme);
        }

        // 2. Alterna entre Light e Dark
        function toggleTheme() {
            const currentTheme = body.classList.contains('theme-dark') ? 'dark' : 'light';
            const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
            applyTheme(newTheme);
        }

        // 3. Inicializa o tema ao carregar
        function initTheme() {
            const savedTheme = localStorage.getItem('theme');
            const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

            if (savedTheme) {
                applyTheme(savedTheme);
            } else if (prefersDark) {
                applyTheme('dark');
            } else {
                applyTheme('light'); // Padrão se não houver preferência/salvo
            }
        }

        // Event listener para o botão de alternância
        toggleButton.addEventListener('click', toggleTheme);

        // Inicializa o tema
        initTheme();

        // --- FUNÇÕES DE MÉTRICAS (ATUALIZADAS) ---
        async function fetchMetrics() {
          const lblReads = document.getElementById('lbl-reads');
          const lblWrites = document.getElementById('lbl-writes');
          const listCountries = document.getElementById('list-countries');
          
          // 🆕 Novas Referências dos cards de Tráfego
          const lblTotalRequests = document.getElementById('lbl-total-requests');
          const lblUniqueVisitors = document.getElementById('lbl-unique-visitors');
          const lblSummaryWrites = document.getElementById('lbl-summary-writes');


          try {
            console.log("Fetching metrics...");
            const response = await fetch('/monitoring');
            
            if (!response.ok) {
                throw new Error(\`HTTP error! status: \${response.status}\`);
            }

            const data = await response.json();
            
            // 🆕 Atualiza Métricas de Tráfego
            if (data.traffic) {
                const totalRequests = data.traffic.requests || 0;
                const uniqueVisitors = data.traffic.viewer.unique || 0;

                lblTotalRequests.innerText = totalRequests.toLocaleString();
                lblUniqueVisitors.innerText = uniqueVisitors.toLocaleString();
            } else {
                lblTotalRequests.innerText = "N/A";
                lblUniqueVisitors.innerText = "N/A";
            }
            
            // Atualiza DB Metrics
            if(data.db) {
                const reads = data.db.readQueries || 0;
                const writes = data.db.writeQueries || 0;
                
                lblReads.innerText = reads.toLocaleString();
                lblWrites.innerText = writes.toLocaleString();
                // 🆕 Atualiza o terceiro card do topo com DB Writes
                lblSummaryWrites.innerText = writes.toLocaleString();

                const readWidth = Math.min(100, Math.max(5, (reads / 500) * 100)); 
                const writeWidth = Math.min(100, Math.max(5, (writes / 100) * 100)); 
                
                document.querySelector('.bar-fill.green').style.width = readWidth + '%';
                document.querySelector('.bar-fill.blue').style.width = writeWidth + '%';
            } else {
                lblReads.innerText = "N/A";
                lblWrites.innerText = "N/A";
                lblSummaryWrites.innerText = "N/A";
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
                        <span style="font-weight:700; color: var(--text-main); ">\${country.count}</span>
                    \`;
                    listCountries.appendChild(li);
                });
            } else {
                listCountries.innerHTML = '<li class="country-item" style="justify-content:center; color: var(--text-muted);">No recent traffic</li>';
            }

          } catch (e) {
            console.error('Error loading metrics', e);
            listCountries.innerHTML = '<li class="country-item" style="color: var(--neg-change);">Connection Failed</li>';
            lblReads.innerText = "Err";
            lblWrites.innerText = "Err";
            // 🆕 Atualiza novos campos em caso de erro
            lblTotalRequests.innerText = "Err";
            lblUniqueVisitors.innerText = "Err";
            lblSummaryWrites.innerText = "Err";
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