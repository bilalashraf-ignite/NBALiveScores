import crypto from 'crypto';

import {
  parseStripeWebhookEvent,
  verifyStripeWebhookSignature,
} from '@/lib/payments/stripe';

describe('Stripe webhook signature verification', () => {
  const originalSecret = process.env.STRIPE_WEBHOOK_SECRET;

  beforeEach(() => {
    process.env.STRIPE_WEBHOOK_SECRET = 'whsec_test_secret';
  });

  afterEach(() => {
    process.env.STRIPE_WEBHOOK_SECRET = originalSecret;
  });

  it('accepts a valid Stripe-style webhook signature', () => {
    const payload = JSON.stringify({
      id: 'evt_123',
      type: 'checkout.session.completed',
    });
    const timestamp = '1710595200';
    const signature = crypto
      .createHmac('sha256', 'whsec_test_secret')
      .update(`${timestamp}.${payload}`, 'utf8')
      .digest('hex');

    expect(() =>
      verifyStripeWebhookSignature(payload, `t=${timestamp},v1=${signature}`)
    ).not.toThrow();
  });

  it('parses a verified webhook event payload', () => {
    const payload = JSON.stringify({
      id: 'evt_123',
      type: 'checkout.session.completed',
      data: {
        object: {
          id: 'cs_test_123',
          metadata: {
            purchaseId: 'purchase_123',
          },
        },
      },
    });
    const timestamp = '1710595200';
    const signature = crypto
      .createHmac('sha256', 'whsec_test_secret')
      .update(`${timestamp}.${payload}`, 'utf8')
      .digest('hex');

    const event = parseStripeWebhookEvent(payload, `t=${timestamp},v1=${signature}`);

    expect(event.id).toBe('evt_123');
    expect(event.type).toBe('checkout.session.completed');
  });

  it('rejects an invalid webhook signature', () => {
    expect(() =>
      verifyStripeWebhookSignature(
        JSON.stringify({ id: 'evt_invalid' }),
        't=1710595200,v1=bad_signature'
      )
    ).toThrow('Invalid Stripe webhook signature.');
  });
});
