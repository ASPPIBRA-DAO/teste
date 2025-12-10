import { html } from 'hono/html';

interface DashboardProps {
    version: string;
    service: string;
    cacheRatio: string;
    domain: string;
    imageUrl: string;
}

export const DashboardTemplate = (props: DashboardProps) => html`
  <!DOCTYPE html>
  <html lang="pt-BR">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    
    <title>ASPPIBRA | Governance</title>
    <meta name="description" content="Monitoramento em tempo real de governança e API.">
    
    <meta property="og:type" content="website">
    <meta property="og:url" content="${props.domain}">
    <meta property="og:title" content="ASPPIBRA Governance System">
    <meta property="og:description" content="Status Operacional: Online. Monitoramento de D1 e Tráfego.">
    <meta property="og:image" content="${props.imageUrl}">

    <meta name="twitter:card" content="summary_large_image">
    <meta property="twitter:url" content="${props.domain}">
    <meta name="twitter:title" content="ASPPIBRA Governance">
    <meta name="twitter:image" content="${props.imageUrl}">

    <link rel="icon" type="image/x-icon" href="/favicon.ico">
    <link rel="manifest" href="/site.webmanifest">

    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600;800&display=swap" rel="stylesheet">
    
    <style>
      :root { --primary-glow: #F56040; --accent-blue: #00FFFF; }
      .theme-dark { --bg-main: linear-gradient(135deg, #1A1A2E 0%, #0F0F1A 100%); --bg-card: rgba(255, 255, 255, 0.05); --bg-card-header: rgba(0, 0, 0, 0.2); --text-main: #ffffff; --text-muted: #94a3b8; --border-main: rgba(255, 255, 255, 0.1); --card-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.3); --card-blur: blur(12px); --status-bg: rgba(0, 255, 255, 0.1); --status-glow: #00FFFF; --pos-change: var(--primary-glow); --neg-change: #f87171; }
      body { font-family: 'Inter', sans-serif; background: var(--bg-main); background-attachment: fixed; color: var(--text-main); display: flex; flex-direction: column; min-height: 100vh; margin: 0; }
      .glass-panel { background: var(--bg-card); backdrop-filter: var(--card-blur); -webkit-backdrop-filter: var(--card-blur); border: 1px solid var(--border-main); box-shadow: var(--card-shadow); border-radius: 20px; }
      header { background: var(--bg-card-header); backdrop-filter: var(--card-blur); border-bottom: 1px solid var(--border-main); padding: 1rem 0; width: 100%; z-index: 1000; position: sticky; top: 0; }
      header h1 { margin: 0; font-weight: 300; letter-spacing: 1px; font-size: 1.2rem; opacity: 0.9; text-align: center; }
      main { flex: 1; display: flex; flex-direction: column; align-items: center; width: 100%; padding: 40px 20px; box-sizing: border-box; }
      .main-container { width: 100%; max-width: 1100px; }
      
      .welcome-card { background: linear-gradient(135deg, var(--bg-card) 0%, rgba(255,255,255,0) 100%); border: 1px solid var(--border-main); padding: 2.5rem; border-radius: 24px; margin-bottom: 2.5rem; position: relative; overflow: hidden; }
      .welcome-card h2 { margin: 0; font-size: 2rem; font-weight: 700; background: linear-gradient(to right, var(--text-main), var(--status-glow)); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
      .welcome-card p { margin-top: 0.8rem; color: var(--text-muted); font-size: 1rem; }
      
      .summary-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 1.5rem; margin-bottom: 2.5rem; }
      .summary-card { padding: 1.8rem; }
      .summary-card .value { font-size: 2.5rem; font-weight: 700; margin: 0.8rem 0; color: var(--text-main); }
      .summary-card h3 { font-size: 0.85rem; color: var(--text-muted); margin: 0; text-transform: uppercase; letter-spacing: 1px; }

      .tech-dashboard { display: flex; flex-wrap: wrap; gap: 24px; align-items: stretch; }
      .col-system { flex: 1; min-width: 320px; }
      .col-infra { flex: 1; min-width: 320px; display: flex; flex-direction: column; gap: 24px; }
      
      .governance-card { padding: 3rem; text-align: center; height: 100%; box-sizing: border-box; display: flex; flex-direction: column; justify-content: center; background: linear-gradient(180deg, var(--bg-card) 0%, rgba(255,255,255,0) 100%); }
      .logo-container { width: 100px; height: 100px; margin: 0 auto 1.5rem; background: var(--bg-card); border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 1px solid var(--border-main); }
      .logo-img { width: 60px; height: 60px; object-fit: contain; }
      .status-badge { display: inline-flex; align-items: center; gap: 8px; background: var(--status-bg); color: var(--status-glow); padding: 8px 20px; border-radius: 99px; font-weight: 600; font-size: 0.9rem; margin: 1.5rem auto; border: 1px solid rgba(0, 0, 0, 0.1); }
      .dot { width: 8px; height: 8px; background: var(--status-glow); border-radius: 50%; box-shadow: 0 0 8px var(--status-glow); }
      
      .sys-details { background: var(--bg-card-header); border-radius: 12px; padding: 1.2rem; text-align: left; font-size: 0.9rem; margin-top: auto; border: 1px solid var(--border-main); }
      .sys-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid var(--border-main); color: var(--text-muted); }
      .sys-row:last-child { border-bottom: none; }
      .sys-val { color: var(--text-main); font-family: monospace; }
      
      .db-metrics-row { display: flex; gap: 24px; }
      .metric-card { flex: 1; padding: 1.5rem; position: relative; overflow: hidden; }
      .metric-title { font-size: 0.75rem; color: var(--text-muted); text-transform: uppercase; letter-spacing: 1px; margin-bottom: 8px; }
      .metric-value { font-size: 2rem; font-weight: 700; color: var(--text-main); margin: 0; }
      .metric-bar { height: 6px; width: 100%; background: var(--border-main); margin-top: 15px; border-radius: 3px; }
      .bar-fill { height: 100%; border-radius: 3px; }
      .bar-fill.green { background: var(--status-glow); } .bar-fill.blue { background: #60a5fa; }
      
      .countries-card { padding: 1.5rem; flex-grow: 1; }
      .card-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; padding-bottom: 15px; border-bottom: 1px solid var(--border-main); }
      .country-list { list-style: none; padding: 0; margin: 0; }
      .country-item { display: flex; justify-content: space-between; align-items: center; padding: 12px 10px; border-bottom: 1px solid var(--border-main); color: var(--text-main); font-size: 0.95rem; }
      
      footer { margin-top: 3rem; color: var(--text-muted); font-size: 0.8rem; background: transparent; padding: 2rem; text-align: center; }
      .loading { animation: pulse 1.5s infinite; color: var(--text-muted); }
      @keyframes pulse { 0% { opacity: 0.4; } 50% { opacity: 0.8; } 100% { opacity: 0.4; } }
      
      #theme-toggle { position: absolute; top: 1rem; right: 2rem; background: var(--bg-card); color: var(--text-main); border: 1px solid var(--border-main); border-radius: 50%; width: 40px; height: 40px; cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 1.2rem; }
      .change.positive { color: var(--pos-change); font-size: 0.85rem; font-weight: 500; display: inline-block; padding: 4px 10px; border-radius: 12px; background: rgba(0,255,255,0.05); }
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
            <h3>Dados Transferidos (24h)</h3>
            <p class="value" id="lbl-total-bytes"><span class="loading">--</span></p>
            <div class="change positive">Bandwidth</div>
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
              <div class="status-badge"><span class="dot"></span> Operational</div>
              <div class="sys-details">
                <div class="sys-row"><span>Version</span> <span class="sys-val">${props.version}</span></div>
                <div class="sys-row"><span>Service</span> <span class="sys-val">${props.service}</span></div>
                <div class="sys-row"><span>Region</span> <span class="sys-val">Global Edge</span></div>
                <div class="sys-row"><span>Cache Ratio</span> <span class="sys-val" id="lbl-cache-ratio">${props.cacheRatio}</span></div>
              </div>
            </div>
          </div>

          <div class="col-infra">
            <div class="db-metrics-row">
              <div class="metric-card glass-panel">
                <div class="metric-title">DB Reads (24h)</div>
                <div class="metric-value" id="lbl-reads"><span class="loading">--</span></div>
                <div class="metric-bar"><div class="bar-fill green" id="bar-reads" style="width: 0%;"></div></div>
              </div>
              <div class="metric-card glass-panel">
                <div class="metric-title">DB Writes (24h)</div>
                <div class="metric-value" id="lbl-writes"><span class="loading">--</span></div>
                <div class="metric-bar"><div class="bar-fill blue" id="bar-writes" style="width: 0%;"></div></div>
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
      const toggleButton = document.getElementById('theme-toggle');
      const body = document.body;
      function applyTheme(theme) { body.className = ''; body.classList.add('theme-' + theme); toggleButton.innerText = theme === 'dark' ? '☀️' : '🌙'; localStorage.setItem('theme', theme); }
      function toggleTheme() { const currentTheme = body.classList.contains('theme-dark') ? 'dark' : 'light'; const newTheme = currentTheme === 'dark' ? 'light' : 'dark'; applyTheme(newTheme); }
      function initTheme() { const savedTheme = localStorage.getItem('theme'); const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches; if (savedTheme) applyTheme(savedTheme); else if (prefersDark) applyTheme('dark'); else applyTheme('light'); }
      toggleButton.addEventListener('click', toggleTheme);
      initTheme();

      async function fetchMetrics() {
        const lblTotalRequests = document.getElementById('lbl-total-requests');
        const lblTotalBytes = document.getElementById('lbl-total-bytes');
        const lblSummaryWrites = document.getElementById('lbl-summary-writes');
        const lblReads = document.getElementById('lbl-reads');
        const lblWrites = document.getElementById('lbl-writes');
        const lblCacheRatio = document.getElementById('lbl-cache-ratio');
        const listCountries = document.getElementById('list-countries');

        try {
          const response = await fetch('/monitoring');
          const data = await response.json();
          if (data.error) throw new Error(data.error);

          lblTotalRequests.innerText = data.requests.toLocaleString();
          const bytes = data.bytes;
          let byteStr = "0 B";
          if (bytes > 1073741824) byteStr = (bytes / 1073741824).toFixed(2) + " GB";
          else if (bytes > 1048576) byteStr = (bytes / 1048576).toFixed(2) + " MB";
          else byteStr = (bytes / 1024).toFixed(0) + " KB";
          lblTotalBytes.innerText = byteStr;
          
          if(data.cacheRatio) lblCacheRatio.innerText = data.cacheRatio + "%";

          lblSummaryWrites.innerText = data.dbWrites.toLocaleString();
          lblReads.innerText = data.dbReads.toLocaleString();
          lblWrites.innerText = data.dbWrites.toLocaleString();

          const maxVal = Math.max(data.dbReads, data.dbWrites, 100);
          document.getElementById('bar-reads').style.width = Math.min(100, (data.dbReads / maxVal) * 100) + "%";
          document.getElementById('bar-writes').style.width = Math.min(100, (data.dbWrites / maxVal) * 100) + "%";

          listCountries.innerHTML = ''; 
          if(data.countries && data.countries.length > 0) {
              data.countries.forEach(c => {
                  const li = document.createElement('li');
                  li.className = 'country-item';
                  const code = c.code || 'UNK';
                  const flagUrl = 'https://flagsapi.com/' + code + '/flat/32.png';
                  li.innerHTML = \`<div style="display:flex; align-items:center; gap:12px;"><img src="\${flagUrl}" style="width:20px; height:20px; object-fit:contain;" onerror="this.style.display='none'"><span style="font-weight:500;">\${code}</span></div><span style="font-weight:700; color: var(--text-main); ">\${c.count.toLocaleString()}</span>\`;
                  listCountries.appendChild(li);
              });
          } else {
              listCountries.innerHTML = '<li class="country-item" style="justify-content:center; color: var(--text-muted);">No traffic data</li>';
          }
        } catch (e) {
          console.error('Error loading metrics', e);
        }
      }
      fetchMetrics();
      setInterval(fetchMetrics, 60000);
    </script>
  </body>
  </html>
`;