/** Precio tras aplicar un descuento porcentual (0-100), redondeado a 2 decimales. */
export function applyDiscount(price: number, percent: number): number {
  const p = Math.min(Math.max(percent, 0), 100);
  return Math.round(price * (1 - p / 100) * 100) / 100;
}
