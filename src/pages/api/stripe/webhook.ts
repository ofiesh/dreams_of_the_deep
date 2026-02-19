import type { APIRoute } from 'astro';
import Stripe from 'stripe';
import { db } from '../../../lib/db';
import { users, subscriptions } from '../../../lib/db/schema';
import { eq } from 'drizzle-orm';

export const prerender = false;

const stripe = new Stripe(import.meta.env.STRIPE_SECRET_KEY || process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-01-27.acacia',
});

const endpointSecret = import.meta.env.STRIPE_WEBHOOK_SECRET || process.env.STRIPE_WEBHOOK_SECRET!;

export const POST: APIRoute = async ({ request }) => {
  const body = await request.text();
  const sig = request.headers.get('stripe-signature');

  if (!sig) {
    return new Response('Missing signature', { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, endpointSecret);
  } catch (err) {
    console.error('[stripe-webhook] Signature verification failed:', err);
    return new Response('Invalid signature', { status: 400 });
  }

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session;
      if (session.customer_email) {
        await db
          .update(users)
          .set({ stripeCustomerId: session.customer as string })
          .where(eq(users.email, session.customer_email));
      }
      break;
    }

    case 'customer.subscription.created':
    case 'customer.subscription.updated': {
      const sub = event.data.object as Stripe.Subscription;
      const customerId = sub.customer as string;

      // Find user by Stripe customer ID
      const [user] = await db
        .select()
        .from(users)
        .where(eq(users.stripeCustomerId, customerId));

      if (user) {
        const existing = await db
          .select()
          .from(subscriptions)
          .where(eq(subscriptions.stripeSubscriptionId, sub.id));

        const tier = sub.items.data[0]?.price?.id === (import.meta.env.STRIPE_PRICE_PREMIUM || process.env.STRIPE_PRICE_PREMIUM)
          ? 'premium' as const
          : 'subscriber' as const;

        const values = {
          userId: user.id,
          stripeSubscriptionId: sub.id,
          tier,
          status: sub.status === 'active' ? 'active' as const
            : sub.status === 'past_due' ? 'past_due' as const
            : sub.status === 'trialing' ? 'trialing' as const
            : 'canceled' as const,
          currentPeriodEnd: new Date(sub.current_period_end * 1000),
        };

        if (existing.length > 0) {
          await db
            .update(subscriptions)
            .set(values)
            .where(eq(subscriptions.stripeSubscriptionId, sub.id));
        } else {
          await db.insert(subscriptions).values(values);
        }
      }
      break;
    }

    case 'customer.subscription.deleted': {
      const sub = event.data.object as Stripe.Subscription;
      await db
        .update(subscriptions)
        .set({ status: 'canceled' })
        .where(eq(subscriptions.stripeSubscriptionId, sub.id));
      break;
    }
  }

  return new Response(JSON.stringify({ received: true }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
};
