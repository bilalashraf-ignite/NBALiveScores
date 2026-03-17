import { GET } from '@/app/api/star-points/ledger/route';
import { getCurrentUser } from '@/lib/auth/current-user';
import { listStarPointLedgerEntries } from '@/lib/star-points/ledger';

jest.mock('@/lib/auth/current-user', () => ({
  getCurrentUser: jest.fn(),
}));

jest.mock('@/lib/star-points/ledger', () => ({
  listStarPointLedgerEntries: jest.fn(),
}));

describe('GET /api/star-points/ledger', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns 403 for disabled users', async () => {
    (getCurrentUser as jest.Mock).mockResolvedValue({
      id: 'user_123',
      status: 'disabled',
    });

    const response = await GET();

    expect(response.status).toBe(403);
    await expect(response.json()).resolves.toEqual({
      error: 'user_not_allowed',
    });
  });

  it('returns ledger entries for the current user', async () => {
    (getCurrentUser as jest.Mock).mockResolvedValue({
      id: 'user_123',
      email: 'user@example.com',
      status: 'active',
    });
    (listStarPointLedgerEntries as jest.Mock).mockResolvedValue([
      {
        id: 'entry_123',
        entryType: 'CREDIT_PURCHASE',
        pointsDelta: 500,
        reason: 'Purchased star_500',
        createdAt: '2026-03-16T12:00:00.000Z',
      },
    ]);

    const response = await GET();

    expect(listStarPointLedgerEntries).toHaveBeenCalledWith('user_123');
    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      items: [
        {
          id: 'entry_123',
          entryType: 'CREDIT_PURCHASE',
          pointsDelta: 500,
          reason: 'Purchased star_500',
          createdAt: '2026-03-16T12:00:00.000Z',
        },
      ],
    });
  });
});
