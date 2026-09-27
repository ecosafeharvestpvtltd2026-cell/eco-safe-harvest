import type { backendInterface } from "@/backend";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  RouterProvider,
  createMemoryHistory,
  createRootRoute,
  createRoute,
  createRouter,
} from "@tanstack/react-router";
import { type RenderResult, render } from "@testing-library/react";
import type { ReactElement, ReactNode } from "react";
import { vi } from "vitest";

/**
 * A typed local stand-in for the generated backend actor.
 *
 * Every method is a `vi.fn()` so a test can assert the exact call the UI made.
 * Defaults are deliberately inert: reads resolve to empty collections and
 * writes resolve to a benign `ok`, so a page renders its empty state unless a
 * test overrides the method it cares about. This is a mock seam only — it
 * proves nothing about the real canister.
 */
export type ActorMock = {
  [K in keyof backendInterface]: ReturnType<typeof vi.fn>;
};

/** Build a fresh actor mock with inert defaults for every public method. */
export function createActorMock(): ActorMock {
  return {
    _initialize_access_control: vi.fn().mockResolvedValue(undefined),
    _internet_identity_sign_in_finish: vi
      .fn()
      .mockResolvedValue({ __kind__: "ok", ok: null }),
    _internet_identity_sign_in_start: vi
      .fn()
      .mockResolvedValue(new Uint8Array()),
    addFarmer: vi.fn().mockResolvedValue({ __kind__: "ok", ok: null }),
    addHarvest: vi.fn().mockResolvedValue({ __kind__: "ok", ok: null }),
    assignCallerUserRole: vi.fn().mockResolvedValue(undefined),
    createOfficer: vi.fn().mockResolvedValue({ __kind__: "ok", ok: null }),
    deleteHarvest: vi.fn().mockResolvedValue({ __kind__: "ok", ok: null }),
    execute: vi.fn().mockResolvedValue({ hasMore: false, rows: [] }),
    getApiDoc: vi.fn().mockResolvedValue(""),
    getCallerUserRole: vi.fn().mockResolvedValue("guest"),
    getDashboard: vi.fn().mockResolvedValue({
      stats: {
        totalValue: 0n,
        date: "2026-09-25",
        totalKg: 0n,
        farmerCount: 0n,
        recordCount: 0n,
      },
      recent: [],
    }),
    getFarmer: vi.fn().mockResolvedValue(null),
    getFarmerHarvests: vi.fn().mockResolvedValue([]),
    getHarvest: vi.fn().mockResolvedValue(null),
    getReport: vi.fn().mockResolvedValue({
      __kind__: "ok",
      ok: {
        to: "2026-09-25",
        totalValue: 0n,
        from: "2026-09-25",
        totalKg: 0n,
        kind: "daily",
        rows: [],
        recordCount: 0n,
      },
    }),
    getSeededCredentials: vi.fn().mockResolvedValue([]),
    getSession: vi.fn().mockResolvedValue(null),
    isCallerAdmin: vi.fn().mockResolvedValue(false),
    listFarmers: vi.fn().mockResolvedValue([]),
    listHarvests: vi.fn().mockResolvedValue([]),
    listOfficers: vi.fn().mockResolvedValue([]),
    listPrices: vi.fn().mockResolvedValue([]),
    login: vi.fn().mockResolvedValue({ __kind__: "ok", ok: null }),
    logout: vi.fn().mockResolvedValue(undefined),
    resetOfficerPassword: vi
      .fn()
      .mockResolvedValue({ __kind__: "ok", ok: null }),
    schema: vi.fn().mockResolvedValue(""),
    searchFarmers: vi.fn().mockResolvedValue([]),
    setPrice: vi.fn().mockResolvedValue({ __kind__: "ok", ok: null }),
    updateFarmer: vi.fn().mockResolvedValue({ __kind__: "ok", ok: null }),
    updateHarvest: vi.fn().mockResolvedValue({ __kind__: "ok", ok: null }),
    updateOfficer: vi.fn().mockResolvedValue({ __kind__: "ok", ok: null }),
  };
}

/** A fresh QueryClient with retries disabled so failures surface immediately. */
export function createTestQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: 0, staleTime: 0 },
      mutations: { retry: false },
    },
  });
}

/** Wrap a tree in a fresh QueryClientProvider. */
export function renderWithQueryClient(
  ui: ReactElement,
  queryClient: QueryClient = createTestQueryClient(),
): RenderResult & { queryClient: QueryClient } {
  const result = render(
    <QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>,
  );
  return { ...result, queryClient };
}

/** Wrap a tree in a QueryClientProvider without rendering (for custom render). */
export function QueryWrapper({
  children,
  queryClient,
}: {
  children: ReactNode;
  queryClient: QueryClient;
}) {
  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}

/**
 * Render a page inside a real TanStack Router at `path`.
 *
 * Pages use `<Link>`, `useNavigate` and `useParams`, all of which need a live
 * router context. A memory-history router with a single catch-all route gives
 * them one without pulling in the app's full route tree, so a page test stays
 * focused on that page's behavior.
 */
export function renderWithRouter(
  ui: ReactElement,
  path = "/",
  queryClient: QueryClient = createTestQueryClient(),
): RenderResult & { queryClient: QueryClient } {
  const rootRoute = createRootRoute({ component: () => ui });
  const catchAllRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: "$",
  });
  const router = createRouter({
    routeTree: rootRoute.addChildren([catchAllRoute]),
    history: createMemoryHistory({ initialEntries: [path] }),
  });

  const result = render(
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>,
  );
  return { ...result, queryClient };
}
