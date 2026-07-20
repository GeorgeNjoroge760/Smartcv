import { Router } from 'express';
import Stripe from 'stripe';
import { supabase } from '../db/supabase.js';
import { authMiddleware } from '../middleware/auth.js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
export const paymentRouter = Router();

// Create checkout session
paymentRouter.post('/create-checkout', authMiddleware, async (req, res, next) => {
  try {
    const { priceId, interval } = req.body;

    const { data: profile } = await supabase
      .from('user_profiles')
      .select('stripe_customer_id, email')
      .eq('id', req.user.id)
      .single();

    let customerId = profile?.stripe_customer_id;

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: req.user.email,
        metadata: { supabase_user_id: req.user.id },
      });
      customerId = customer.id;

      await supabase
        .from('user_profiles')
        .update({ stripe_customer_id: customerId })
        .eq('id', req.user.id);
    }

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [{
        price: priceId || process.env.STRIPE_PRICE_PRO_MONTHLY,
        quantity: 1,
      }],
      success_url: `${process.env.CLIENT_URL}/?payment=success`,
      cancel_url: `${process.env.CLIENT_URL}/?payment=cancelled`,
      metadata: { user_id: req.user.id },
    });

    res.json({ sessionId: session.id, url: session.url });
  } catch (err) {
    next(err);
  }
});

// Stripe webhook
paymentRouter.post('/webhook', async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object;
      const userId = session.metadata.user_id;
      const subscriptionId = session.subscription;

      const subscription = await stripe.subscriptions.retrieve(subscriptionId);

      await supabase
        .from('user_profiles')
        .update({
          tier: 'pro',
          stripe_subscription_id: subscriptionId,
          subscription_status: subscription.status,
        })
        .eq('id', userId);
      break;
    }
    case 'customer.subscription.updated': {
      const subscription = event.data.object;
      const status = subscription.status;

      await supabase
        .from('user_profiles')
        .update({
          subscription_status: status,
          tier: status === 'active' ? 'pro' : 'free',
        })
        .eq('stripe_subscription_id', subscription.id);
      break;
    }
    case 'customer.subscription.deleted': {
      const subscription = event.data.object;

      await supabase
        .from('user_profiles')
        .update({
          tier: 'free',
          subscription_status: 'cancelled',
          stripe_subscription_id: null,
        })
        .eq('stripe_subscription_id', subscription.id);
      break;
    }
  }

  res.json({ received: true });
});

// Get subscription status
paymentRouter.get('/status', authMiddleware, async (req, res, next) => {
  try {
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('tier, subscription_status, stripe_subscription_id')
      .eq('id', req.user.id)
      .single();

    let subscription = null;
    if (profile?.stripe_subscription_id) {
      subscription = await stripe.subscriptions.retrieve(profile.stripe_subscription_id);
    }

    res.json({
      tier: profile?.tier || 'free',
      status: profile?.subscription_status || 'inactive',
      currentPeriodEnd: subscription?.current_period_end
        ? new Date(subscription.current_period_end * 1000)
        : null,
    });
  } catch (err) {
    next(err);
  }
});

// Create customer portal session
paymentRouter.post('/portal', authMiddleware, async (req, res, next) => {
  try {
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('stripe_customer_id')
      .eq('id', req.user.id)
      .single();

    if (!profile?.stripe_customer_id) {
      return res.status(400).json({ error: 'No billing account found' });
    }

    const session = await stripe.billingPortal.sessions.create({
      customer: profile.stripe_customer_id,
      return_url: `${process.env.CLIENT_URL}/?portal=return`,
    });

    res.json({ url: session.url });
  } catch (err) {
    next(err);
  }
});
