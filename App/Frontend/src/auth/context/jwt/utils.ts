import { paths } from 'src/routes/paths';

import axios from 'src/lib/axios';

import { JWT_STORAGE_KEY } from './constant';

// ----------------------------------------------------------------------

export function jwtDecode(token: string) {
  try {
    if (!token) return null;

    const parts = token.split('.');
    if (parts.length < 2) {
      throw new Error('Invalid token!');
    }

    const base64Url = parts[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    
    // Correção para caracteres UTF-8 (acentos em nomes, etc.)
    const jsonPayload = decodeURIComponent(
      window
        .atob(base64)
        .split('')
        .map((c) => `%${`00${c.charCodeAt(0).toString(16)}`.slice(-2)}`)
        .join('')
    );

    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error('Error decoding token:', error);
    return null; // Retorna null em vez de estourar erro para não quebrar a UI
  }
}

// ----------------------------------------------------------------------

export function isValidToken(accessToken: string) {
  if (!accessToken) {
    return false;
  }

  try {
    const decoded = jwtDecode(accessToken);

    if (!decoded || !('exp' in decoded)) {
      return false;
    }

    const currentTime = Date.now() / 1000;

    return decoded.exp > currentTime;
  } catch (error) {
    console.error('Error during token validation:', error);
    return false;
  }
}

// ----------------------------------------------------------------------

export function tokenExpired(exp: number) {
  // Opcional: só define o timeout se faltar menos de X dias para evitar overflow de integer em 32-bit
  const currentTime = Date.now();
  const timeLeft = exp * 1000 - currentTime;

  // Se o token já expirou ou expira logo, limpa tudo.
  if (timeLeft <= 0) {
      sessionExpiredAction();
      return;
  }

  // Define o timer para deslogar automaticamente
  setTimeout(() => {
    try {
      // UX Melhorada: Não usar alert. Apenas redirecionar.
      sessionExpiredAction();
    } catch (error) {
      console.error('Error during token expiration:', error);
    }
  }, timeLeft);
}

// Função auxiliar para limpar e redirecionar
const sessionExpiredAction = () => {
    localStorage.removeItem(JWT_STORAGE_KEY); // Usa localStorage
    delete axios.defaults.headers.common.Authorization;
    window.location.href = paths.auth.jwt.signIn; // Redirecionamento forçado
};

// ----------------------------------------------------------------------

export async function setSession(accessToken: string | null) {
  try {
    if (accessToken) {
      // ✅ CORREÇÃO: Alinhado com axios.ts (localStorage)
      localStorage.setItem(JWT_STORAGE_KEY, accessToken);

      axios.defaults.headers.common.Authorization = `Bearer ${accessToken}`;

      const decodedToken = jwtDecode(accessToken); 

      if (decodedToken && 'exp' in decodedToken) {
        tokenExpired(decodedToken.exp);
      } else {
        throw new Error('Invalid access token!');
      }
    } else {
      // Logout
      localStorage.removeItem(JWT_STORAGE_KEY);
      delete axios.defaults.headers.common.Authorization;
    }
  } catch (error) {
    console.error('Error during set session:', error);
    throw error;
  }
}