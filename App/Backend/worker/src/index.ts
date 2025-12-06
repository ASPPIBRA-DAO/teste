import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { Bindings } from './types/bindings';
import { createDb, Database } from './db';
import { success, error } from './utils/response';
import userRoutes from './routes/users';
import authRoutes from './routes/auth';
import postRoutes from './routes/posts';

// === DEFINIÇÃO DE TIPOS ===

type Variables = {
  db: Database;
};

type AppType = {
  Bindings: Bindings;
  Variables: Variables;
};

const app = new Hono<AppType>();

// === MIDDLEWARES GLOBAIS ===

// 1. Configuração de CORS
app.use('/*', cors({
  origin: (origin) => {
    const allowedOrigins = [
      'http://localhost:8082',       // Seu Frontend Next.js
      'http://localhost:3000',
      'http://127.0.0.1:8082',
      'https://asppibra.com',
      'https://www.asppibra.com'
    ];

    if (allowedOrigins.includes(origin) || (origin && origin.includes('cloudworkstations.dev'))) {
      return origin;
    }

    if (origin && origin.includes('localhost')) {
      return origin;
    }

    return origin;
  },
  allowHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  allowMethods: ['POST', 'GET', 'OPTIONS', 'PUT', 'DELETE'],
  exposeHeaders: ['Content-Length'],
  maxAge: 600,
  credentials: true,
}));

// 2. Injeção de Dependência do Banco de Dados
app.use(async (c, next) => {
  try {
    const db = createDb(c.env.DB);
    c.set('db', db);
    await next();
  } catch (e) {
    console.error('Erro de conexão DB:', e);
    return error(c, 'Erro interno ao conectar no banco de dados', null, 500);
  }
});

// === ROTAS DE DIAGNÓSTICO (RAIZ) ===

app.get('/', (c) => {
  return success(c, {
    status: 'online',
    service: 'Governance System API',
    version: '1.0.2',
    cors_check: 'enabled'
  }, 'Sistema Operacional');
});

app.get('/health-db', async (c) => {
  const db = c.get('db');
  try {
    const usersList = await db.query.users.findMany({
      limit: 5,
      columns: { id: true, email: true, role: true }
    });

    return success(c, {
      database_connection: 'ok',
      users_found: usersList.length,
      sample: usersList
    }, 'Banco de dados conectado e respondendo');
  } catch (err: any) {
    return error(c, 'Falha ao consultar o banco', err.message, 500);
  }
});

// === ROTAS DA APLICAÇÃO (CORRIGIDO) ===

// 1. Montamos as rotas DIRETAMENTE na raiz
// Isso faz com que http://localhost:8787/auth/sign-up funcione (que é o que o Front chama)
app.route('/users', userRoutes);
app.route('/auth', authRoutes);
app.route('/post', postRoutes);

// 2. (Opcional) Mantemos compatibilidade com /api caso mude a config no futuro
app.route('/api/users', userRoutes);
app.route('/api/auth', authRoutes);
app.route('/api/post', postRoutes);

// === EXPORTAÇÃO ===
export default app;