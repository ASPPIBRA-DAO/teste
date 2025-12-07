// Arquivo: /home/sandro/teste/App/Backend/worker/test-r2.mjs
import { S3Client, ListObjectsV2Command, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import dotenv from 'dotenv';

// Carrega as variáveis do arquivo .env
dotenv.config();

const bucketName = process.env.R2_BUCKET_NAME;

// Configura o Cliente S3 para conectar no Cloudflare R2
const R2 = new S3Client({
    region: "auto",
    endpoint: process.env.R2_ENDPOINT,
    credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY_ID,
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
    },
});

async function runTest() {
    console.log("🔄 Iniciando teste de conexão com R2...");
    console.log(`📂 Bucket Alvo: ${bucketName}`);

    const fileName = "teste-conexao.txt";
    const fileContent = "Olá R2! Conexão bem sucedida em: " + new Date().toISOString();

    try {
        // 1. Tentar UPLOAD
        console.log("\n⬆️  Enviando arquivo de teste...");
        await R2.send(new PutObjectCommand({
            Bucket: bucketName,
            Key: fileName,
            Body: fileContent,
            ContentType: "text/plain",
        }));
        console.log("✅ Upload realizado com sucesso!");

        // 2. Tentar LISTAR
        console.log("\n📋 Listando arquivos no bucket...");
        const list = await R2.send(new ListObjectsV2Command({ Bucket: bucketName }));
        const files = list.Contents || [];
        console.log(`📦 Arquivos encontrados: ${files.length}`);
        files.forEach(f => console.log(`   - ${f.Key} (${f.Size} bytes)`));

        // 3. Tentar DELETAR (Limpeza)
        console.log("\n🗑️  Removendo arquivo de teste...");
        await R2.send(new DeleteObjectCommand({
            Bucket: bucketName,
            Key: fileName,
        }));
        console.log("✅ Arquivo removido. Teste finalizado!");

    } catch (err) {
        console.error("\n❌ ERRO NO TESTE:");
        console.error(err);
    }
}

runTest();