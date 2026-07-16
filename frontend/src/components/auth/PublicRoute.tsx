import { Navigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

interface PublicRouteProps {
  children: React.ReactNode;
}

export default function PublicRoute({
  children,
}: PublicRouteProps) {
  const { authenticated } = useAuth();

  return authenticated
    ? <Navigate to="/products" replace />
    : <>{children}</>;
}