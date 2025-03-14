import { signIn, signOut, useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export function useAuth() {
  const router = useRouter();
  const { data: session, status } = useSession();

  const login = async () => {
    try {
      await signIn('google', { callbackUrl: '/dashboard' });
    } catch (error) {
      console.error('Error during sign in:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await signOut({ callbackUrl: '/auth/login' });
    } catch (error) {
      console.error('Error during sign out:', error);
      throw error;
    }
  };

  return {
    user: session?.user,
    isAuthenticated: status === 'authenticated',
    isLoading: status === 'loading',
    login,
    logout,
  };
} 