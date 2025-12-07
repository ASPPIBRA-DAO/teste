// Arquivo: /home/sandro/teste/App/Backend/worker/test-d1-direct.mjs

// ⚠️ DADOS HARDCODED APENAS PARA TESTE DE CONEXÃO
// Se isso funcionar, o problema está na leitura do arquivo .env (espaços, quebras de linha)

const CONFIG = {
    accountId: "5d91807e648c183cb7833caa06dbcbdb",
    databaseId: "fbdff5ac-2fcc-4182-9cbf-be6c1d08e287",
    token: "dHc5Az-ATuJo4bVelU0knAyKcMlT3YeEr1Z_EyXR" // O token novo que funcionou no CURL
};

async function runTest() {
    console.log("🔄 TESTE DIRETO (Sem .env)...");
    console.log(`🆔 Database: ${CONFIG.databaseId}`);
    console.log(`🔑 Token (4 finais): ...${CONFIG.token.slice(-4)}`);

    const url = `https://api.cloudflare.com/client/v4/accounts/${CONFIG.accountId}/d1/database/${CONFIG.databaseId}/query`;

    try {
        const sql = "SELECT name FROM sqlite_master WHERE type='table' LIMIT 5;";
        console.log(`\n📡 Consultando tabelas...`);

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${CONFIG.token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ sql })
        });

        const data = await response.json();

        if (!data.success) {
            console.error("\n❌ ERRO API CLOUDFLARE:");
            console.log(JSON.stringify(data.errors, null, 2));
        } else {
            console.log("\n✅ SUCESSO TOTAL!");
            console.log("📊 Tabelas encontradas no banco:");
            // Se users aparecer aqui, a conexão é perfeita
            console.table(data.result[0].results);
        }

    } catch (err) {
        console.error("❌ Erro de Rede/Script:", err);
    }
}

runTest();