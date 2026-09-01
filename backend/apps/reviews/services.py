from .models import Review

from apps.orders.models import OrderItem
from apps.common.constants import PAYMENT_PAID


class ReviewService:

    @staticmethod
    def list_product_reviews(product_id):

        return (
            Review.objects
            .filter(product_id=product_id)
            .select_related(
                "user",
                "product",
                "variant",
            )
        )

    @staticmethod
    def create_review(
        *,
        user,
        product,
        variant,
        rating,
        comment,
    ):

        if variant.product_id != product.id:
            raise ValueError(
                "This variant does not belong to this product."
            )

        already_reviewed = Review.objects.filter(
            user=user,
            variant=variant,
        ).exists()

        if already_reviewed:
            raise ValueError(
                "You have already reviewed this product variant."
            )

        purchased = (
            OrderItem.objects
            .filter(
                order__user=user,
                product_name=product.name,
                variant_name=variant.name,
                order__payment_status=PAYMENT_PAID,
            )
            .exists()
        )

        if not purchased:
            raise ValueError(
                "You can only review products you have purchased."
            )

        return Review.objects.create(
            user=user,
            product=product,
            variant=variant,
            rating=rating,
            comment=comment,
        )