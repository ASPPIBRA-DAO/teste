// audit-api.js
// -----------------------------------------------------------
// 🕵️ SCRIPT DE AUDITORIA: DIAGNÓSTICO DE DADOS DA API (CORRIGIDO)
// -----------------------------------------------------------

const CONFIG = {
  ACCOUNT_ID: "5d91807e648c183cb7833caa06dbcbdb",
  ZONE_ID:    "60681ad827e114d9e51add1f079dd5d2",
  API_TOKEN:  "OIrQCNkgCUzx49pPc3VMCEOEO-F66SNHXI6hTDn8"
};

// --- CORREÇÃO DE TEMPO CRÍTICA ---
// A API exige uma janela máxima exata de 86400s (24h).
// Calculamos "Agora" e "24h atrás" com precisão de milissegundos.
const now = new Date();
const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000); 

const isoStart = oneDayAgo.toISOString(); 
const isoEnd = now.toISOString();

console.log(`
📊 INICIANDO AUDITORIA DE DADOS CLOUDFLARE`);
console.log(`🕒 Janela de Tempo Estrita: ${isoStart} até ${isoEnd}`);
console.log(`🎯 Objetivo: Validar métricas com janela de tempo corrigida.\n`);

const queries = [
  {
    name: "1. TRÁFEGO E VOLUME (Bandwidth)",
    description: "Verifica se conseguimos contar requisições e somar bytes.",
    query: `
      query {
        viewer {
          zones(filter: { zoneTag: "${CONFIG.ZONE_ID}" }) {
            httpRequestsAdaptiveGroups(
              limit: 1, 
              filter: { datetime_geq: "${isoStart}", datetime_lt: "${isoEnd}" }
            ) {
              count
              sum {
                edgeResponseBytes
              }
            }
          }
        }
      }
    `
  },
  {
    name: "2. PERFORMANCE DE CACHE",
    description: "Verifica se podemos ver 'Hit' vs 'Miss' (economia de servidor).",
    query: `
      query {
        viewer {
          zones(filter: { zoneTag: "${CONFIG.ZONE_ID}" }) {
            httpRequestsAdaptiveGroups(
              limit: 5, 
              filter: { datetime_geq: "${isoStart}", datetime_lt: "${isoEnd}" }, 
              orderBy: [count_DESC]
            ) {
              count
              dimensions { cacheStatus }
            }
          }
        }
      }
    `
  },
  {
    name: "3. SAÚDE DA API (Status Codes)",
    description: "Verifica erros 500, 404 e sucessos 200.",
    query: `
      query {
        viewer {
          zones(filter: { zoneTag: "${CONFIG.ZONE_ID}" }) {
            httpRequestsAdaptiveGroups(
              limit: 5, 
              filter: { datetime_geq: "${isoStart}", datetime_lt: "${isoEnd}" }, 
              orderBy: [count_DESC]
            ) {
              count
              dimensions { edgeResponseStatus }
            }
          }
        }
      }
    `
  },
  {
    name: "4. GEOGRAFIA (Top Países)",
    description: "Verifica origem dos usuários.",
    query: `
      query {
        viewer {
          zones(filter: { zoneTag: "${CONFIG.ZONE_ID}" }) {
            httpRequestsAdaptiveGroups(
              limit: 5, 
              filter: { datetime_geq: "${isoStart}", datetime_lt: "${isoEnd}" }, 
              orderBy: [count_DESC]
            ) {
              count
              dimensions { clientCountryName }
            }
          }
        }
      }
    `
  },
  // Item 5 (Firewall) removido pois o token não tem permissão de acesso.
  {
    name: "6. BANCO DE DADOS (D1)",
    description: "Verifica leituras e escritas no D1 (Usa date_geq pois aceita janelas maiores).",
    query: `
      query {
        viewer {
          accounts(filter: { accountTag: "${CONFIG.ACCOUNT_ID}" }) {
            d1AnalyticsAdaptiveGroups(limit: 1, filter: { date_geq: "${isoStart.split('T')[0]}" }) {
              sum { readQueries, writeQueries }
            }
          }
        }
      }
    `
  }
];

async function runAudit() {
  for (const test of queries) {
    console.log(`👉 Testando: ${test.name}`);
    console.log(`   INFO: ${test.description}`);
    
    try {
      const response = await fetch('https://api.cloudflare.com/client/v4/graphql', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${CONFIG.API_TOKEN}`
        },
        body: JSON.stringify({ query: test.query })
      });

      const data = await response.json();

      if (data.errors) {
        console.log(`❌ FALHOU: ${data.errors[0].message}`);
      } else {
        const zoneData = data.data?.viewer?.zones?.[0];
        const accountData = data.data?.viewer?.accounts?.[0];
        
        // Pega o resultado válido (Zona ou Conta)
        const result = zoneData || accountData || {};
        
        // Formata para exibição limpa no console
        const jsonPreview = JSON.stringify(result, null, 2).replace(/\n/g, '\n   ');
        
        console.log(`✅ APROVADO! Dados recebidos:`);
        console.log(`   ${jsonPreview}`);
      }
    } catch (e) {
      console.log(`❌ ERRO CRÍTICO DE REDE: ${e.message}`);
    }
    console.log("------------------------------------------------------------\n");
  }
}

runAudit();