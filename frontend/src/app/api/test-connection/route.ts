import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  try {
    console.log('Iniciando prueba de conexión con el backend');
    console.log('BACKEND_URL:', process.env.BACKEND_URL);
    
    // Hacer solicitud al backend
    const backendUrl = `${process.env.BACKEND_URL}/api/subscriptions/create-subscription`;
    console.log('Intentando conectar a:', backendUrl);
    
    const response = await fetch(backendUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ plan_id: 'plan_free' }),
    });

    console.log('Respuesta del backend status:', response.status);
    
    let responseData;
    try {
      responseData = await response.json();
      console.log('Respuesta del backend data:', responseData);
    } catch (error) {
      console.error('Error al parsear la respuesta:', error);
      responseData = { error: 'Error al parsear la respuesta' };
    }

    return NextResponse.json({
      success: response.ok,
      status: response.status,
      statusText: response.statusText,
      data: responseData,
      backendUrl: backendUrl
    });
  } catch (error) {
    console.error('Error en test-connection:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Error al conectar con el backend', 
        details: error instanceof Error ? error.message : String(error),
        backendUrl: `${process.env.BACKEND_URL}/api/subscriptions/create-subscription`
      },
      { status: 500 }
    );
  }
} 