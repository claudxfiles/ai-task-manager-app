import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function POST(req: NextRequest) {
  try {
    console.log('Iniciando create-checkout-session');
    
    // Inicializar el cliente de Supabase
    const cookieStore = cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value;
          },
          set(name: string, value: string, options: any) {
            cookieStore.set({ name, value, ...options });
          },
          remove(name: string, options: any) {
            cookieStore.set({ name, value: '', ...options });
          },
        },
      }
    );

    // Verificar autenticación
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      console.error('Error: Usuario no autenticado');
      return NextResponse.json(
        { error: 'No autenticado' },
        { status: 401 }
      );
    }

    console.log('Usuario autenticado:', session.user.email);

    // Obtener datos del cuerpo de la solicitud
    const body = await req.json();
    const { plan_id } = body;

    if (!plan_id) {
      console.error('Error: plan_id no proporcionado');
      return NextResponse.json(
        { error: 'Se requiere plan_id' },
        { status: 400 }
      );
    }

    console.log('Plan seleccionado:', plan_id);
    console.log('BACKEND_URL:', process.env.BACKEND_URL);

    // Hacer solicitud al backend
    const backendUrl = `${process.env.BACKEND_URL}/api/subscriptions/create-subscription`;
    console.log('Haciendo solicitud a:', backendUrl);
    
    const response = await fetch(backendUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({ plan_id }),
    });

    console.log('Respuesta del backend status:', response.status);
    
    const responseData = await response.json();
    console.log('Respuesta del backend data:', responseData);

    if (!response.ok) {
      console.error('Error del backend:', responseData);
      return NextResponse.json(
        { error: responseData.detail || 'Error al crear la suscripción' },
        { status: response.status }
      );
    }

    console.log('Suscripción creada exitosamente:', responseData);
    return NextResponse.json(responseData);
  } catch (error) {
    console.error('Error en create-checkout-session:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
} 