import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

const RequireAuth: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { loading, roleLoading, cmsUser } = useAuth();

  if (loading || roleLoading) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center text-body-sm text-muted">
        Loading dashboard...
      </div>
    );
  }

  if (!cmsUser?.is_active) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

export default RequireAuth;
