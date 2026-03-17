export interface UserProfile {
  id: string;
  name: string | null;
  email: string | null;
  emailVerified: Date | null;
  image: string | null;
  phone: string | null;
  bio: string | null;
  location: string | null;
  birthday: Date | null;
  gender: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface UpdateProfileData {
  name?: string;
  phone?: string;
  bio?: string;
  location?: string;
  birthday?: string; // ISO date string
  gender?: string;
}

export interface LinkedAccount {
  id: string;
  provider: string;
  providerAccountId: string;
}

export type Gender = "male" | "female" | "other" | "prefer_not_to_say";

export const genderOptions: { value: Gender; label: string }[] = [
  { value: "male", label: "Male" },
  { value: "female", label: "Female" },
  { value: "other", label: "Other" },
  { value: "prefer_not_to_say", label: "Prefer not to say" },
];

// Star Points / Wallet Types
export interface StarPointBalance {
  balance: number;
  pendingPurchases: number;
}

export interface StarPointLedgerEntry {
  id: string;
  userId: string;
  purchaseId: string | null;
  entryType: 'CREDIT_PURCHASE' | 'DEBIT_SPEND' | 'DEBIT_REFUND' | 'CREDIT_ADJUSTMENT' | 'DEBIT_ADJUSTMENT';
  pointsDelta: number;
  reason: string;
  metadata: Record<string, unknown> | null;
  createdAt: string;
}

export interface StarPointProduct {
  code: string;
  name: string;
  points: number;
  amountCents: number;
  currency: 'usd';
}

export interface CheckoutSessionResponse {
  purchaseId: string;
  checkoutUrl: string;
}
