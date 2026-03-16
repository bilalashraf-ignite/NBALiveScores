import { NextResponse } from 'next/server';

import { processStripeWebhook } from '@/lib/payments/webhooks';

export async function POST(request: Request) {
  const signatureHeader = request.headers.get('stripe-signature');

  if (!signatureHeader) {
    return NextResponse.json({ error: 'missing_signature' }, { status: 400 });
  }

  const payload = await request.text();
  await processStripeWebhook(payload, signatureHeader);

  return NextResponse.json({ received: true });
}
