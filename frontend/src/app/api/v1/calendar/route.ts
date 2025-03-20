import { NextRequest, NextResponse } from 'next/server';
import { google } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

// Función para crear un cliente autorizado
async function getGoogleCalendarClient(accessToken: string) {
  const auth = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
  auth.setCredentials({ access_token: accessToken });
  return google.calendar({ version: 'v3', auth });
}

// GET: Obtener eventos del calendario
export async function GET(request: NextRequest) {
  try {
    console.log('API Calendar: Recibida solicitud de eventos');
    
    // Obtener parámetros de consulta
    const searchParams = request.nextUrl.searchParams;
    const timeMin = searchParams.get('timeMin');
    const timeMax = searchParams.get('timeMax');
    const calendarId = searchParams.get('calendarId') || 'primary';

    if (!timeMin || !timeMax) {
      console.error('API Calendar: Faltan parámetros timeMin o timeMax');
      return NextResponse.json(
        { error: 'Se requieren parámetros timeMin y timeMax' },
        { status: 400 }
      );
    }

    // Obtener sesión del usuario desde Supabase
    const supabase = createRouteHandlerClient({ cookies });
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
      console.error('API Calendar: No hay sesión de usuario activa');
      return NextResponse.json(
        { error: 'No autorizado - No hay sesión activa' },
        { status: 401 }
      );
    }

    console.log('API Calendar: Sesión de usuario encontrada, verificando token de Google');
    console.log('API Calendar: User ID:', session.user.id);
    console.log('API Calendar: Email:', session.user.email);

    // Obtener el token de Google del usuario
    const googleToken = session.user.user_metadata?.google_token;
    console.log('API Calendar: Metadata del usuario:', JSON.stringify({
      hasMetadata: !!session.user.user_metadata,
      metadataKeys: session.user.user_metadata ? Object.keys(session.user.user_metadata) : [],
      hasGoogleToken: !!googleToken,
      tokenDetails: googleToken ? {
        hasAccessToken: !!googleToken.access_token,
        accessTokenLength: googleToken.access_token ? googleToken.access_token.length : 0,
        hasRefreshToken: !!googleToken.refresh_token,
        expiresAt: googleToken.expires_at ? new Date(googleToken.expires_at * 1000).toISOString() : 'N/A',
        scope: googleToken.scope || 'N/A'
      } : 'No token'
    }));
    
    if (!googleToken || !googleToken.access_token) {
      console.error('API Calendar: Usuario no tiene token de Google válido');
      return NextResponse.json(
        { error: 'Usuario no conectado a Google Calendar o token inválido' },
        { status: 401 }
      );
    }

    // Verificar si el token ha expirado
    if (googleToken.expires_at && googleToken.expires_at < Date.now() / 1000) {
      console.error('API Calendar: Token de Google expirado', {
        expiresAt: new Date(googleToken.expires_at * 1000).toISOString(),
        now: new Date().toISOString()
      });
      return NextResponse.json(
        { error: 'Token de Google Calendar expirado, se requiere reconexión' },
        { status: 401 }
      );
    }

    console.log('API Calendar: Token válido, obteniendo eventos');

    // Crear cliente de Calendar y obtener eventos
    try {
      const calendar = await getGoogleCalendarClient(googleToken.access_token);
      const response = await calendar.events.list({
        calendarId,
        timeMin,
        timeMax,
        singleEvents: true,
        orderBy: 'startTime',
      });

      console.log(`API Calendar: Eventos obtenidos con éxito (${response.data.items?.length || 0} eventos)`);
      return NextResponse.json(response.data.items || []);
    } catch (googleError: any) {
      console.error('API Calendar: Error de Google Calendar API:', 
        googleError?.message, 
        googleError?.response?.data,
        googleError?.response?.status
      );
      
      // Verificar si es un error de autenticación de Google
      if (googleError?.response?.status === 401) {
        return NextResponse.json(
          { error: 'Token de acceso a Google Calendar inválido o expirado (Error 401)' },
          { status: 401 }
        );
      }
      
      throw googleError;
    }
  } catch (error: any) {
    console.error('API Calendar: Error general:', error);
    return NextResponse.json(
      { error: error.message || 'Error al obtener eventos' },
      { status: 500 }
    );
  }
}

// POST: Crear un evento en el calendario
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { summary, description, startDateTime, endDateTime, location, colorId, calendarId = 'primary' } = body;

    if (!summary || !startDateTime || !endDateTime) {
      return NextResponse.json(
        { error: 'Se requieren título, fecha de inicio y fecha de fin' },
        { status: 400 }
      );
    }

    // Obtener sesión del usuario desde Supabase
    const supabase = createRouteHandlerClient({ cookies });
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }

    // Obtener el token de Google del usuario
    const googleToken = session.user.user_metadata.google_token;
    if (!googleToken || !googleToken.access_token) {
      return NextResponse.json(
        { error: 'Usuario no conectado a Google Calendar' },
        { status: 401 }
      );
    }

    // Crear cliente de Calendar e insertar evento
    const calendar = await getGoogleCalendarClient(googleToken.access_token);
    const response = await calendar.events.insert({
      calendarId,
      requestBody: {
        summary,
        description,
        location,
        colorId,
        start: {
          dateTime: startDateTime,
          timeZone: 'Europe/Madrid', // Zona horaria específica o dinámica según necesidades
        },
        end: {
          dateTime: endDateTime,
          timeZone: 'Europe/Madrid', // Zona horaria específica o dinámica según necesidades
        },
      },
    });

    return NextResponse.json(response.data);
  } catch (error: any) {
    console.error('Error al crear evento:', error);
    return NextResponse.json(
      { error: error.message || 'Error al crear evento' },
      { status: 500 }
    );
  }
} 