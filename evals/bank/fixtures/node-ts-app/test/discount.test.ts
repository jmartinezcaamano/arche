import { test } from "node:test";
import assert from "node:assert/strict";
import { applyDiscount } from "../src/discount.ts";

test("aplica un descuento simple", () => {
  assert.equal(applyDiscount(100, 10), 90);
});
test("redondea a 2 decimales", () => {
  assert.equal(applyDiscount(19.99, 15), 16.99);
});
test("un descuento mayor que 100 deja el precio en 0", () => {
  assert.equal(applyDiscount(50, 150), 0);
});
test("un descuento negativo no encarece", () => {
  assert.equal(applyDiscount(100, -10), 100);
});
