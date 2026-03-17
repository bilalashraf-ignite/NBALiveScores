import crypto from 'crypto';

import { PaymentProviderError, getAppBaseUrl } from '@/lib/payments/provider';

type StripeCustomer = {
  id: string;
};

type StripeCheckoutSession = {
  id: string;
  url: string | null;
  payment_intent?: string | null;
};

export type StripeWebhookEvent<T = Record<string, unknown>> = {
  id: string;
  type: string;
  data: {
    object: T;
  };
};

export type StripeCheckoutSessionObject = {
  id: string;
  customer?: string | null;
  payment_intent?: string | null;
  payment_status?: string | null;
  metadata?: Record<string, string> | null;
};

export type StripeChargeObject = {
  id: string;
  payment_intent?: string | null;
  metadata?: Record<string, string> | null;
  refunded?: boolean;
};

function getStripeSecretKey(): string {
  const secretKey = process.env.STRIPE_SECRET_KEY;

  if (!secretKey) {
    throw new PaymentProviderError('Missing STRIPE_SECRET_KEY.');
  }

  return secretKey;
}

function getStripeWebhookSecret(): string {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!webhookSecret) {
    throw new PaymentProviderError('Missing STRIPE_WEBHOOK_SECRET.');
  }

  return webhookSecret;
}

function toFormData(
  input: Record<string, string | number | undefined | null>
): URLSearchParams {
  const params = new URLSearchParams();

  for (const [key, value] of Object.entries(input)) {
    if (value === undefined || value === null) {
      continue;
    }

    params.append(key, String(value));
  }

  return params;
}

async function stripeRequest<T>(
  path: string,
  body: URLSearchParams,
  idempotencyKey?: string
): Promise<T> {
  const response = await fetch(`https://api.stripe.com${path}`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${getStripeSecretKey()}`,
      'Content-Type': 'application/x-www-form-urlencoded',
      ...(idempotencyKey ? { 'Idempotency-Key': idempotencyKey } : {}),
    },
    body: body.toString(),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new PaymentProviderError(
      `Stripe request failed (${response.status}): ${errorBody}`
    );
  }

  return response.json() as Promise<T>;
}

export async function createStripeCustomer(input: {
  userId: string;
  email?: string | null;
}): Promise<StripeCustomer> {
  const body = toFormData({
    email: input.email ?? undefined,
    'metadata[userId]': input.userId,
  });

  return stripeRequest<StripeCustomer>(
    '/v1/customers',
    body,
    `wallet-customer-${input.userId}`
  );
}

export async function createStripeCheckoutSession(input: {
  customerId: string;
  purchaseId: string;
  productCode: string;
  productName: string;
  amountCents: number;
  currency: string;
  points: number;
  userId: string;
}): Promise<StripeCheckoutSession> {
  const appBaseUrl = getAppBaseUrl();
  const body = toFormData({
    mode: 'payment',
    customer: input.customerId,
    success_url: `${appBaseUrl}/wallet/success?purchaseId=${input.purchaseId}`,
    cancel_url: `${appBaseUrl}/wallet/cancel?purchaseId=${input.purchaseId}`,
    'line_items[0][quantity]': 1,
    'line_items[0][price_data][currency]': input.currency,
    'line_items[0][price_data][unit_amount]': input.amountCents,
    'line_items[0][price_data][product_data][name]': input.productName,
    'metadata[purchaseId]': input.purchaseId,
    'metadata[userId]': input.userId,
    'metadata[productCode]': input.productCode,
    'metadata[points]': input.points,
    'payment_intent_data[metadata][purchaseId]': input.purchaseId,
    'payment_intent_data[metadata][userId]': input.userId,
    'saved_payment_method_options[payment_method_save]': 'enabled',
  });

  return stripeRequest<StripeCheckoutSession>(
    '/v1/checkout/sessions',
    body,
    `wallet-checkout-${input.purchaseId}`
  );
}

function parseStripeSignature(signatureHeader: string): {
  timestamp: string;
  signatures: string[];
} {
  const pairs = signatureHeader.split(',').map((part) => part.trim());
  const timestamp = pairs.find((part) => part.startsWith('t='))?.slice(2);
  const signatures = pairs
    .filter((part) => part.startsWith('v1='))
    .map((part) => part.slice(3));

  if (!timestamp || signatures.length === 0) {
    throw new PaymentProviderError('Invalid Stripe signature header.');
  }

  return { timestamp, signatures };
}

function secureCompare(a: string, b: string): boolean {
  const left = Buffer.from(a);
  const right = Buffer.from(b);

  if (left.length !== right.length) {
    return false;
  }

  return crypto.timingSafeEqual(left, right);
}

export function verifyStripeWebhookSignature(
  payload: string,
  signatureHeader: string
): void {
  const { timestamp, signatures } = parseStripeSignature(signatureHeader);

  // Validate timestamp is within 5-minute tolerance to prevent replay attacks
  const timestampSeconds = parseInt(timestamp, 10);
  const currentSeconds = Math.floor(Date.now() / 1000);
  const tolerance = 300; // 5 minutes in seconds

  if (
    isNaN(timestampSeconds) ||
    timestampSeconds < currentSeconds - tolerance ||
    timestampSeconds > currentSeconds + tolerance
  ) {
    throw new PaymentProviderError('Stripe webhook timestamp outside tolerance window.');
  }

  const signedPayload = `${timestamp}.${payload}`;
  const expected = crypto
    .createHmac('sha256', getStripeWebhookSecret())
    .update(signedPayload, 'utf8')
    .digest('hex');

  const isValid = signatures.some((signature) => secureCompare(signature, expected));

  if (!isValid) {
    throw new PaymentProviderError('Invalid Stripe webhook signature.');
  }
}

export function parseStripeWebhookEvent(
  payload: string,
  signatureHeader: string
): StripeWebhookEvent {
  verifyStripeWebhookSignature(payload, signatureHeader);
  return JSON.parse(payload) as StripeWebhookEvent;
}
