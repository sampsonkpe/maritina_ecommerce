from .models import AuditLog


def record_admin_action(
    *,
    admin,
    action,
    object_type,
    object_id,
    details=None,
):
    return AuditLog.objects.create(
        admin=admin,
        action=action,
        object_type=object_type,
        object_id=object_id,
        details=details or {},
    )