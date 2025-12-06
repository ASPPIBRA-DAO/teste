// src/auth/types.ts

export type UserType = Record<string, any> | null;

export type AuthState = {
  user: UserType;
  loading: boolean;
};

// ----------------------------------------------------------------------

export type AuthContextValue = {
  user: UserType;
  loading: boolean;
  authenticated: boolean;
  unauthenticated: boolean;
  checkUserSession?: () => Promise<void>;

  // ✅ ADICIONADO: Definições de tipo para as funções que implementamos no AuthProvider
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, firstName: string, lastName: string) => Promise<void>;
  logout: () => Promise<void>;
};