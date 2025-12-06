/* eslint-disable perfectionist/sort-imports */
import axios, { type AxiosRequestConfig, type InternalAxiosRequestConfig } from 'axios';

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
// ✅ Endpoints centralizados — com calendário corrigido
// ----------------------------------------------------------------------

export const endpoints = {
  auth: {
    me: '/auth/me',
    signIn: '/auth/sign-in',
    signUp: '/auth/sign-up',
  },

  proposals: {
    list: '/proposals/list',
    details: '/proposals/details',
    vote: '/proposals/vote',
  },

  post: {
    list: '/post/list',
    details: '/post/details',
    latest: '/post/latest',
    search: '/post/search',
  },

  calendar: {
    list: '/calendar/list',
    create: '/calendar/create',
    update: '/calendar/update',
    delete: '/calendar/delete',
  },
} as const;
