import { POST } from '@/app/api/wallet/webhooks/stripe/route';
import { processStripeWebhook } from '@/lib/payments/webhooks';

jest.mock('@/lib/payments/webhooks', () => ({
  processStripeWebhook: jest.fn(),
}));

describe('POST /api/wallet/webhooks/stripe', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns 400 when the Stripe signature is missing', async () => {
    const response = await POST(
      new Request('http://localhost:3000/api/wallet/webhooks/stripe', {
        method: 'POST',
        body: JSON.stringify({ id: 'evt_123' }),
      })
    );

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({
      error: 'missing_signature',
    });
  });

  it('processes signed webhook payloads', async () => {
    (processStripeWebhook as jest.Mock).mockResolvedValue({
      duplicate: false,
      eventId: 'evt_123',
      outcome: 'processed',
    });

    const payload = JSON.stringify({ id: 'evt_123', type: 'checkout.session.completed' });
    const response = await POST(
      new Request('http://localhost:3000/api/wallet/webhooks/stripe', {
        method: 'POST',
        body: payload,
        headers: {
          'stripe-signature': 't=123,v1=signature',
        },
      })
    );

    expect(processStripeWebhook).toHaveBeenCalledWith(payload, 't=123,v1=signature');
    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ received: true });
  });
});
