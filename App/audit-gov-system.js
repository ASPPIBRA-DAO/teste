const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// === CONFIGURAÇÕES DE CAMINHOS ===
// Ajustado para a estrutura real do projeto Gov-System
const ROOT_DIR = process.cwd();
const BACKEND_PATH = path.join(ROOT_DIR, 'App/Backend/worker');
const FRONTEND_PATH = path.join(ROOT_DIR, 'App/Frontend');
const REPORT_FILE = 'RELATORIO_INTEGRACAO.md';

// === CORES PARA O TERMINAL ===
const colors = {
    reset: "\x1b[0m",
    green: "\x1b[32m",
    yellow: "\x1b[33m",
    red: "\x1b[31m",
    cyan: "\x1b[36m",
    bold: "\x1b[1m",
};

// === BUFFER DO RELATÓRIO ===
let reportContent = `# 🛡️ Relatório de Prontidão do Gov-System
**Data:** ${new Date().toLocaleString()}
**Stack:** Next.js (Front) + Hono/Cloudflare (Back) + Drizzle (DB)

---
`;

// === LISTA DE AÇÕES NECESSÁRIAS (TODO LIST) ===
let todoList = [];

// === FUNÇÕES UTILITÁRIAS ===

function log(icon, label, status, color = colors.reset, details = '') {
    // Exibe no terminal
    console.log(`${icon} ${color}${label.padEnd(45)} ... ${status}${colors.reset}`);
    
    // Adiciona ao relatório Markdown
    reportContent += `| ${icon} | ${label} | **${status}** | ${details} |\n`;
    
    // Se for erro, adiciona à lista de tarefas
    if (status.includes('FALHA') || status.includes('AUSENTE') || status.includes('ERRO')) {
        todoList.push(`[ ] **${label}**: ${details || 'Corrigir item'}`);
    }
}

function section(title) {
    console.log(`\n${colors.cyan}${colors.bold}--- ${title} ---${colors.reset}`);
    reportContent += `\n## ${title}\n\n| Item | Verificação | Status | Detalhes |\n|---|---|---|---|\n`;
}

function checkFileExists(basePath, relativePath) {
    const fullPath = path.join(basePath, relativePath);
    return fs.existsSync(fullPath);
}

function checkFileContent(basePath, relativePath, searchString) {
    const fullPath = path.join(basePath, relativePath);
    if (!fs.existsSync(fullPath)) return false;
    try {
        const content = fs.readFileSync(fullPath, 'utf8');
        return content.includes(searchString);
    } catch (e) {
        return false;
    }
}

function runCommand(command, cwd) {
    try {
        execSync(command, { cwd, stdio: 'ignore' }); // stdio ignore para não poluir o terminal
        return true;
    } catch (error) {
        return false;
    }
}

// === AUDITORIA PRINCIPAL ===

async function runAudit() {
    console.clear();
    console.log(`${colors.cyan}${colors.bold}🚀 INICIANDO AUDITORIA DO GOV-SYSTEM${colors.reset}\n`);

    // ---------------------------------------------------------
    // 1. AUDITORIA DO BACKEND (HONO + WORKER)
    // ---------------------------------------------------------
    section('1. BACKEND (Cloudflare Worker)');
    
    if (fs.existsSync(BACKEND_PATH)) {
        
        // 1.1 Dependências
        const pkgPath = path.join(BACKEND_PATH, 'package.json');
        if (fs.existsSync(pkgPath)) {
            const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
            const deps = { ...pkg.dependencies, ...pkg.devDependencies };
            
            // Verifica se mudamos de jsonwebtoken para hono
            if (deps['hono']) log('✅', 'Dep: Hono', 'OK', colors.green, 'Framework Web');
            else log('❌', 'Dep: Hono', 'AUSENTE', colors.red, 'Instalar hono');

            if (deps['drizzle-orm']) log('✅', 'Dep: Drizzle ORM', 'OK', colors.green, 'Database ORM');
            else log('❌', 'Dep: Drizzle ORM', 'AUSENTE', colors.red, 'Necessário para DB');
            
            // Instalação automática se node_modules não existir
            if (!fs.existsSync(path.join(BACKEND_PATH, 'node_modules'))) {
                console.log(`${colors.yellow}   ⚡ Instalando dependências do Backend...${colors.reset}`);
                runCommand('pnpm install', BACKEND_PATH);
            }
        } else {
            log('❌', 'package.json', 'AUSENTE', colors.red, 'Raiz do backend inválida');
        }

        // 1.2 Verificação de Código Crítico (Auth & Schema)
        const authPath = 'src/routes/auth.ts';
        if (checkFileExists(BACKEND_PATH, authPath)) {
            // Verifica se a rota é /sign-in (padrão frontend) e não /login
            checkFileContent(BACKEND_PATH, authPath, '/sign-in')
                ? log('✅', 'Rota: Auth Sign-In', 'CORRETA', colors.green, 'Endpoint /sign-in detectado')
                : log('❌', 'Rota: Auth Sign-In', 'ERRO', colors.red, 'Esperava rota /sign-in');

            // Verifica se está usando a lib certa (Hono JWT e não Node JWT)
            checkFileContent(BACKEND_PATH, authPath, 'hono/jwt')
                ? log('✅', 'Lib: JWT Edge', 'CORRETA', colors.green, 'Usando hono/jwt')
                : log('❌', 'Lib: JWT Edge', 'ERRO', colors.red, 'Remover jsonwebtoken, usar hono/jwt');
        } else {
            log('❌', 'Arquivo src/routes/auth.ts', 'AUSENTE', colors.red, 'Arquivo de rotas faltando');
        }

        // 1.3 Verificação do Banco de Dados
        const schemaPath = 'src/db/schema.ts';
        if (checkFileExists(BACKEND_PATH, schemaPath)) {
            // Verifica se adicionamos firstName/lastName
            checkFileContent(BACKEND_PATH, schemaPath, 'firstName')
                ? log('✅', 'Schema: Campos de Nome', 'ATUALIZADO', colors.green, 'firstName/lastName presentes')
                : log('❌', 'Schema: Campos de Nome', 'DESATUALIZADO', colors.red, 'Falta firstName/lastName');
        } else {
            log('❌', 'Arquivo src/db/schema.ts', 'AUSENTE', colors.red, 'Definição do banco faltando');
        }

        // 1.4 Configuração
        const hasDevVars = checkFileExists(BACKEND_PATH, '.dev.vars');
        hasDevVars
            ? log('✅', 'Config: .dev.vars', 'OK', colors.green, 'Variáveis locais encontradas')
            : log('⚠️', 'Config: .dev.vars', 'AUSENTE', colors.yellow, 'Crie com JWT_SECRET=...');

    } else {
        log('❌', 'Pasta Backend', 'NÃO ENCONTRADA', colors.red, BACKEND_PATH);
    }

    // ---------------------------------------------------------
    // 2. AUDITORIA DO FRONTEND (NEXT.JS)
    // ---------------------------------------------------------
    section('2. FRONTEND (Next.js)');

    if (fs.existsSync(FRONTEND_PATH)) {
        
        // 2.1 Dependências e Instalação
        if (!fs.existsSync(path.join(FRONTEND_PATH, 'node_modules'))) {
            console.log(`${colors.yellow}   ⚡ Instalando dependências do Frontend...${colors.reset}`);
            runCommand('pnpm install', FRONTEND_PATH);
        }

        // 2.2 Variáveis de Ambiente (Next.js usa NEXT_PUBLIC, não VITE)
        const envPath = '.env';
        if (checkFileExists(FRONTEND_PATH, envPath)) {
            checkFileContent(FRONTEND_PATH, envPath, 'NEXT_PUBLIC_HOST_API')
                ? log('✅', 'ENV: API Host', 'CORRETO', colors.green, 'NEXT_PUBLIC_HOST_API definido')
                : log('❌', 'ENV: API Host', 'ERRO', colors.red, 'Use NEXT_PUBLIC_HOST_API');
        } else {
            log('❌', 'Arquivo .env', 'AUSENTE', colors.red, 'Crie na raiz do front');
        }

        // 2.3 Axios (Interceptor)
        const axiosPath = 'src/lib/axios.ts';
        if (checkFileExists(FRONTEND_PATH, axiosPath)) {
            checkFileContent(FRONTEND_PATH, axiosPath, 'config.headers.Authorization')
                ? log('✅', 'Axios: Interceptor', 'ATIVO', colors.green, 'Envia token no header')
                : log('❌', 'Axios: Interceptor', 'INATIVO', colors.red, 'Descomente a injeção do token');
        }

        // 2.4 Auth Utils (Persistência)
        const utilsPath = 'src/auth/context/jwt/utils.ts';
        if (checkFileExists(FRONTEND_PATH, utilsPath)) {
            checkFileContent(FRONTEND_PATH, utilsPath, 'localStorage.setItem')
                ? log('✅', 'Session: Persistência', 'OK', colors.green, 'Usa localStorage')
                : log('❌', 'Session: Persistência', 'ERRO', colors.red, 'Mude sessionStorage para localStorage');
        }

        // 2.5 Auth Actions (Action Clean)
        const actionPath = 'src/auth/context/jwt/action.ts';
        if (checkFileExists(FRONTEND_PATH, actionPath)) {
            checkFileContent(FRONTEND_PATH, actionPath, 'setSession(')
                ? log('✅', 'Action: Login Flow', 'OK', colors.green, 'Chama setSession corretamente')
                : log('❌', 'Action: Login Flow', 'ERRO', colors.red, 'Verifique chamadas manuais de storage');
        }

    } else {
        log('❌', 'Pasta Frontend', 'NÃO ENCONTRADA', colors.red, FRONTEND_PATH);
    }

    // ---------------------------------------------------------
    // 3. RELATÓRIO FINAL
    // ---------------------------------------------------------
    reportContent += `\n## 📝 Plano de Ação\n`;
    
    if (todoList.length === 0) {
        reportContent += `\nParabéns! O sistema está perfeitamente alinhado.`;
        console.log(`\n${colors.green}${colors.bold}🎉 SISTEMA PRONTO PARA RODAR!${colors.reset}`);
        console.log(`\nPara iniciar:`);
        console.log(`1. Terminal Back: ${colors.cyan}cd App/Backend/worker && pnpm dev${colors.reset}`);
        console.log(`2. Terminal Front: ${colors.cyan}cd App/Frontend && pnpm dev${colors.reset}`);
    } else {
        reportContent += todoList.map(item => `- ${item}`).join('\n');
        console.log(`\n${colors.red}${colors.bold}⚠️ AÇÃO NECESSÁRIA: ${todoList.length} itens encontrados.${colors.reset}`);
        console.log(todoList.map(i => `  ${i}`).join('\n'));
    }

    fs.writeFileSync(path.join(ROOT_DIR, REPORT_FILE), reportContent);
    console.log(`${colors.cyan}\n📄 Relatório salvo em: ${REPORT_FILE}${colors.reset}`);
}

runAudit();
