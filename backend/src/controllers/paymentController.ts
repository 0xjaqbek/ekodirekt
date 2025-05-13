import { Request, Response, NextFunction } from 'express';
import Stripe from 'stripe';
import { Order } from '../models';

// Inicjalizacja Stripe z kluczem API
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2023-10-16', // Aktualna wersja API
});

/**
 * Tworzy intent płatności Stripe dla zamówienia
 * @route POST /api/payments/create-intent
 * @access Private
 */
export const createPaymentIntent = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { orderId } = req.body;
    const userId = req.user.id;
    
    // Pobierz zamówienie
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Zamówienie nie istnieje' });
    }
    
    // Sprawdź, czy użytkownik jest właścicielem zamówienia
    if (order.buyer.toString() !== userId) {
      return res.status(403).json({ 
        success: false, 
        message: 'Nie masz uprawnień do realizacji płatności za to zamówienie' 
      });
    }
    
    // Sprawdź, czy zamówienie jest w odpowiednim statusie
    if (order.status !== 'pending') {
      return res.status(400).json({ 
        success: false, 
        message: 'To zamówienie nie może być opłacone (nieprawidłowy status)' 
      });
    }
    
    // Sprawdź, czy zamówienie nie zostało już opłacone
    if (order.paymentStatus === 'completed') {
      return res.status(400).json({ success: false, message: 'To zamówienie zostało już opłacone' });
    }
    
    // Utwórz intencję płatności Stripe
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(order.totalPrice * 100), // Konwersja na grosze (Stripe używa najmniejszej jednostki waluty)
      currency: 'pln',
      metadata: {
        orderId: order._id.toString(),
        userId: userId
      },
    });
    
    return res.status(200).json({
      success: true,
      clientSecret: paymentIntent.client_secret,
    });
  } catch (error: any) {
    console.error('Błąd podczas tworzenia intencji płatności:', error);
    next(error);
  }
};

/**
 * Obsługuje webhook Stripe z aktualizacją statusu płatności
 * @route POST /api/payments/webhook
 * @access Public (używane przez Stripe)
 */
export const stripeWebhook = async (req: Request, res: Response, next: NextFunction) => {
  // Pobierz klucz webhook z zmiennych środowiskowych
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  
  if (!webhookSecret) {
    console.error('Brak klucza webhook Stripe w zmiennych środowiskowych');
    return res.status(500).json({ success: false, message: 'Błąd konfiguracji webhook' });
  }
  
  try {
    // Pobierz sygnaturę z nagłówków
    const signature = req.headers['stripe-signature'] as string;
    
    // Zweryfikuj zdarzenie
    let event;
    try {
      event = stripe.webhooks.constructEvent(
        req.body,
        signature,
        webhookSecret
      );
    } catch (err: any) {
      console.error('Błąd weryfikacji podpisu webhook:', err.message);
      return res.status(400).json({ success: false, message: 'Nieprawidłowy podpis webhook' });
    }
    
    // Obsłuż zdarzenie płatności
    if (event.type === 'payment_intent.succeeded') {
      const paymentIntent = event.data.object as Stripe.PaymentIntent;
      await handleSuccessfulPayment(paymentIntent);
    } else if (event.type === 'payment_intent.payment_failed') {
      const paymentIntent = event.data.object as Stripe.PaymentIntent;
      await handleFailedPayment(paymentIntent);
    }
    
    // Zwróć odpowiedź potwierdzającą otrzymanie zdarzenia
    return res.status(200).json({ received: true });
  } catch (error: any) {
    console.error('Błąd podczas obsługi webhook Stripe:', error);
    next(error);
  }
};

/**
 * Obsługa udanej płatności
 */
const handleSuccessfulPayment = async (paymentIntent: Stripe.PaymentIntent) => {
  try {
    const orderId = paymentIntent.metadata.orderId;
    
    if (!orderId) {
      console.error('Brak ID zamówienia w metadanych płatności');
      return;
    }
    
    // Pobierz zamówienie
    const order = await Order.findById(orderId);
    if (!order) {
      console.error(`Nie znaleziono zamówienia o ID: ${orderId}`);
      return;
    }
    
    // Aktualizuj status płatności i zamówienia
    order.paymentStatus = 'completed';
    order.paymentId = paymentIntent.id;
    
    // Aktualizuj status zamówienia, jeśli jest w statusie "pending"
    if (order.status === 'pending') {
      order.status = 'paid';
      order.statusHistory.push({
        status: 'paid',
        timestamp: new Date(),
        updatedBy: order.buyer, // W webhook używamy ID kupującego
        note: 'Płatność zrealizowana przez Stripe'
      });
    }
    
    // Zapisz zamówienie
    await order.save();
    
    console.log(`Zaktualizowano status płatności dla zamówienia ${orderId} na 'completed'`);
  } catch (error) {
    console.error('Błąd podczas obsługi udanej płatności:', error);
  }
};

/**
 * Obsługa nieudanej płatności
 */
const handleFailedPayment = async (paymentIntent: Stripe.PaymentIntent) => {
  try {
    const orderId = paymentIntent.metadata.orderId;
    
    if (!orderId) {
      console.error('Brak ID zamówienia w metadanych płatności');
      return;
    }
    
    // Pobierz zamówienie
    const order = await Order.findById(orderId);
    if (!order) {
      console.error(`Nie znaleziono zamówienia o ID: ${orderId}`);
      return;
    }
    
    // Aktualizuj status płatności
    order.paymentStatus = 'failed';
    order.paymentId = paymentIntent.id;
    
    // Dodaj notatkę o nieudanej płatności
    order.statusHistory.push({
      status: order.status,
      timestamp: new Date(),
      updatedBy: order.buyer, // W webhook używamy ID kupującego
      note: 'Płatność nieudana (Stripe)'
    });
    
    // Zapisz zamówienie
    await order.save();
    
    console.log(`Zaktualizowano status płatności dla zamówienia ${orderId} na 'failed'`);
  } catch (error) {
    console.error('Błąd podczas obsługi nieudanej płatności:', error);
  }
};