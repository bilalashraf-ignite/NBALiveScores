import crypto from 'crypto';

import { WebhookEventStatus, WalletProvider } from '@prisma/client';

import { prisma } from '@/lib/db';
import { parseStripeWebhookEvent } from '@/lib/payments/stripe';
import { processStripeWebhookEvent } from '@/lib/star-points/purchases';

function hashPayload(payload: string): string {
  return crypto.createHash('sha256').update(payload, 'utf8').digest('hex');
}

export async function processStripeWebhook(payload: string, signatureHeader: string) {
  const event = parseStripeWebhookEvent(payload, signatureHeader);

  const existing = await prisma.webhookEvent.findUnique({
    where: {
      provider_providerEventId: {
        provider: WalletProvider.STRIPE,
        providerEventId: event.id,
      },
    },
  });

  if (existing?.status === WebhookEventStatus.PROCESSED) {
    return { duplicate: true, eventId: event.id };
  }

  if (!existing) {
    await prisma.webhookEvent.create({
      data: {
        provider: WalletProvider.STRIPE,
        providerEventId: event.id,
        eventType: event.type,
        payloadHash: hashPayload(payload),
        status: WebhookEventStatus.RECEIVED,
      },
    });
  }

  try {
    const outcome = await processStripeWebhookEvent(event);

    await prisma.webhookEvent.update({
      where: {
        provider_providerEventId: {
          provider: WalletProvider.STRIPE,
          providerEventId: event.id,
        },
      },
      data: {
        status:
          outcome === 'processed'
            ? WebhookEventStatus.PROCESSED
            : WebhookEventStatus.IGNORED,
        processedAt: new Date(),
        errorMessage: null,
      },
    });

    return { duplicate: false, eventId: event.id, outcome };
  } catch (error) {
    await prisma.webhookEvent.update({
      where: {
        provider_providerEventId: {
          provider: WalletProvider.STRIPE,
          providerEventId: event.id,
        },
      },
      data: {
        status: WebhookEventStatus.FAILED,
        errorMessage: error instanceof Error ? error.message : 'Unknown webhook error',
      },
    });

    throw error;
  }
}
