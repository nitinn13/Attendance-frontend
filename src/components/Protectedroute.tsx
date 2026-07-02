import { Navigate, Outlet } from "react-router-dom";

type AllowedRole = "ADMIN" | "TEACHER" | "STUDENT";

/**
 * Decodes the JWT payload stored in localStorage without verifying the
 * signature — signature verification is the server's job. We only read
 * the `role` claim here to decide which UI to render. A tampered token
 * will simply fail on the first real API call (401 from authMiddleware).
 */
export function getRoleFromToken(): AllowedRole | null {
  try {
    const token = localStorage.getItem("token");
    if (!token) return null;

    const [, payloadB64] = token.split(".");
    if (!payloadB64) return null;

    // JWT uses base64url encoding — replace chars and pad before decoding.
    const padded = payloadB64
      .replace(/-/g, "+")
      .replace(/_/g, "/")
      .padEnd(payloadB64.length + ((4 - (payloadB64.length % 4)) % 4), "=");

    const payload = JSON.parse(atob(padded));

    const role = payload?.role;
    if (role === "ADMIN" || role === "TEACHER" || role === "STUDENT") {
      return role;
    }

    return null;
  } catch {
    // Malformed token — treat as unauthenticated.
    return null;
  }
}

interface ProtectedRouteProps {
  allowedRoles: AllowedRole[];
}

/**
 * Wraps a group of routes and enforces role-based access:
 *
 * - No token / malformed token → redirect to /
 * - Valid token but wrong role → redirect to the user's own section
 * - Valid token + correct role → render children via <Outlet />
 *
 * Usage in App.tsx:
 *   <Route element={<ProtectedRoute allowedRoles={["ADMIN"]} />}>
 *     <Route path="admin" element={<Layout />}>
 *       ...
 *     </Route>
 *   </Route>
 */
export default function ProtectedRoute({ allowedRoles }: ProtectedRouteProps) {
  const role = getRoleFromToken();

  // Not logged in at all.
  if (!role) {
    return <Navigate to="/" replace />;
  }

  // Logged in but trying to access a section that belongs to a different role.
  if (!allowedRoles.includes(role)) {
    const roleHome: Record<AllowedRole, string> = {
      ADMIN: "/admin",
      TEACHER: "/teacher",
      STUDENT: "/student",
    };
    return <Navigate to={roleHome[role]} replace />;
  }

  return <Outlet />;
}