import {
  Prisma,
  StarPointLedgerEntryType,
  StarPointPurchaseStatus,
} from '@prisma/client';

import { prisma } from '@/lib/db';

export async function grantStarPointsForPurchase(purchaseId: string) {
  return prisma.$transaction(async (tx) => {
    const purchase = await tx.starPointPurchase.findUnique({
      where: { id: purchaseId },
    });

    if (!purchase) {
      throw new Error(`Purchase ${purchaseId} not found.`);
    }

    const existingGrant = await tx.starPointLedgerEntry.findFirst({
      where: {
        purchaseId,
        entryType: StarPointLedgerEntryType.CREDIT_PURCHASE,
      },
    });

    if (existingGrant) {
      if (purchase.status !== StarPointPurchaseStatus.POINTS_GRANTED) {
        await tx.starPointPurchase.update({
          where: { id: purchaseId },
          data: {
            status: StarPointPurchaseStatus.POINTS_GRANTED,
            completedAt: purchase.completedAt ?? new Date(),
          },
        });
      }

      return existingGrant;
    }

    const grantedAt = new Date();

    const ledgerEntry = await tx.starPointLedgerEntry.create({
      data: {
        userId: purchase.userId,
        purchaseId: purchase.id,
        entryType: StarPointLedgerEntryType.CREDIT_PURCHASE,
        pointsDelta: purchase.points,
        reason: `Purchased ${purchase.productCode}`,
        metadata: {
          provider: purchase.provider,
          providerSessionId: purchase.providerSessionId,
          providerPaymentIntentId: purchase.providerPaymentIntentId,
        } satisfies Prisma.JsonObject,
      },
    });

    await tx.starPointPurchase.update({
      where: { id: purchaseId },
      data: {
        status: StarPointPurchaseStatus.POINTS_GRANTED,
        completedAt: grantedAt,
      },
    });

    return ledgerEntry;
  });
}

export async function reverseStarPointsForPurchase(
  purchaseId: string,
  reason = 'Refunded purchase'
) {
  return prisma.$transaction(async (tx) => {
    const purchase = await tx.starPointPurchase.findUnique({
      where: { id: purchaseId },
    });

    if (!purchase) {
      throw new Error(`Purchase ${purchaseId} not found.`);
    }

    const existingRefund = await tx.starPointLedgerEntry.findFirst({
      where: {
        purchaseId,
        entryType: StarPointLedgerEntryType.DEBIT_REFUND,
      },
    });

    if (existingRefund) {
      if (purchase.status !== StarPointPurchaseStatus.REFUNDED) {
        await tx.starPointPurchase.update({
          where: { id: purchaseId },
          data: {
            status: StarPointPurchaseStatus.REFUNDED,
            completedAt: purchase.completedAt ?? new Date(),
          },
        });
      }

      return existingRefund;
    }

    const refundEntry = await tx.starPointLedgerEntry.create({
      data: {
        userId: purchase.userId,
        purchaseId: purchase.id,
        entryType: StarPointLedgerEntryType.DEBIT_REFUND,
        pointsDelta: -purchase.points,
        reason,
        metadata: {
          provider: purchase.provider,
          providerSessionId: purchase.providerSessionId,
          providerPaymentIntentId: purchase.providerPaymentIntentId,
          providerChargeId: purchase.providerChargeId,
        } satisfies Prisma.JsonObject,
      },
    });

    await tx.starPointPurchase.update({
      where: { id: purchaseId },
      data: {
        status: StarPointPurchaseStatus.REFUNDED,
        completedAt: new Date(),
      },
    });

    return refundEntry;
  });
}

export async function getStarPointBalance(userId: string): Promise<number> {
  const result = await prisma.starPointLedgerEntry.aggregate({
    where: { userId },
    _sum: { pointsDelta: true },
  });

  return result._sum.pointsDelta ?? 0;
}

export async function listStarPointLedgerEntries(userId: string) {
  return prisma.starPointLedgerEntry.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
  });
}
