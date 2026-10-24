def apply_discount(price, percent):
    """Precio tras un descuento porcentual (0-100), redondeado a 2 decimales."""
    p = min(max(percent, 0), 100)
    return round(price * (1 - p / 100), 2)
