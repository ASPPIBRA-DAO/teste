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
// ✅ 1. ATIVAR O INTERCEPTOR
// ----------------------------------------------------------------------
axiosInstance.interceptors.request.use(
  (config) => {
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
    const customError = {
      message: error?.response?.data?.message || error?.message || 'Algo deu errado!',
      status: error?.response?.status,
      data: error?.response?.data,
    };

    console.error('API Error:', customError.message);

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
// ✅ 3. VERIFICAÇÃO DE ROTAS (com calendário corrigido)
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

  // ✅ NOVO — NECESSÁRIO PARA src/actions/calendar.ts
  calendar: {
    list: '/calendar/list',
    create: '/calendar/create',
    update: '/calendar/update',
    delete: '/calendar/delete',
  },
} as const;
