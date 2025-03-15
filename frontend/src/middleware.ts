import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { createServerClient } from '@supabase/ssr';

export async function middleware(req: NextRequest) {
  // Inicializar el cliente de Supabase
  const res = NextResponse.next();
  
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get: (name) => req.cookies.get(name)?.value,
        set: (name, value, options) => {
          res.cookies.set(name, value, options);
        },
        remove: (name, options) => {
          res.cookies.set(name, '', { ...options, maxAge: 0 });
        },
      },
    }
  );
  
  // Verificar sesión de Supabase
  const { data: { session: supabaseSession } } = await supabase.auth.getSession();
  
  // Verificar token de NextAuth
  const nextAuthToken = await getToken({ req });
  
  // Verificar si hay una sesión demo en las cookies
  const demoSession = req.cookies.get("demo_session")?.value === "true";
  
  // Si hay un token de NextAuth, una sesión de Supabase o una sesión demo, permitir el acceso
  if (nextAuthToken || supabaseSession || demoSession) {
    return res;
  }
  
  // Redirigir a la página de login si no hay autenticación
  const url = req.nextUrl.clone();
  url.pathname = "/auth/login";
  url.search = `?callbackUrl=${encodeURIComponent(req.nextUrl.pathname)}`;
  return NextResponse.redirect(url);
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/settings/:path*",
    "/profile/:path*",
    "/tasks/:path*",
    "/goals/:path*",
    "/chat/:path*",
  ],
}; 