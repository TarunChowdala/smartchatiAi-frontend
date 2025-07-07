import { useNavigate } from "react-router-dom";
import { ReactNode, useEffect } from "react";

interface ProtectedRouteProps {
  component: ReactNode;
}

const ProtectedRoute = ({ component }: ProtectedRouteProps) => {
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login", { replace: true });
    }
  }, [navigate]);

  const token = localStorage.getItem("token");
  if (!token) {
    return null;
  }

  return component;
};

export default ProtectedRoute;
