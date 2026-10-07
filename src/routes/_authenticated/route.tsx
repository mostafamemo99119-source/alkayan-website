import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  beforeLoad: () => {
    // Hardcoded auth check
    const isAuthenticated = localStorage.getItem("alkayan_admin_auth");
    if (isAuthenticated !== "true") {
      throw redirect({ to: "/auth" });
    }
  },
  component: () => <Outlet />,
});