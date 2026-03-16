import crypto from 'crypto';

import { Prisma, StarPointPurchaseStatus, WalletProvider } from '@prisma/client';

import { prisma } from '@/lib/db';
import {
  StripeChargeObject,
  StripeCheckoutSessionObject,
  StripeWebhookEvent,
  createStripeCheckoutSession,
  createStripeCustomer,
} from '@/lib/payments/stripe';
import { grantStarPointsForPurchase, reverseStarPointsForPurchase } from '@/lib/star-points/ledger';
import { StarPointProduct } from '@/lib/star-points/products';

type CheckoutUser = {
  id: string;
  email?: string | null;
};

function walletProvider(): WalletProvider {
  return WalletProvider.STRIPE;
}

export async function ensureWalletAccountForUser(user: CheckoutUser) {
  const existing = await prisma.walletAccount.findUnique({
    where: {
      provider_userId: {
        provider: walletProvider(),
        userId: user.id,
      },
    },
  });

  if (existing) {
    return existing;
  }

  const customer = await createStripeCustomer({
    userId: user.id,
    email: user.email,
  });

  return prisma.walletAccount.create({
    data: {
      userId: user.id,
      provider: walletProvider(),
      providerCustomerId: customer.id,
    },
  });
}

export async function createStarPointCheckoutSession(input: {
  user: CheckoutUser;
  product: StarPointProduct;
}) {
  const walletAccount = await ensureWalletAccountForUser(input.user);
  const purchase = await prisma.starPointPurchase.create({
    data: {
      userId: input.user.id,
      walletAccountId: walletAccount.id,
      status: StarPointPurchaseStatus.CHECKOUT_STARTED,
      provider: walletProvider(),
      productCode: input.product.code,
      currency: input.product.currency,
      amountCents: input.product.amountCents,
      points: input.product.points,
      idempotencyKey: crypto.randomUUID(),
      metadata: {
        source: 'hosted_checkout',
      } satisfies Prisma.JsonObject,
    },
  });

  const session = await createStripeCheckoutSession({
    customerId: walletAccount.providerCustomerId,
    purchaseId: purchase.id,
    productCode: input.product.code,
    productName: input.product.name,
    amountCents: input.product.amountCents,
    currency: input.product.currency,
    points: input.product.points,
    userId: input.user.id,
  });

  if (!session.url) {
    throw new Error('Stripe checkout session did not include a URL.');
  }

  const updatedPurchase = await prisma.starPointPurchase.update({
    where: { id: purchase.id },
    data: {
      providerSessionId: session.id,
      providerPaymentIntentId: session.payment_intent ?? undefined,
      status: StarPointPurchaseStatus.PAYMENT_PENDING,
    },
  });

  return {
    purchase: updatedPurchase,
    checkoutUrl: session.url,
  };
}

async function markPurchasePaidFromSession(session: StripeCheckoutSessionObject) {
  const purchaseId = session.metadata?.purchaseId;

  if (!purchaseId) {
    return;
  }

  await prisma.starPointPurchase.update({
    where: { id: purchaseId },
    data: {
      providerSessionId: session.id,
      providerPaymentIntentId: session.payment_intent ?? undefined,
      status: StarPointPurchaseStatus.PAID,
    },
  });

  await grantStarPointsForPurchase(purchaseId);
}

async function markPurchaseFailedFromSession(session: StripeCheckoutSessionObject) {
  const purchaseId = session.metadata?.purchaseId;

  if (!purchaseId) {
    return;
  }

  await prisma.starPointPurchase.update({
    where: { id: purchaseId },
    data: {
      providerSessionId: session.id,
      providerPaymentIntentId: session.payment_intent ?? undefined,
      status: StarPointPurchaseStatus.FAILED,
    },
  });
}

async function reversePurchaseFromCharge(charge: StripeChargeObject) {
  const purchaseFilters: Array<Record<string, string>> = [];

  if (charge.payment_intent) {
    purchaseFilters.push({ providerPaymentIntentId: charge.payment_intent });
  }

  purchaseFilters.push({ providerChargeId: charge.id });

  const purchase = await prisma.starPointPurchase.findFirst({
    where: {
      OR: purchaseFilters,
    },
  });

  if (!purchase) {
    return;
  }

  await prisma.starPointPurchase.update({
    where: { id: purchase.id },
    data: {
      providerChargeId: charge.id,
    },
  });

  await reverseStarPointsForPurchase(purchase.id);
}

export async function processStripeWebhookEvent(event: StripeWebhookEvent) {
  switch (event.type) {
    case 'checkout.session.completed':
    case 'checkout.session.async_payment_succeeded':
      await markPurchasePaidFromSession(event.data.object as StripeCheckoutSessionObject);
      return 'processed';

    case 'checkout.session.async_payment_failed':
      await markPurchaseFailedFromSession(event.data.object as StripeCheckoutSessionObject);
      return 'processed';

    case 'charge.refunded':
      await reversePurchaseFromCharge(event.data.object as StripeChargeObject);
      return 'processed';

    default:
      return 'ignored';
  }
}
