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
import {
  grantStarPointsForPurchase,
  grantStarPointsForPurchaseWithTx,
  reverseStarPointsForPurchase,
  reverseStarPointsForPurchaseWithTx,
} from '@/lib/star-points/ledger';
import { StarPointProduct } from '@/lib/star-points/products';

type CheckoutUser = {
  id: string;
  email?: string | null;
};

function walletProvider(): WalletProvider {
  return WalletProvider.STRIPE;
}

export async function ensureWalletAccountForUser(user: CheckoutUser) {
  // Check for existing account first (fast path)
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

  // Create Stripe customer (side effect - may create orphan if race occurs)
  const customer = await createStripeCustomer({
    userId: user.id,
    email: user.email,
  });

  // Attempt to create wallet account, handling race condition via unique constraint
  try {
    return await prisma.walletAccount.create({
      data: {
        userId: user.id,
        provider: walletProvider(),
        providerCustomerId: customer.id,
      },
    });
  } catch (error) {
    // Handle unique constraint violation (race condition - another request won)
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2002'
    ) {
      // Return the existing record created by the concurrent request
      const existingAccount = await prisma.walletAccount.findUnique({
        where: {
          provider_userId: {
            provider: walletProvider(),
            userId: user.id,
          },
        },
      });

      if (existingAccount) {
        return existingAccount;
      }
    }

    // Re-throw unexpected errors
    throw error;
  }
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

  try {
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
  } catch (error) {
    // Clean up the purchase record on Stripe failure to prevent phantom pending purchases
    await prisma.starPointPurchase.update({
      where: { id: purchase.id },
      data: {
        status: StarPointPurchaseStatus.FAILED,
        metadata: {
          source: 'hosted_checkout',
          failureReason: error instanceof Error ? error.message : 'Unknown error',
        } satisfies Prisma.JsonObject,
      },
    });
    throw error;
  }
}

async function markPurchasePaidFromSession(session: StripeCheckoutSessionObject) {
  const purchaseId = session.metadata?.purchaseId;

  if (!purchaseId) {
    return;
  }

  // Wrap both operations in a single transaction to ensure atomicity
  // If granting points fails, the purchase status is rolled back
  await prisma.$transaction(async (tx) => {
    await tx.starPointPurchase.update({
      where: { id: purchaseId },
      data: {
        providerSessionId: session.id,
        providerPaymentIntentId: session.payment_intent ?? undefined,
        status: StarPointPurchaseStatus.PAID,
      },
    });

    await grantStarPointsForPurchaseWithTx(purchaseId, tx);
  });
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

  // Wrap both operations in a single transaction to ensure atomicity
  // If reversing points fails, the charge ID update is rolled back
  await prisma.$transaction(async (tx) => {
    await tx.starPointPurchase.update({
      where: { id: purchase.id },
      data: {
        providerChargeId: charge.id,
      },
    });

    await reverseStarPointsForPurchaseWithTx(purchase.id, tx);
  });
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
