'use client';

// ✅ CORREÇÃO: "parent-type" (Tipos) deve vir ANTES de "external" (React/Libs)
import type { AuthState } from '../../types';

import { useSetState } from 'minimal-shared/hooks';
import { useMemo, useEffect, useCallback } from 'react';

import axios from 'src/lib/axios';
import { supabase } from 'src/lib/supabase';

import { AuthContext } from '../auth-context';

// ----------------------------------------------------------------------

type Props = {
  children: React.ReactNode;
};

export function AuthProvider({ children }: Props) {
  const { state, setState } = useSetState<AuthState>({ user: null, loading: true });

  const checkUserSession = useCallback(async () => {
    try {
      const {
        data: { session },
        error,
      } = await supabase.auth.getSession();

      if (error) {
        setState({ user: null, loading: false });
        console.error(error);
        throw error;
      }

      if (session) {
        const accessToken = session?.access_token;

        setState({ user: { ...session, ...session?.user }, loading: false });
        axios.defaults.headers.common.Authorization = `Bearer ${accessToken}`;
      } else {
        setState({ user: null, loading: false });
        delete axios.defaults.headers.common.Authorization;
      }
    } catch (error) {
      console.error(error);
      setState({ user: null, loading: false });
    }
  }, [setState]);

  useEffect(() => {
    checkUserSession();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ----------------------------------------------------------------------
  // Funções obrigatórias para satisfazer o TypeScript (Build)
  // ----------------------------------------------------------------------

  const login = useCallback(async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;

    if (data.session) {
      const accessToken = data.session.access_token;
      axios.defaults.headers.common.Authorization = `Bearer ${accessToken}`;
      setState({ user: { ...data.session, ...data.user }, loading: false });
    }
  }, [setState]);

  const register = useCallback(async (email: string, password: string, firstName: string, lastName: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          firstName,
          lastName,
          displayName: `${firstName} ${lastName}`,
        },
      },
    });

    if (error) throw error;

    if (data.session) {
      const accessToken = data.session.access_token;
      axios.defaults.headers.common.Authorization = `Bearer ${accessToken}`;
      setState({ user: { ...data.session, ...data.user }, loading: false });
    }
  }, [setState]);

  const logout = useCallback(async () => {
    await supabase.auth.signOut();
    delete axios.defaults.headers.common.Authorization;
    setState({ user: null, loading: false });
  }, [setState]);

  // ----------------------------------------------------------------------

  const checkAuthenticated = state.user ? 'authenticated' : 'unauthenticated';

  const status = state.loading ? 'loading' : checkAuthenticated;

  const memoizedValue = useMemo(
    () => ({
      user: state.user
        ? {
          ...state.user,
          id: state.user?.id,
          accessToken: state.user?.access_token,
          displayName: state.user?.user_metadata?.display_name || state.user?.email,
          role: state.user?.role ?? 'admin',
        }
        : null,
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