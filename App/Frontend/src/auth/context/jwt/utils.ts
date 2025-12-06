import { paths } from 'src/routes/paths';

import axios from 'src/lib/axios';

// ----------------------------------------------------------------------

export function jwtDecode(token: string) {
  try {
    if (!token) return null;

    const parts = token.split('.');
    if (parts.length < 2) {
      throw new Error('Token inválido: formato incorreto (faltam partes)');
    }

    const base64Url = parts[1];

    // 1. Substitui caracteres URL-safe pelos padrão Base64
    let base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');

    // 2. CORREÇÃO CRÍTICA: Adiciona o Padding (=) obrigatório para o atob funcionar
    const padding = base64.length % 4;
    if (padding) {
      base64 += '='.repeat(4 - padding);
    }

    // 3. Decodifica e trata caracteres UTF-8 corretamente
    const jsonPayload = decodeURIComponent(
      window
        .atob(base64)
        .split('')
        .map((c) => `%${`00${c.charCodeAt(0).toString(16)}`.slice(-2)}`)
        .join('')
    );

    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error('Erro ao decodificar JWT:', error);
    return null;
  }
}

// ----------------------------------------------------------------------

export function isValidToken(accessToken: string) {
  if (!accessToken) {
    return false;
  }

  try {
    const decoded = jwtDecode(accessToken);

    // Se não conseguiu decodificar ou não tem validade (exp)
    if (!decoded || !('exp' in decoded)) {
      console.warn('Token inválido ou sem campo de expiração (exp):', decoded);
      return false;
    }

    const currentTime = Date.now() / 1000;

    // Log para ajudar a entender por que o login cai
    // console.log(`[Auth] Token expira em: ${decoded.exp} | Agora: ${currentTime}`);

    return decoded.exp > currentTime;
  } catch (error) {
    console.error('Erro na validação do token:', error);
    return false;
  }
}

// ----------------------------------------------------------------------

export function tokenExpired(exp: number) {
  const currentTime = Date.now();
  const timeLeft = exp * 1000 - currentTime;

  // Se já expirou, limpa a sessão imediatamente
  if (timeLeft <= 0) {
    sessionExpiredAction();
    return;
  }

  // Define o timer para deslogar automaticamente
  setTimeout(() => {
    try {
      console.warn('Sessão expirada pelo timer.');
      sessionExpiredAction();
    } catch (error) {
      console.error('Erro no timer de expiração:', error);
    }
  }, timeLeft);
}

// Ação centralizada para limpar dados e redirecionar
const sessionExpiredAction = () => {
  localStorage.removeItem('accessToken');
  delete axios.defaults.headers.common.Authorization;
  window.location.href = paths.auth.jwt.signIn;
};

// ----------------------------------------------------------------------

export async function setSession(accessToken: string | null) {
  try {
    if (accessToken) {
      // ✅ Salva no LocalStorage com a chave 'accessToken' (padrão do projeto)
      localStorage.setItem('accessToken', accessToken);

      // ✅ Configura o Axios Header Globalmente
      axios.defaults.headers.common.Authorization = `Bearer ${accessToken}`;

      const decodedToken = jwtDecode(accessToken);

      if (decodedToken && 'exp' in decodedToken) {
        tokenExpired(decodedToken.exp);
      } else {
        // Se o backend enviar um token sem 'exp', avisamos no console mas não bloqueamos
        // console.warn('Aviso: Token recebido não possui expiração definida.');
      }
    } else {
      // Logout
      localStorage.removeItem('accessToken');
      delete axios.defaults.headers.common.Authorization;
    }
  } catch (error) {
    console.error('Erro ao salvar sessão:', error);
    throw error;
  }
}