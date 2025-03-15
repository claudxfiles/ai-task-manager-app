from fastapi import APIRouter, Request, Depends, HTTPException
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import User, Subscription, StripeEvent
import stripe
import os
import json
from datetime import datetime, timedelta
import logging

# Configurar Stripe
stripe.api_key = os.getenv("STRIPE_SECRET_KEY")
webhook_secret = os.getenv("STRIPE_WEBHOOK_SECRET")

router = APIRouter()
logger = logging.getLogger("stripe_webhooks")

@router.post("/webhook")
async def stripe_webhook(request: Request, db: Session = Depends(get_db)):
    """
    Endpoint para recibir webhooks de Stripe
    """
    # Obtener la firma del webhook
    signature = request.headers.get("stripe-signature")
    if not signature:
        raise HTTPException(status_code=400, detail="No Stripe signature provided")
    
    # Obtener el cuerpo de la solicitud
    payload = await request.body()
    
    try:
        # Verificar la firma
        event = stripe.Webhook.construct_event(
            payload, signature, webhook_secret
        )
    except ValueError as e:
        # Payload inválido
        logger.error(f"Invalid payload: {str(e)}")
        raise HTTPException(status_code=400, detail="Invalid payload")
    except stripe.error.SignatureVerificationError as e:
        # Firma inválida
        logger.error(f"Invalid signature: {str(e)}")
        raise HTTPException(status_code=400, detail="Invalid signature")
    
    # Manejar el evento según su tipo
    event_type = event["type"]
    event_data = event["data"]["object"]
    
    logger.info(f"Processing Stripe event: {event_type}")
    
    if event_type == "checkout.session.completed":
        # Sesión de checkout completada
        await handle_checkout_session_completed(event_data, db)
    
    elif event_type == "customer.subscription.created":
        # Suscripción creada
        await handle_subscription_created(event_data, db)
    
    elif event_type == "customer.subscription.updated":
        # Suscripción actualizada
        await handle_subscription_updated(event_data, db)
    
    elif event_type == "customer.subscription.deleted":
        # Suscripción cancelada
        await handle_subscription_deleted(event_data, db)
    
    elif event_type == "invoice.payment_succeeded":
        # Pago de factura exitoso
        await handle_invoice_payment_succeeded(event_data, db)
    
    elif event_type == "invoice.payment_failed":
        # Pago de factura fallido
        await handle_invoice_payment_failed(event_data, db)
    
    # Guardar el evento en la base de datos
    save_stripe_event(event, db)
    
    return {"status": "success"}

async def handle_checkout_session_completed(session, db: Session):
    """
    Manejar el evento de sesión de checkout completada
    """
    # Obtener el cliente y la suscripción
    customer_id = session.get("customer")
    subscription_id = session.get("subscription")
    
    if not customer_id or not subscription_id:
        logger.warning("Missing customer or subscription ID in checkout session")
        return
    
    # Obtener el email del cliente
    customer = stripe.Customer.retrieve(customer_id)
    email = customer.get("email")
    
    if not email:
        logger.warning(f"No email found for customer {customer_id}")
        return
    
    # Buscar el usuario por email
    user = db.query(User).filter(User.email == email).first()
    
    if not user:
        logger.warning(f"No user found with email {email}")
        return
    
    # Obtener detalles de la suscripción
    subscription = stripe.Subscription.retrieve(subscription_id)
    
    # Obtener el plan
    plan_id = subscription.items.data[0].plan.id
    
    # Calcular la fecha de fin del período actual
    current_period_end = datetime.fromtimestamp(subscription.current_period_end)
    
    # Crear o actualizar la suscripción en la base de datos
    db_subscription = db.query(Subscription).filter(
        Subscription.user_id == user.id
    ).first()
    
    if db_subscription:
        # Actualizar suscripción existente
        db_subscription.stripe_subscription_id = subscription_id
        db_subscription.plan_id = plan_id
        db_subscription.status = subscription.status
        db_subscription.current_period_end = current_period_end
    else:
        # Crear nueva suscripción
        db_subscription = Subscription(
            user_id=user.id,
            stripe_subscription_id=subscription_id,
            plan_id=plan_id,
            status=subscription.status,
            current_period_end=current_period_end
        )
        db.add(db_subscription)
    
    # Asignar créditos según el plan
    if plan_id == "plan_free":
        user.credits = 100  # Plan gratuito: 100 tokens
    elif plan_id == "plan_premium":
        user.credits = 500  # Plan premium: 500 tokens
    
    db.commit()
    logger.info(f"Subscription created/updated for user {user.id}")

async def handle_subscription_created(subscription, db: Session):
    """
    Manejar el evento de suscripción creada
    """
    # Similar a handle_checkout_session_completed
    pass

async def handle_subscription_updated(subscription, db: Session):
    """
    Manejar el evento de suscripción actualizada
    """
    subscription_id = subscription.get("id")
    
    if not subscription_id:
        logger.warning("Missing subscription ID in update event")
        return
    
    # Buscar la suscripción en la base de datos
    db_subscription = db.query(Subscription).filter(
        Subscription.stripe_subscription_id == subscription_id
    ).first()
    
    if not db_subscription:
        logger.warning(f"No subscription found with ID {subscription_id}")
        return
    
    # Actualizar el estado y la fecha de fin del período
    db_subscription.status = subscription.get("status")
    db_subscription.current_period_end = datetime.fromtimestamp(
        subscription.get("current_period_end")
    )
    
    db.commit()
    logger.info(f"Subscription {subscription_id} updated")

async def handle_subscription_deleted(subscription, db: Session):
    """
    Manejar el evento de suscripción cancelada
    """
    subscription_id = subscription.get("id")
    
    if not subscription_id:
        logger.warning("Missing subscription ID in delete event")
        return
    
    # Buscar la suscripción en la base de datos
    db_subscription = db.query(Subscription).filter(
        Subscription.stripe_subscription_id == subscription_id
    ).first()
    
    if not db_subscription:
        logger.warning(f"No subscription found with ID {subscription_id}")
        return
    
    # Actualizar el estado a cancelado
    db_subscription.status = "canceled"
    
    db.commit()
    logger.info(f"Subscription {subscription_id} canceled")

async def handle_invoice_payment_succeeded(invoice, db: Session):
    """
    Manejar el evento de pago de factura exitoso
    """
    subscription_id = invoice.get("subscription")
    
    if not subscription_id:
        logger.warning("Missing subscription ID in invoice")
        return
    
    # Buscar la suscripción en la base de datos
    db_subscription = db.query(Subscription).filter(
        Subscription.stripe_subscription_id == subscription_id
    ).first()
    
    if not db_subscription:
        logger.warning(f"No subscription found with ID {subscription_id}")
        return
    
    # Obtener el usuario
    user = db.query(User).filter(User.id == db_subscription.user_id).first()
    
    if not user:
        logger.warning(f"No user found for subscription {subscription_id}")
        return
    
    # Asignar créditos según el plan
    if db_subscription.plan_id == "plan_free":
        user.credits = 100  # Plan gratuito: 100 tokens
    elif db_subscription.plan_id == "plan_premium":
        user.credits = 500  # Plan premium: 500 tokens
    
    db.commit()
    logger.info(f"Credits added for user {user.id} after payment")

async def handle_invoice_payment_failed(invoice, db: Session):
    """
    Manejar el evento de pago de factura fallido
    """
    subscription_id = invoice.get("subscription")
    
    if not subscription_id:
        logger.warning("Missing subscription ID in invoice")
        return
    
    # Buscar la suscripción en la base de datos
    db_subscription = db.query(Subscription).filter(
        Subscription.stripe_subscription_id == subscription_id
    ).first()
    
    if not db_subscription:
        logger.warning(f"No subscription found with ID {subscription_id}")
        return
    
    # Actualizar el estado a impago
    db_subscription.status = "past_due"
    
    db.commit()
    logger.info(f"Subscription {subscription_id} marked as past_due")

def save_stripe_event(event, db: Session):
    """
    Guardar el evento de Stripe en la base de datos
    """
    # Extraer datos del evento
    event_id = event.get("id")
    event_type = event.get("type")
    event_data = json.dumps(event.get("data", {}))
    
    # Verificar si el evento ya existe
    existing_event = db.query(StripeEvent).filter(
        StripeEvent.stripe_event_id == event_id
    ).first()
    
    if existing_event:
        # El evento ya está registrado
        return
    
    # Crear nuevo registro de evento
    new_event = StripeEvent(
        stripe_event_id=event_id,
        event_type=event_type,
        data=event_data
    )
    
    db.add(new_event)
    db.commit()
    logger.info(f"Stripe event {event_id} saved to database") 