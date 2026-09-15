// =====================================================
// ProtectedRoute — role-based route guard
// Usage:
//   <ProtectedRoute allowedRoles={["admin"]}> <AdminDashboard /> </ProtectedRoute>
//   <ProtectedRoute allowedRoles={["user"]}> <Checkout /> </ProtectedRoute>
//   <CustomerOnlyRoute> <Home /> </CustomerOnlyRoute>
// =====================================================

import { Navigate, useLocation } from "react-router-dom";

export function getStoredUser() {
  try {
    const raw =
      localStorage.getItem("user") || sessionStorage.getItem("user");
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function getToken() {
  return localStorage.getItem("token") || sessionStorage.getItem("token");
}

export function CustomerOnlyRoute({ children }) {
  const token = getToken();
  const user  = getStoredUser();

  // If logged in as vendor/admin/delivery, redirect to their dashboard (no customer UI)
  if (token && user) {
    const role = user.role || "user";
    if (role === "vendor")   return <Navigate to="/vendor-dashboard" replace />;
    if (role === "admin")    return <Navigate to="/admin-dashboard"  replace />;
    if (role === "delivery") return <Navigate to="/delivery-dashboard" replace />;
  }

  return children;
}

function ProtectedRoute({ children, allowedRoles = [] }) {
  const location = useLocation();
  const token = getToken();
  const user  = getStoredUser();

  // Not logged in → send to login
  if (!token || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  const role = user.role || "user";

  // Role check (skip if no roles specified = any logged-in user is fine)
  if (allowedRoles.length > 0 && !allowedRoles.includes(role)) {
    // Redirect to their proper home
    if (role === "admin")    return <Navigate to="/admin-dashboard"    replace />;
    if (role === "vendor")   return <Navigate to="/vendor-dashboard"   replace />;
    if (role === "delivery") return <Navigate to="/delivery-dashboard" replace />;
    return <Navigate to="/" replace />;
  }

  return children;
}

export default ProtectedRoute;
