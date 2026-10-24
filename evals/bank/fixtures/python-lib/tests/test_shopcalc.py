import unittest
from shopcalc import apply_discount


class DiscountTest(unittest.TestCase):
    def test_simple(self):
        self.assertEqual(apply_discount(100, 10), 90)

    def test_rounds_to_two_decimals(self):
        self.assertEqual(apply_discount(19.99, 15), 16.99)

    def test_over_100_gives_zero(self):
        self.assertEqual(apply_discount(50, 150), 0)

    def test_negative_does_not_raise_price(self):
        self.assertEqual(apply_discount(100, -10), 100)


if __name__ == "__main__":
    unittest.main()
