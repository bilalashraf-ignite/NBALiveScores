import { NextResponse } from 'next/server';

import { getCurrentUser } from '@/lib/auth/current-user';
import { listStarPointLedgerEntries } from '@/lib/star-points/ledger';

export async function GET() {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ error: 'authentication_required' }, { status: 401 });
  }

  if (user.status === 'disabled') {
    return NextResponse.json({ error: 'user_not_allowed' }, { status: 403 });
  }

  const items = await listStarPointLedgerEntries(user.id);

  return NextResponse.json({ items });
}
