import type { ButtonProps } from '@mui/material/Button';

import { useCallback } from 'react';
// REMOVIDO: import { useAuth0 } from '@auth0/auth0-react';

import Button from '@mui/material/Button';

import { useRouter } from 'src/routes/hooks';

import { CONFIG } from 'src/global-config';

import { toast } from 'src/components/snackbar';

import { useAuthContext } from 'src/auth/hooks';
// ✅ MANTIDO: Apenas JWT e Supabase (opcional)
import { signOut as jwtSignOut } from 'src/auth/context/jwt/action';
import { signOut as supabaseSignOut } from 'src/auth/context/supabase/action';

// REMOVIDO: Amplify e Firebase
// import { signOut as amplifySignOut } from 'src/auth/context/amplify/action';
// import { signOut as firebaseSignOut } from 'src/auth/context/firebase/action';

// ----------------------------------------------------------------------

// Lógica Simplificada: Se não for Supabase, usa JWT por padrão.
const signOut = CONFIG.auth.method === 'supabase' ? supabaseSignOut : jwtSignOut;

type Props = ButtonProps & {
  onClose?: () => void;
};

export function SignOutButton({ onClose, sx, ...other }: Props) {
  const router = useRouter();

  const { checkUserSession } = useAuthContext();

  // REMOVIDO: Hook do Auth0
  // const { logout: signOutAuth0 } = useAuth0();

  const handleLogout = useCallback(async () => {
    try {
      await signOut();
      await checkUserSession?.();

      onClose?.();
      router.refresh();
    } catch (error) {
      console.error(error);
      toast.error('Unable to logout!');
    }
  }, [checkUserSession, onClose, router]);

  // REMOVIDO: handleLogoutAuth0

  return (
    <Button
      fullWidth
      variant="soft"
      size="large"
      color="error"
      onClick={handleLogout} // Usa sempre o handleLogout padrão
      sx={sx}
      {...other}
    >
      Logout
    </Button>
  );
}