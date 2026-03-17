import { NextResponse } from 'next/server';

import { getCurrentUser } from '@/lib/auth/current-user';
import { getStarPointProduct } from '@/lib/star-points/products';
import { createStarPointCheckoutSession } from '@/lib/star-points/purchases';
import { walletLogger } from '@/lib/logger';

export async function POST(request: Request) {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ error: 'authentication_required' }, { status: 401 });
  }

  if (user.status === 'disabled') {
    return NextResponse.json({ error: 'user_not_allowed' }, { status: 403 });
  }

  let body: { productCode?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'invalid_json' }, { status: 400 });
  }

  const product = body.productCode ? getStarPointProduct(body.productCode) : null;

  if (!product) {
    return NextResponse.json({ error: 'invalid_product' }, { status: 400 });
  }

  try {
    const { purchase, checkoutUrl } = await createStarPointCheckoutSession({
      user,
      product,
    });

    return NextResponse.json({
      purchaseId: purchase.id,
      checkoutUrl,
    });
  } catch (error) {
    walletLogger.error({ err: error }, 'Checkout session creation failed');
    return NextResponse.json({ error: 'internal_server_error' }, { status: 500 });
  }
}
