def get_payment_method(data):
    channel = data.get("channel")

    if channel == "card":
        return "Card"

    if channel == "bank":
        return "Bank"

    if channel == "bank_transfer":
        return "Bank Transfer"

    if channel == "mobile_money":
        authorization = data.get("authorization") or {}

        provider = (
            authorization.get("bank")
            or authorization.get("brand")
            or ""
        )

        provider_lower = provider.lower()

        if "mtn" in provider_lower:
            return "MTN MoMo"

        if "airtel" in provider_lower or "tigo" in provider_lower:
            return "Airtel Money"

        if "telecel" in provider_lower or "vodafone" in provider_lower:
            return "Telecel Cash"

        return "Mobile Money"

    if channel == "ussd":
        return "USSD"

    if channel == "qr":
        return "QR"

    return (
        channel.replace("_", " ").title()
        if channel
        else "Paystack"
    )


def map_refund_status(status, Refund):
    return {
        "pending": Refund.STATUS_PENDING,
        "processing": Refund.STATUS_PROCESSING,
        "needs-attention": Refund.STATUS_NEEDS_ATTENTION,
        "processed": Refund.STATUS_PROCESSED,
        "failed": Refund.STATUS_FAILED,
    }.get(
        status,
        Refund.STATUS_PENDING,
    )