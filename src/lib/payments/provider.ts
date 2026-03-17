export const PAYMENT_PROVIDER = 'stripe' as const;

export type PaymentProvider = typeof PAYMENT_PROVIDER;

export class PaymentProviderError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'PaymentProviderError';
  }
}

export function getAppBaseUrl(): string {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? process.env.NEXTAUTH_URL;

  if (!appUrl) {
    throw new PaymentProviderError('Missing NEXT_PUBLIC_APP_URL or NEXTAUTH_URL.');
  }

  return appUrl.replace(/\/$/, '');
}
