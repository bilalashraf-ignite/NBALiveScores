import { GET } from '@/app/api/star-points/balance/route';
import { getCurrentUser } from '@/lib/auth/current-user';
import { prisma } from '@/lib/db';
import { getStarPointBalance } from '@/lib/star-points/ledger';

jest.mock('@/lib/auth/current-user', () => ({
  getCurrentUser: jest.fn(),
}));

jest.mock('@/lib/db', () => ({
  prisma: {
    starPointPurchase: {
      count: jest.fn(),
    },
  },
}));

jest.mock('@/lib/star-points/ledger', () => ({
  getStarPointBalance: jest.fn(),
}));

describe('GET /api/star-points/balance', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns 401 when unauthenticated', async () => {
    (getCurrentUser as jest.Mock).mockResolvedValue(null);

    const response = await GET();

    expect(response.status).toBe(401);
    await expect(response.json()).resolves.toEqual({
      error: 'authentication_required',
    });
  });

  it('returns the user balance and pending purchase count', async () => {
    (getCurrentUser as jest.Mock).mockResolvedValue({
      id: 'user_123',
      email: 'user@example.com',
      status: 'active',
    });
    (getStarPointBalance as jest.Mock).mockResolvedValue(500);
    (prisma.starPointPurchase.count as jest.Mock).mockResolvedValue(1);

    const response = await GET();

    expect(getStarPointBalance).toHaveBeenCalledWith('user_123');
    expect(prisma.starPointPurchase.count).toHaveBeenCalled();
    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      balance: 500,
      pendingPurchases: 1,
    });
  });
});
