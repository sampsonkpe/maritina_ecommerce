from django.core.management.base import BaseCommand

from apps.payments.services.paystack import (
    PaystackPaymentService,
)


class Command(BaseCommand):

    help = "Reconcile pending Paystack refunds."

    def handle(self, *args, **options):

        service = PaystackPaymentService()

        refund_count = (
            service.reconcile_pending_refunds()
        )

        self.stdout.write(
            self.style.SUCCESS(
                f"Reconciled {refund_count} refund(s)."
            )
        )