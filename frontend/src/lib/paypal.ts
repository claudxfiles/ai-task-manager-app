/**
 * Servicio para la integración con PayPal
 */

// Creamos una orden de PayPal para iniciar el proceso de pago
export async function createPayPalOrder(
  amount: string,
  currency: string = 'USD',
  description: string = 'Compra en SoulDream'
): Promise<{ id: string }> {
  try {
    const response = await fetch('/api/paypal/create-order', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        amount,
        currency,
        description,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Error al crear la orden de PayPal');
    }

    return await response.json();
  } catch (error) {
    console.error('Error al crear orden de PayPal:', error);
    throw error;
  }
}

// Capturamos el pago después de que el usuario lo haya aprobado
export async function capturePayPalPayment(orderId: string): Promise<any> {
  try {
    const response = await fetch(`/api/paypal/capture-payment?orderId=${orderId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Error al capturar el pago de PayPal');
    }

    return await response.json();
  } catch (error) {
    console.error('Error al capturar pago de PayPal:', error);
    throw error;
  }
}

// Creamos una suscripción de PayPal
export async function createPayPalSubscription(
  planId: string,
  returnUrl: string,
  cancelUrl: string
): Promise<{ id: string; approvalUrl: string }> {
  try {
    const response = await fetch('/api/paypal/create-subscription', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        planId,
        returnUrl,
        cancelUrl,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Error al crear la suscripción de PayPal');
    }

    return await response.json();
  } catch (error) {
    console.error('Error al crear suscripción de PayPal:', error);
    throw error;
  }
}

// Cancelamos una suscripción de PayPal
export async function cancelPayPalSubscription(subscriptionId: string): Promise<boolean> {
  try {
    const response = await fetch(`/api/paypal/cancel-subscription`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        subscriptionId,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Error al cancelar la suscripción de PayPal');
    }

    return (await response.json()).success;
  } catch (error) {
    console.error('Error al cancelar suscripción de PayPal:', error);
    throw error;
  }
} 