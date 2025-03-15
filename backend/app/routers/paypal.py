from fastapi import APIRouter, Request, Depends, HTTPException
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import User, Subscription
import paypalrestsdk
import os
import json
from datetime import datetime, timedelta
import logging
from ..auth import get_current_user
from paypalrestsdk import Payment

# Configurar PayPal
paypalrestsdk.configure({
    "mode": os.getenv("PAYPAL_MODE", "sandbox"),  # sandbox o live
    "client_id": os.getenv("PAYPAL_CLIENT_ID"),
    "client_secret": os.getenv("PAYPAL_CLIENT_SECRET")
})

router = APIRouter()
logger = logging.getLogger("paypal_integration")

@router.post("/create-payment")
async def create_payment(
    plan_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Crear un pago de PayPal para el plan premium
    """
    try:
        # Determinar el precio según el plan
        if plan_id == "plan_premium":
            price = "9.99"
            description = "Plan Premium - 500 tokens mensuales"
        else:
            raise HTTPException(status_code=400, detail="Plan no válido")
        
        # Crear el pago en PayPal
        payment = paypalrestsdk.Payment({
            "intent": "sale",
            "payer": {
                "payment_method": "paypal"
            },
            "redirect_urls": {
                "return_url": f"{os.getenv('FRONTEND_URL', 'http://localhost:3000')}/dashboard?subscription=success",
                "cancel_url": f"{os.getenv('FRONTEND_URL', 'http://localhost:3000')}/pricing?subscription=canceled"
            },
            "transactions": [{
                "item_list": {
                    "items": [{
                        "name": "Plan Premium",
                        "sku": "plan_premium",
                        "price": price,
                        "currency": "USD",
                        "quantity": 1
                    }]
                },
                "amount": {
                    "total": price,
                    "currency": "USD"
                },
                "description": description
            }]
        })
        
        # Crear el pago
        if payment.create():
            # Guardar el ID del pago en la sesión o base de datos para referencia futura
            for link in payment.links:
                if link.rel == "approval_url":
                    return {"success": True, "approval_url": link.href, "payment_id": payment.id}
        else:
            logger.error(f"Error al crear el pago: {payment.error}")
            raise HTTPException(status_code=500, detail=str(payment.error))
            
    except Exception as e:
        logger.error(f"Error en create_payment: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/execute-payment")
async def execute_payment(
    payment_id: str,
    payer_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Ejecutar un pago de PayPal después de la aprobación del usuario
    """
    try:
        payment = paypalrestsdk.Payment.find(payment_id)
        
        if payment.execute({"payer_id": payer_id}):
            # Pago exitoso, actualizar la suscripción del usuario
            
            # Obtener el SKU del plan desde el pago
            plan_id = payment.transactions[0].item_list.items[0].sku
            
            # Crear o actualizar la suscripción en la base de datos
            db_subscription = db.query(Subscription).filter(
                Subscription.user_id == current_user.id
            ).first()
            
            # Calcular la fecha de fin del período (30 días)
            current_period_end = datetime.now() + timedelta(days=30)
            
            if db_subscription:
                # Actualizar suscripción existente
                db_subscription.plan_id = plan_id
                db_subscription.status = "active"
                db_subscription.is_free_plan = False
                db_subscription.paypal_payment_id = payment_id
                db_subscription.current_period_end = current_period_end
            else:
                # Crear nueva suscripción
                db_subscription = Subscription(
                    user_id=current_user.id,
                    plan_id=plan_id,
                    status="active",
                    is_free_plan=False,
                    paypal_payment_id=payment_id,
                    current_period_end=current_period_end
                )
                db.add(db_subscription)
            
            # Asignar créditos según el plan
            if plan_id == "plan_premium":
                current_user.credits = 500  # Plan premium: 500 tokens
            
            db.commit()
            
            return {"success": True, "message": "Pago ejecutado correctamente"}
        else:
            logger.error(f"Error al ejecutar el pago: {payment.error}")
            raise HTTPException(status_code=500, detail=str(payment.error))
            
    except Exception as e:
        logger.error(f"Error en execute_payment: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/create-subscription")
async def create_subscription(
    plan_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Crear una suscripción (para el plan gratuito o redirigir a PayPal para el premium)
    """
    try:
        # Verificar si el plan es gratuito
        if plan_id == "plan_free":
            # Para el plan gratuito, simplemente actualizamos los créditos del usuario
            current_user.credits = 100
            
            # Crear o actualizar la suscripción en la base de datos
            db_subscription = db.query(Subscription).filter(
                Subscription.user_id == current_user.id
            ).first()
            
            if db_subscription:
                db_subscription.plan_id = "plan_free"
                db_subscription.status = "active"
                db_subscription.is_free_plan = True
                db_subscription.paypal_payment_id = None
                db_subscription.current_period_end = datetime.now() + timedelta(days=30)
            else:
                db_subscription = Subscription(
                    user_id=current_user.id,
                    plan_id="plan_free",
                    status="active",
                    is_free_plan=True,
                    paypal_payment_id=None,
                    current_period_end=datetime.now() + timedelta(days=30)
                )
                db.add(db_subscription)
            
            db.commit()
            
            return {
                "success": True, 
                "redirect_url": f"{os.getenv('FRONTEND_URL', 'http://localhost:3000')}/dashboard?subscription=free"
            }
        
        # Para el plan premium, crear un pago en PayPal
        return await create_payment(plan_id, current_user, db)
            
    except Exception as e:
        logger.error(f"Error en create_subscription: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/webhook")
async def paypal_webhook(request: Request, db: Session = Depends(get_db)):
    """
    Endpoint para recibir webhooks de PayPal
    """
    try:
        # Obtener el cuerpo de la solicitud
        payload = await request.body()
        payload_dict = json.loads(payload)
        
        # Verificar el tipo de evento
        event_type = payload_dict.get("event_type")
        
        if event_type == "PAYMENT.SALE.COMPLETED":
            # Pago completado
            resource = payload_dict.get("resource", {})
            payment_id = resource.get("parent_payment")
            
            if payment_id:
                # Buscar la suscripción por payment_id
                db_subscription = db.query(Subscription).filter(
                    Subscription.paypal_payment_id == payment_id
                ).first()
                
                if db_subscription:
                    # Actualizar la suscripción
                    db_subscription.status = "active"
                    
                    # Obtener el usuario
                    user = db.query(User).filter(User.id == db_subscription.user_id).first()
                    
                    if user:
                        # Asignar créditos según el plan
                        if db_subscription.plan_id == "plan_premium":
                            user.credits = 500  # Plan premium: 500 tokens
                        
                        db.commit()
                        logger.info(f"Suscripción actualizada para el usuario {user.id}")
        
        return {"status": "success"}
    
    except Exception as e:
        logger.error(f"Error en webhook: {str(e)}")
        return {"status": "error", "message": str(e)}

@router.get("/get-subscription")
async def get_subscription(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """
    Obtiene la información de la suscripción del usuario actual.
    """
    try:
        # Buscar la suscripción del usuario
        subscription = db.query(Subscription).filter(
            Subscription.user_id == current_user.id
        ).first()

        if not subscription:
            # Si no tiene suscripción, crear una suscripción gratuita por defecto
            subscription = Subscription(
                user_id=current_user.id,
                plan_id="plan_free",
                status="active",
                is_free_plan=True,
                current_period_end=datetime.now() + timedelta(days=30)
            )
            db.add(subscription)
            db.commit()
            db.refresh(subscription)

        # Formatear la respuesta
        return {
            "plan_id": subscription.plan_id,
            "status": subscription.status,
            "is_free_plan": subscription.is_free_plan,
            "current_period_end": subscription.current_period_end.isoformat() if subscription.current_period_end else None,
            "paypal_payment_id": subscription.paypal_payment_id
        }
    except Exception as e:
        logger.error(f"Error en get_subscription: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error al obtener la suscripción: {str(e)}")

@router.post("/cancel-subscription")
async def cancel_subscription(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """
    Cancela la suscripción del usuario actual.
    """
    try:
        # Buscar la suscripción del usuario
        subscription = db.query(Subscription).filter(
            Subscription.user_id == current_user.id
        ).first()

        if not subscription:
            raise HTTPException(status_code=404, detail="No se encontró una suscripción activa")

        if subscription.is_free_plan:
            raise HTTPException(status_code=400, detail="No se puede cancelar un plan gratuito")

        # Actualizar el estado de la suscripción
        subscription.status = "canceled"
        db.commit()
        db.refresh(subscription)

        # Formatear la respuesta
        return {
            "message": "Suscripción cancelada correctamente",
            "plan_id": subscription.plan_id,
            "status": subscription.status,
            "current_period_end": subscription.current_period_end.isoformat() if subscription.current_period_end else None
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error en cancel_subscription: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error al cancelar la suscripción: {str(e)}") 