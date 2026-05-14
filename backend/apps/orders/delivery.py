from .delivery import DeliveryService

class DeliveryService:

    BASE_FEE = 1000
    PER_KM_RATE = 200
    MAX_FEE = 5000

    @staticmethod
    def calculate_fee(distance_km):

        fee = (
            DeliveryService.BASE_FEE
            + (DeliveryService.PER_KM_RATE * distance_km)
        )

        return int(min(fee, DeliveryService.MAX_FEE))

    @staticmethod
    def estimate_distance(address):

        """
        MOCK distance estimator.
        Replace later with Google Maps / GPS.
        """

        return (len(address.address_text) % 10) + 1