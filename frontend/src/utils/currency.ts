export function formatCurrency(
  amount: number | string
): string {
  return `GH₵ ${Number(amount).toFixed(2)}`;
}