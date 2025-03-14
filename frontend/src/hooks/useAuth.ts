import { useSession, signOut } from 'next-auth/react';

export function useAuth() {
  const { data: session, status } = useSession();

  const logout = async () => {
    await signOut({ callbackUrl: '/auth/login' });
  };

  return {
    user: session?.user,
    isAuthenticated: status === 'authenticated',
    isLoading: status === 'loading',
    logout,
  };
} 