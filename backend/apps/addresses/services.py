from django.shortcuts import get_object_or_404

from .models import Address


class AddressService:

    @staticmethod
    def list_addresses(user):

        return (
            Address.objects
            .filter(user=user)
            .order_by(
                "-is_default",
                "-created_at",
            )
        )

    @staticmethod
    def create_address(user, data):

        has_addresses = Address.objects.filter(
            user=user
        ).exists()

        return Address.objects.create(
            user=user,
            is_default=not has_addresses,
            **data,
        )

    @staticmethod
    def update_address(
        user,
        address_id,
        data,
    ):

        address = get_object_or_404(
            Address,
            pk=address_id,
            user=user,
        )

        for field, value in data.items():
            setattr(address, field, value)

        address.save()

        return address

    @staticmethod
    def delete_address(
        user,
        address_id,
    ):

        address = get_object_or_404(
            Address,
            pk=address_id,
            user=user,
        )

        address.delete()

    @staticmethod
    def set_default_address(
        user,
        address_id,
    ):

        address = get_object_or_404(
            Address,
            pk=address_id,
            user=user,
        )

        Address.objects.filter(
            user=user,
            is_default=True,
        ).update(is_default=False)

        address.is_default = True
        address.save()

        return address