'use client';

import axios, { endpoints } from 'src/lib/axios';

import { setSession } from './utils';

// ----------------------------------------------------------------------

export type SignInParams = {
  email: string;
  password: string;
};

export type SignUpParams = {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
};

// Interface auxiliar para o que o Backend Hono deve retornar
interface AuthResponse {
  accessToken: string;
  user?: any; // Opcional: Se seu backend retornar o objeto do usuário, ajuda a atualizar o estado
}

/** **************************************
 * Sign in
 *************************************** */
export const signInWithPassword = async ({ email, password }: SignInParams): Promise<void> => {
  try {
    const params = { email, password };

    // Tipando o retorno do axios para garantir segurança
    const res = await axios.post<AuthResponse>(endpoints.auth.signIn, params);

    const { accessToken } = res.data;

    if (!accessToken) {
      throw new Error('Access token not found in response');
    }

    // ✅ CORRETO: Usa a função utilitária que configura o Axios Header
    setSession(accessToken);
    
  } catch (error) {
    console.error('Error during sign in:', error);
    throw error; // Re-lança para a UI mostrar o alerta de erro
  }
};

/** **************************************
 * Sign up
 *************************************** */
export const signUp = async ({
  email,
  password,
  firstName,
  lastName,
}: SignUpParams): Promise<void> => {
  const params = {
    email,
    password,
    firstName,
    lastName,
  };

  try {
    const res = await axios.post<AuthResponse>(endpoints.auth.signUp, params);

    const { accessToken } = res.data;

    if (!accessToken) {
      throw new Error('Access token not found in response');
    }

    // 🔧 CORREÇÃO APLICADA:
    // Antes estava: sessionStorage.setItem(...) 
    // Agora usa setSession para garantir que o Axios Header seja atualizado imediatamente
    setSession(accessToken);

  } catch (error) {
    console.error('Error during sign up:', error);
    throw error;
  }
};

/** **************************************
 * Sign out
 *************************************** */
export const signOut = async (): Promise<void> => {
  try {
    // Remove token do storage e limpa o header do Axios
    await setSession(null); 
  } catch (error) {
    console.error('Error during sign out:', error);
    throw error;
  }
};