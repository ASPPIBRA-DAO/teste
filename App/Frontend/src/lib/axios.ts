import axios, {
  type AxiosRequestConfig,
  type InternalAxiosRequestConfig,
} from 'axios';

// 👉 Mantido separado conforme exigência do eslint-plugin-perfectionist
import { CONFIG } from 'src/global-config';

// ----------------------------------------------------------------------
// ✅ Instância principal do Axios
// ----------------------------------------------------------------------

const axiosInstance = axios.create({
  baseURL: CONFIG.serverUrl,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ----------------------------------------------------------------------
// ✅ Interceptor de Requisição — Injeta Token JWT
// ----------------------------------------------------------------------

axiosInstance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const isBrowser = typeof window !== 'undefined';

    if (isBrowser) {
      const token = localStorage.getItem('accessToken');

      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// ----------------------------------------------------------------------
// ✅ Interceptor de Resposta — Tratamento centralizado de erros
// ----------------------------------------------------------------------

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    const customError = {
      message:
        error?.response?.data?.message ||
        error?.message ||
        'Algo deu errado na requisição!',
      status: error?.response?.status || 500,
      data: error?.response?.data || null,
    };

    console.error('API Error:', customError);

    return Promise.reject(customError);
  }
);

export default axiosInstance;

// ----------------------------------------------------------------------
// ✅ Fetcher — usado por SWR ou chamadas simples
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
// ✅ Endpoints centralizados
// ----------------------------------------------------------------------

export const endpoints = {
  // Rotas corrigidas para o seu Backend (Hono)
  auth: {
    me: '/auth/me',
    signIn: '/auth/sign-in',
    signUp: '/auth/sign-up',
  },

  // Rotas customizadas do seu projeto
  proposals: {
    list: '/proposals/list',
    details: '/proposals/details',
    vote: '/proposals/vote',
  },

  // --- RESTAURADOS DO MODELO OFICIAL (Híbrido) ---

  // 🔧 CORREÇÃO: Kanban deve ser STRING nesta versão do template
  kanban: '/api/kanban',

  // 🔧 CORREÇÃO: Calendar deve ser OBJETO
  calendar: {
    list: '/api/calendar/list',
    details: '/api/calendar/details',
    create: '/api/calendar/create',
    update: '/api/calendar/update',
    delete: '/api/calendar/delete',
  },

  mail: {
    list: '/api/mail/list',
    details: '/api/mail/details',
    labels: '/api/mail/labels',
  },

  post: {
    list: '/api/post/list',
    details: '/api/post/details',
    latest: '/api/post/latest',
    search: '/api/post/search',
  },

  product: {
    list: '/api/product/list',
    details: '/api/product/details',
    search: '/api/product/search',
  },

  chat: {
    root: '/chat',
    participants: '/chat/participants',
    room: '/chat/room',
  },
} as const;