import { NextResponse } from 'next/server';

import { getCurrentUser } from '@/lib/auth/current-user';
import { listStarPointLedgerEntries } from '@/lib/star-points/ledger';
import { walletLogger } from '@/lib/logger';

export async function GET() {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ error: 'authentication_required' }, { status: 401 });
  }

  if (user.status === 'disabled') {
    return NextResponse.json({ error: 'user_not_allowed' }, { status: 403 });
  }

  try {
    const items = await listStarPointLedgerEntries(user.id);
    return NextResponse.json({ items });
  } catch (error) {
    walletLogger.error({ err: error }, 'Failed to fetch ledger entries');
    return NextResponse.json({ error: 'internal_server_error' }, { status: 500 });
  }
}
