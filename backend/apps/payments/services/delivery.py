import math


class DeliveryService:

    BASE_FEE = 1000
    PER_KM_RATE = 200
    MAX_FEE = 5000

    @staticmethod
    def calculate_fee(distance_km: float) -> int:

        fee = DeliveryService.BASE_FEE + (DeliveryService.PER_KM_RATE * distance_km)

        return int(min(fee, DeliveryService.MAX_FEE))


    @staticmethod
    def estimate_distance(address):

        """
        MOCKED for now (replace with real geo later)
        """

        # simulate Accra delivery distances
        return len(address.address_text) % 10 + 1