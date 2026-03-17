import { NextResponse } from 'next/server';

import { PaymentProviderError } from '@/lib/payments/provider';
import { processStripeWebhook } from '@/lib/payments/webhooks';
import { walletLogger } from '@/lib/logger';

export async function POST(request: Request) {
  const signatureHeader = request.headers.get('stripe-signature');

  if (!signatureHeader) {
    return NextResponse.json({ error: 'missing_signature' }, { status: 400 });
  }

  const payload = await request.text();

  try {
    await processStripeWebhook(payload, signatureHeader);
    return NextResponse.json({ received: true });
  } catch (error) {
    // Return 400 for signature/parsing errors to prevent Stripe retries
    if (error instanceof PaymentProviderError) {
      return NextResponse.json(
        { error: 'invalid_webhook', message: error.message },
        { status: 400 }
      );
    }
    // Return 400 for JSON parsing errors
    if (error instanceof SyntaxError) {
      return NextResponse.json(
        { error: 'invalid_payload', message: 'Malformed JSON payload' },
        { status: 400 }
      );
    }
    // For processing failures (e.g., DB errors), return 500 so Stripe retries
    walletLogger.error({ err: error }, 'Webhook processing failed');
    return NextResponse.json(
      { error: 'processing_failed', message: 'Internal processing error' },
      { status: 500 }
    );
  }
}
