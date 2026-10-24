import unittest
from shopcalc import apply_discount


class Hidden(unittest.TestCase):
    def test_100(self):
        self.assertEqual(apply_discount(59.99, 100), 0)

    def test_zero_price(self):
        self.assertEqual(apply_discount(0, 50), 0)

    def test_repeating(self):
        self.assertEqual(apply_discount(10, 33.333), 6.67)

    def test_decimal(self):
        self.assertEqual(apply_discount(200, 12.5), 175)
