export const PURCHASE_COLOR = '#c084e8';
export function purchaseColor(isNew: boolean | undefined, original: string) {
  return isNew === true ? PURCHASE_COLOR : original;
}
