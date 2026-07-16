import { Navigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

interface AdminRouteProps {
  children: React.ReactNode;
}

export default function AdminRoute({
  children,
}: AdminRouteProps) {
  const {
    authenticated,
    user,
  } = useAuth();

  if (!authenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!user?.is_staff) {
    return <Navigate to="/products" replace />;
  }

  return <>{children}</>;
}