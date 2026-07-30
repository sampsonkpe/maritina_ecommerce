class DeliveryService:

    BASE_FEE = 10
    PER_KM_RATE = 2
    MAX_FEE = 50

    @staticmethod
    def calculate_fee(distance_km):

        fee = (
            DeliveryService.BASE_FEE
            + (
                DeliveryService.PER_KM_RATE
                * distance_km
            )
        )

        return int(
            min(
                fee,
                DeliveryService.MAX_FEE,
            )
        )

    @staticmethod
    def estimate_distance(address_text):

        """
        MOCK distance estimator.

        Later this will call
        Google Maps / Mapbox
        using the address text.
        """

        return (len(address_text) % 10) + 1