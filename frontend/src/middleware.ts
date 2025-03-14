import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

export default async function middleware(req: NextRequest) {
  // Verificar token de NextAuth
  const token = await getToken({ req });
  
  // Verificar si hay una sesión demo en las cookies
  const demoSession = req.cookies.get("demo_session")?.value === "true";
  
  // Si hay un token de NextAuth o una sesión demo, permitir el acceso
  if (token || demoSession) {
    return NextResponse.next();
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