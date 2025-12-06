'use client';

import { useState, useEffect, useCallback } from 'react';

import { paths } from 'src/routes/paths';
import { useRouter, usePathname } from 'src/routes/hooks';

import { CONFIG } from 'src/global-config';

import { SplashScreen } from 'src/components/loading-screen';

import { useAuthContext } from '../hooks';

// ----------------------------------------------------------------------

type AuthGuardProps = {
  children: React.ReactNode;
};

// LIMPEZA: Removemos referências a Auth0, Firebase e Amplify.
// Mantivemos apenas JWT (o padrão) e Supabase (como opção futura).
const signInPaths = {
  jwt: paths.auth.jwt.signIn,
  supabase: paths.auth.supabase.signIn,
};

export function AuthGuard({ children }: AuthGuardProps) {
  const router = useRouter();
  const pathname = usePathname();

  const { authenticated, loading } = useAuthContext();

  const [isChecking, setIsChecking] = useState(true);

  const createRedirectPath = useCallback((currentPath: string) => {
    // Adiciona o parâmetro ?returnTo=/pagina-que-eu-queria
    const queryString = new URLSearchParams({ returnTo: pathname }).toString();
    return `${currentPath}?${queryString}`;
  }, [pathname]);

  // Envolvemos em useCallback para evitar loops de renderização no useEffect
  const checkPermissions = useCallback(async () => {
    if (loading) {
      return;
    }

    if (!authenticated) {
      const { method } = CONFIG.auth;

      // Segurança: Se o método no config não existir no signInPaths (erro de config),
      // fallback para JWT padrão para evitar crash.
      // ✅ CORREÇÃO: Removido o @ts-expect-error pois o TypeScript já valida corretamente
      // que 'method' bate com as chaves de 'signInPaths'.
      const signInPath = signInPaths[method] || paths.auth.jwt.signIn;

      const redirectPath = createRedirectPath(signInPath);

      router.replace(redirectPath);
      return;
    }

    setIsChecking(false);
  }, [authenticated, loading, createRedirectPath, router]);

  useEffect(() => {
    checkPermissions();
  }, [checkPermissions]);

  if (isChecking) {
    return <SplashScreen />;
  }

  return <>{children}</>;
}