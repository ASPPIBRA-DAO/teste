import { Hono } from 'hono';
import { sign } from 'hono/jwt'; // ✅ Correção: Usando JWT nativo do Hono (Edge Compatible)
import { compare, hash } from 'bcryptjs';
import { Database } from '../db';
import { users } from '../db/schema';
import { eq } from 'drizzle-orm';

// Definimos o que esperar do Contexto
type Variables = {
  db: Database;
};

type Bindings = {
  JWT_SECRET: string;
};

const auth = new Hono<{ Bindings: Bindings; Variables: Variables }>();

// ----------------------------------------------------------------------
// Rota de LOGIN (Alterado de /login para /sign-in para bater com o Frontend)
// ----------------------------------------------------------------------
auth.post('/sign-in', async (c) => {
  try {
    const db = c.get('db'); 
    const { email, password } = await c.req.json();

    if (!email || !password) {
      return c.json({ error: 'Email e senha são obrigatórios' }, 400);
    }

    // Busca usuário
    const result = await db.select().from(users).where(eq(users.email, email)).limit(1);
    const user = result[0];

    if (!user) {
      return c.json({ error: 'Credenciais inválidas' }, 401);
    }

    // Compara senha (bcryptjs funciona bem no Edge)
    const isValid = await compare(password, user.password);

    if (!isValid) {
      return c.json({ error: 'Credenciais inválidas' }, 401);
    }

    // Gera o Token usando Hono JWT
    const accessToken = await sign(
      { 
        userId: user.id, 
        email: user.email,
        role: 'user', // ou user.role
        exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 7, // 7 dias
      },
      c.env.JWT_SECRET
    );

    // Retorna exatamente o formato que o Frontend action.ts espera
    return c.json({ 
      accessToken, 
      user: { 
        id: user.id, 
        email: user.email,
        firstName: user.firstName, // Se tiver no banco
        lastName: user.lastName    // Se tiver no banco
      } 
    });

  } catch (error) {
    console.error('Erro no login:', error);
    return c.json({ error: 'Erro interno no servidor' }, 500);
  }
});

// ----------------------------------------------------------------------
// Rota de REGISTRO (Adicionado para completar o fluxo do Frontend)
// ----------------------------------------------------------------------
auth.post('/sign-up', async (c) => {
  try {
    const db = c.get('db');
    const { email, password, firstName, lastName } = await c.req.json();

    if (!email || !password) {
      return c.json({ error: 'Dados incompletos' }, 400);
    }

    // 1. Verifica se usuário já existe
    const existingUser = await db.select().from(users).where(eq(users.email, email)).limit(1);
    if (existingUser.length > 0) {
      return c.json({ error: 'Este email já está em uso' }, 409);
    }

    // 2. Criptografa a senha
    const passwordHash = await hash(password, 10);

    // 3. Insere no banco
    // NOTA: Dependendo do seu schema, o ID pode ser autogerado. 
    // Se for UUID manual, precisaria gerar aqui. Assumindo autoincrement ou UUID default do banco.
    const newUser = await db.insert(users).values({
      email,
      password: passwordHash,
      firstName,
      lastName,
      // role: 'user', // Defina um padrão se necessário
      // createdAt: new Date()
    }).returning(); // .returning() funciona no D1/Postgres para devolver o dado criado

    const user = newUser[0];

    // 4. Já loga o usuário direto após o cadastro
    const accessToken = await sign(
      { userId: user.id, email: user.email, role: 'user', exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 7 },
      c.env.JWT_SECRET
    );

    return c.json({ 
      accessToken, 
      user: { id: user.id, email: user.email, firstName, lastName } 
    });

  } catch (error) {
    console.error('Erro no registro:', error);
    return c.json({ error: 'Erro ao criar conta' }, 500);
  }
});

export default auth;