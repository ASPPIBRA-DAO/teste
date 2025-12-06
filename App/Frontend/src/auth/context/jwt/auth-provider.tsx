'use client';

import type { AuthState } from '../../types';

import { useSetState } from 'minimal-shared/hooks';
import { useMemo, useEffect, useCallback } from 'react';

import axios, { endpoints } from 'src/lib/axios';

import { AuthContext } from '../auth-context';
// ✅ CORREÇÃO: Removemos a linha em branco que existia aqui
import { setSession, isValidToken } from './utils';

// ----------------------------------------------------------------------

type Props = {
  children: React.ReactNode;
};

export function AuthProvider({ children }: Props) {
  const { state, setState } = useSetState<AuthState>({
    user: null,
    loading: true,
  });

  // ----------------------------------------------------------------------
  // 1. Verifica a sessão ao carregar a página (F5)
  // ----------------------------------------------------------------------
  const checkUserSession = useCallback(async () => {
    try {
      const accessToken = localStorage.getItem('accessToken');

      if (accessToken && isValidToken(accessToken)) {
        setSession(accessToken);

        const res = await axios.get(endpoints.auth.me);

        const { user } = res.data;

        setState({ user: { ...user, accessToken }, loading: false });
      } else {
        setState({ user: null, loading: false });
      }
    } catch (error) {
      console.error('Erro ao restaurar sessão:', error);
      setSession(null);
      setState({ user: null, loading: false });
    }
  }, [setState]);

  useEffect(() => {
    checkUserSession();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ----------------------------------------------------------------------
  // 2. Login
  // ----------------------------------------------------------------------
  const login = useCallback(async (email: string, password: string) => {
    const res = await axios.post(endpoints.auth.signIn, {
      email,
      password,
    });

    const { accessToken, user } = res.data;

    setSession(accessToken);

    setState({ user: { ...user, accessToken } });
  }, [setState]);

  // ----------------------------------------------------------------------
  // 3. Register
  // ----------------------------------------------------------------------
  const register = useCallback(async (email: string, password: string, firstName: string, lastName: string) => {
    const res = await axios.post(endpoints.auth.signUp, {
      email,
      password,
      firstName,
      lastName,
    });

    const { accessToken, user } = res.data;

    setSession(accessToken);

    setState({ user: { ...user, accessToken } });
  }, [setState]);

  // ----------------------------------------------------------------------
  // 4. Logout
  // ----------------------------------------------------------------------
  const logout = useCallback(async () => {
    setSession(null);
    setState({ user: null });
  }, [setState]);

  // ----------------------------------------------------------------------

  const checkAuthenticated = state.user ? 'authenticated' : 'unauthenticated';

  const status = state.loading ? 'loading' : checkAuthenticated;

  const memoizedValue = useMemo(
    () => ({
      user: state.user ? { ...state.user, role: state.user?.role ?? 'user' } : null,
      checkUserSession,
      loading: status === 'loading',
      authenticated: status === 'authenticated',
      unauthenticated: status === 'unauthenticated',
      // Métodos
      login,
      register,
      logout,
    }),
    [checkUserSession, state.user, status, login, register, logout]
  );

  return <AuthContext.Provider value={memoizedValue}>{children}</AuthContext.Provider>;
}