export type StarPointProduct = {
  code: string;
  name: string;
  points: number;
  amountCents: number;
  currency: 'usd';
};

export const STAR_POINT_PRODUCTS: ReadonlyArray<StarPointProduct> = [
  {
    code: 'star_100',
    name: '100 Star Points',
    points: 100,
    amountCents: 499,
    currency: 'usd',
  },
  {
    code: 'star_500',
    name: '500 Star Points',
    points: 500,
    amountCents: 1999,
    currency: 'usd',
  },
  {
    code: 'star_1000',
    name: '1,000 Star Points',
    points: 1000,
    amountCents: 3499,
    currency: 'usd',
  },
];

export function getStarPointProduct(productCode: string): StarPointProduct | null {
  return STAR_POINT_PRODUCTS.find((product) => product.code === productCode) ?? null;
}
