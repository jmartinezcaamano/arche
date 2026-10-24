import { test } from "node:test";
import assert from "node:assert/strict";
import { applyDiscount } from "../src/discount.ts";

test("100% deja el precio en 0", () => assert.equal(applyDiscount(59.99, 100), 0));
test("precio 0 sigue en 0", () => assert.equal(applyDiscount(0, 50), 0));
test("redondea una fracción periódica", () => assert.equal(applyDiscount(10, 33.333), 6.67));
test("descuento decimal", () => assert.equal(applyDiscount(200, 12.5), 175));
