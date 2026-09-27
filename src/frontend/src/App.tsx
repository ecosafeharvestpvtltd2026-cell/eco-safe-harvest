import { createActor } from "@/backend";
import { LoadingState } from "@/components/common/LoadingState";
import { AppLayout } from "@/components/layout/AppLayout";
import { SessionProvider } from "@/context/SessionContext";
import { useSession } from "@/hooks/useSession";
import { api } from "@/lib/api";
import { DashboardPage } from "@/pages/DashboardPage";
import { FarmerDetailPage } from "@/pages/FarmerDetailPage";
import { FarmersPage } from "@/pages/FarmersPage";
import { HarvestEntryPage } from "@/pages/HarvestEntryPage";
import { HarvestPage } from "@/pages/HarvestPage";
import { LoginPage } from "@/pages/LoginPage";
import { OfficersPage } from "@/pages/OfficersPage";
import { PricesPage } from "@/pages/PricesPage";
import { ReportsPage } from "@/pages/ReportsPage";
import type { Session } from "@/types";
import { createActorWithConfig } from "@caffeineai/core-infrastructure";
import { type QueryClient, useQueryClient } from "@tanstack/react-query";
import {
  Outlet,
  RouterProvider,
  createRootRoute,
  createRoute,
  createRouter,
  redirect,
} from "@tanstack/react-router";

/** Full-screen loading view shown while the session is being restored. */
function SessionGate() {
  const { session, isLoading } = useSession();

  if (isLoading) {
    return (
      <div className="mx-auto w-full max-w-2xl px-4 py-10">
        <LoadingState rows={3} />
      </div>
    );
  }

  if (!session) {
    return <LoginPage />;
  }

  return (
    <AppLayout>
      <Outlet />
    </AppLayout>
  );
}

const rootRoute = createRootRoute({
  component: () => (
    <SessionProvider>
      <SessionGate />
    </SessionProvider>
  ),
});

/** Router context carrying the React Query cache for route guards. */
interface RouterContext {
  queryClient: QueryClient;
}

/**
 * Redirect non-admin users away from an admin-only route.
 *
 * The session is resolved from the backend directly rather than from the
 * query cache: `beforeLoad` runs before `SessionProvider` mounts, so on a
 * hard refresh or deep link the cache is still empty and a cached lookup
 * would wrongly bounce an admin to the dashboard.
 */
async function requireAdmin(ctx: { context: unknown }) {
  const { queryClient } = ctx.context as RouterContext;
  const cached = queryClient.getQueryData<Session | null>(["session"]);
  if (cached) {
    if (cached.role !== "admin") {
      throw redirect({ to: "/dashboard" });
    }
    return;
  }

  const actor = await createActorWithConfig(createActor);
  const session = await api.getSession(actor);
  queryClient.setQueryData(["session"], session);
  if (session?.role !== "admin") {
    throw redirect({ to: "/dashboard" });
  }
}

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  beforeLoad: () => {
    throw redirect({ to: "/dashboard" });
  },
});

const dashboardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/dashboard",
  component: DashboardPage,
});

const farmersRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/farmers",
  component: FarmersPage,
});

const farmerDetailRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/farmers/$farmerId",
  component: FarmerDetailPage,
});

const harvestEntryRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/harvest/new",
  component: HarvestEntryPage,
});

const harvestRecordsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/harvest",
  component: HarvestPage,
});

const reportsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/reports",
  component: ReportsPage,
});

const pricesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/prices",
  beforeLoad: requireAdmin,
  component: PricesPage,
});

const officersRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/officers",
  beforeLoad: requireAdmin,
  component: OfficersPage,
});

const routeTree = rootRoute.addChildren([
  indexRoute,
  dashboardRoute,
  farmersRoute,
  farmerDetailRoute,
  harvestEntryRoute,
  harvestRecordsRoute,
  reportsRoute,
  pricesRoute,
  officersRoute,
]);

const router = createRouter({
  routeTree,
  context: {
    queryClient: undefined as unknown as RouterContext["queryClient"],
  },
});

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  const queryClient = useQueryClient();
  return <RouterProvider router={router} context={{ queryClient }} />;
}
