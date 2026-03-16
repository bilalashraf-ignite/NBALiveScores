import { POST } from '@/app/api/wallet/checkout-session/route';
import { getCurrentUser } from '@/lib/auth/current-user';
import { createStarPointCheckoutSession } from '@/lib/star-points/purchases';
import { getStarPointProduct } from '@/lib/star-points/products';

jest.mock('@/lib/auth/current-user', () => ({
  getCurrentUser: jest.fn(),
}));

jest.mock('@/lib/star-points/products', () => ({
  getStarPointProduct: jest.fn(),
}));

jest.mock('@/lib/star-points/purchases', () => ({
  createStarPointCheckoutSession: jest.fn(),
}));

describe('POST /api/wallet/checkout-session', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns 401 when unauthenticated', async () => {
    (getCurrentUser as jest.Mock).mockResolvedValue(null);

    const response = await POST(
      new Request('http://localhost:3000/api/wallet/checkout-session', {
        method: 'POST',
        body: JSON.stringify({ productCode: 'star_500' }),
        headers: { 'Content-Type': 'application/json' },
      })
    );

    expect(response.status).toBe(401);
    await expect(response.json()).resolves.toEqual({
      error: 'authentication_required',
    });
  });

  it('returns 400 when the product code is invalid', async () => {
    (getCurrentUser as jest.Mock).mockResolvedValue({
      id: 'user_123',
      email: 'user@example.com',
      status: 'active',
    });
    (getStarPointProduct as jest.Mock).mockReturnValue(null);

    const response = await POST(
      new Request('http://localhost:3000/api/wallet/checkout-session', {
        method: 'POST',
        body: JSON.stringify({ productCode: 'missing' }),
        headers: { 'Content-Type': 'application/json' },
      })
    );

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({
      error: 'invalid_product',
    });
  });

  it('creates a hosted checkout session for a valid bundle', async () => {
    (getCurrentUser as jest.Mock).mockResolvedValue({
      id: 'user_123',
      email: 'user@example.com',
      status: 'active',
    });
    (getStarPointProduct as jest.Mock).mockReturnValue({
      code: 'star_500',
      name: '500 Star Points',
      points: 500,
      amountCents: 1999,
      currency: 'usd',
    });
    (createStarPointCheckoutSession as jest.Mock).mockResolvedValue({
      purchase: { id: 'purchase_123' },
      checkoutUrl: 'https://checkout.stripe.test/session_123',
    });

    const response = await POST(
      new Request('http://localhost:3000/api/wallet/checkout-session', {
        method: 'POST',
        body: JSON.stringify({ productCode: 'star_500' }),
        headers: { 'Content-Type': 'application/json' },
      })
    );

    expect(createStarPointCheckoutSession).toHaveBeenCalledWith({
      user: {
        id: 'user_123',
        email: 'user@example.com',
        status: 'active',
      },
      product: expect.objectContaining({ code: 'star_500' }),
    });
    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      purchaseId: 'purchase_123',
      checkoutUrl: 'https://checkout.stripe.test/session_123',
    });
  });
});
