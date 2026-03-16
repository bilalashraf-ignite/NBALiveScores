import { StarPointPurchaseStatus } from '@prisma/client';
import { NextResponse } from 'next/server';

import { getCurrentUser } from '@/lib/auth/current-user';
import { prisma } from '@/lib/db';
import { getStarPointBalance } from '@/lib/star-points/ledger';

export async function GET() {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ error: 'authentication_required' }, { status: 401 });
  }

  if (user.status === 'disabled') {
    return NextResponse.json({ error: 'user_not_allowed' }, { status: 403 });
  }

  const [balance, pendingPurchases] = await Promise.all([
    getStarPointBalance(user.id),
    prisma.starPointPurchase.count({
      where: {
        userId: user.id,
        status: {
          in: [
            StarPointPurchaseStatus.CREATED,
            StarPointPurchaseStatus.CHECKOUT_STARTED,
            StarPointPurchaseStatus.PAYMENT_PENDING,
          ],
        },
      },
    }),
  ]);

  return NextResponse.json({
    balance,
    pendingPurchases,
  });
}
