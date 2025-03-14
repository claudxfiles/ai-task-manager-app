import NextAuth from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { cookies } from 'next/headers'

const handler = NextAuth({
  providers: [
    CredentialsProvider({
      id: "credentials",
      name: "Credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        // En modo demo, permitimos cualquier credencial
        if (credentials?.username) {
          // Establecer la cookie de demo
          cookies().set('demo_session', 'true', {
            path: '/',
            maxAge: 24 * 60 * 60, // 24 horas
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax'
          });

          return {
            id: "1",
            name: credentials.username,
            email: `${credentials.username}@demo.com`,
            accessToken: "demo_token" // Token de acceso demo
          }
        }
        return null
      }
    })
  ],
  session: {
    strategy: "jwt",
    maxAge: 24 * 60 * 60, // 24 hours
  },
  pages: {
    signIn: '/auth/login',
    error: '/auth/error'
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.name = user.name
        token.email = user.email
        token.accessToken = user.accessToken
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
        session.user.name = token.name as string
        session.user.email = token.email as string
        session.accessToken = token.accessToken as string
      }
      return session
    }
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === 'development'
})

export { handler as GET, handler as POST } 