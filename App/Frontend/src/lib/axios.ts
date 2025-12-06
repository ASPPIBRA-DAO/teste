import type { AxiosRequestConfig } from 'axios';

import axios from 'axios';

import { CONFIG } from 'src/global-config';

// ----------------------------------------------------------------------

// Certifique-se que CONFIG.serverUrl é a URL do seu Worker (ex: https://api.gov-system.workers.dev)
const axiosInstance = axios.create({
  baseURL: CONFIG.serverUrl,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ----------------------------------------------------------------------
// ✅ 1. ATIVAR O INTERCEPTOR (Estava comentado)
// Isso garante que TODA requisição leve o token, mesmo se der F5 na página.
// ----------------------------------------------------------------------
axiosInstance.interceptors.request.use(
  (config) => {
    // Deve usar a mesma chave definida em 'constant.ts' (geralmente 'accessToken')
    const token = localStorage.getItem('accessToken'); 
    
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ----------------------------------------------------------------------
// ✅ 2. MELHORIA NO TRATAMENTO DE ERROS
// ----------------------------------------------------------------------
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    // Preserva o objeto de erro original para podermos checar o status (ex: 401)
    const customError = {
      message: error?.response?.data?.message || error?.message || 'Algo deu errado!',
      status: error?.response?.status,
      data: error?.response?.data,
    };
    
    console.error('API Error:', customError.message);
    
    // Retornamos o erro rejeitado para que o UI possa reagir (ex: mostrar toast)
    return Promise.reject(customError);
  }
);

export default axiosInstance;

// ----------------------------------------------------------------------

export const fetcher = async <T = unknown>(
  args: string | [string, AxiosRequestConfig]
): Promise<T> => {
  try {
    const [url, config] = Array.isArray(args) ? args : [args, {}];
    const res = await axiosInstance.get<T>(url, config);
    return res.data;
  } catch (error) {
    console.error('Fetcher failed:', error);
    throw error;
  }
};

// ----------------------------------------------------------------------
// ✅ 3. VERIFICAÇÃO DE ROTAS (Crucial para Hono)
// ----------------------------------------------------------------------
export const endpoints = {
  // Removi endpoints de template (chat, kanban) que não são essenciais agora
  auth: {
    me: '/auth/me',        // Removi o prefixo /api se seu Hono não usar
    signIn: '/auth/sign-in', 
    signUp: '/auth/sign-up',
  },
  // Exemplo de rotas para o Gov-System
  proposals: {
    list: '/proposals/list',
    details: '/proposals/details',
    vote: '/proposals/vote',
  },
  // ✅ ADICIONADO: Rotas de post para corrigir o erro no blog-ssr.ts
  post: {
    list: '/post/list',
    details: '/post/details',
    latest: '/post/latest',
    search: '/post/search',
  },
} as const;