import {
  Prisma,
  StarPointLedgerEntryType,
  StarPointPurchaseStatus,
} from '@prisma/client';

import { prisma } from '@/lib/db';

// Transaction client type for use in external transactions
export type TransactionClient = Omit<
  typeof prisma,
  '$connect' | '$disconnect' | '$on' | '$transaction' | '$use' | '$extends'
>;

/**
 * Core implementation that accepts a transaction client.
 * Use this when you need to include the operation in a larger transaction.
 */
export async function grantStarPointsForPurchaseWithTx(
  purchaseId: string,
  tx: TransactionClient
) {
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
}

/**
 * Grants star points for a purchase.
 * Creates its own transaction when called standalone.
 */
export async function grantStarPointsForPurchase(purchaseId: string) {
  return prisma.$transaction(async (tx) => {
    return grantStarPointsForPurchaseWithTx(purchaseId, tx);
  });
}

/**
 * Core implementation that accepts a transaction client.
 * Use this when you need to include the operation in a larger transaction.
 */
export async function reverseStarPointsForPurchaseWithTx(
  purchaseId: string,
  tx: TransactionClient,
  reason = 'Refunded purchase'
) {
    const purchase = await tx.starPointPurchase.findUnique({
      where: { id: purchaseId },
    });

    if (!purchase) {
      throw new Error(`Purchase ${purchaseId} not found.`);
    }

    // Verify points were actually granted before allowing refund
    const existingCredit = await tx.starPointLedgerEntry.findFirst({
      where: {
        purchaseId,
        entryType: StarPointLedgerEntryType.CREDIT_PURCHASE,
      },
    });

    if (!existingCredit) {
      throw new Error(`No credit for purchase ${purchaseId} to refund.`);
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
}

/**
 * Reverses star points for a purchase (refund).
 * Creates its own transaction when called standalone.
 */
export async function reverseStarPointsForPurchase(
  purchaseId: string,
  reason = 'Refunded purchase'
) {
  return prisma.$transaction(async (tx) => {
    return reverseStarPointsForPurchaseWithTx(purchaseId, tx, reason);
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
