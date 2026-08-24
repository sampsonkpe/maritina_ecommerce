from django.core.management.base import BaseCommand

from apps.payments.services.paystack import (
    PaystackPaymentService,
)


class Command(BaseCommand):

    help = "Reconcile initiated Paystack payments."

    def handle(self, *args, **options):

        service = PaystackPaymentService()

        count = service.reconcile_pending_payments()

        self.stdout.write(
            self.style.SUCCESS(
                f"Reconciled {count} payment(s)."
            )
        )