import { Product, Role } from "@/backend";
import { SessionProvider } from "@/context/SessionContext";
import { FarmerDetailPage } from "@/pages/FarmerDetailPage";
import { QueryClientProvider } from "@tanstack/react-query";
import {
  RouterProvider,
  createMemoryHistory,
  createRootRoute,
  createRoute,
  createRouter,
} from "@tanstack/react-router";
import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  type ActorMock,
  createActorMock,
  createTestQueryClient,
} from "./test-utils";

const actorRef = vi.hoisted(() => ({
  current: null as unknown as ActorMock,
}));

vi.mock("@caffeineai/core-infrastructure", () => ({
  useActor: () => ({ actor: actorRef.current, isFetching: false }),
  createActorWithConfig: async () => actorRef.current,
}));

vi.mock("@/backend", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/backend")>();
  return { ...actual, createActor: () => actorRef.current };
});

const FARMER = {
  id: 7n,
  code: "G-007",
  name: "කමල් ජයසිංහ",
  phone: "0771234567",
  village: "කුරුණෑගල",
  address: "පාරේ 12",
  notes: "දිගු කාලීන ගොවියා",
  createdAt: 1n,
};

const HARVEST = {
  id: 3n,
  kg: 10n,
  officerId: 2n,
  total: 1000n,
  date: "2026-09-25",
  officerName: "නිලධාරී 1",
  pricePerKg: 100n,
  product: Product.banana,
};

/**
 * Render the farmer detail page inside a router that actually declares the
 * `/farmers/$farmerId` route, so `useParams({ from })` resolves the id.
 */
function renderFarmerDetail(farmerId: string) {
  const queryClient = createTestQueryClient();
  const rootRoute = createRootRoute({
    component: () => (
      <SessionProvider>
        <FarmerDetailPage />
      </SessionProvider>
    ),
  });
  const detailRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: "/farmers/$farmerId",
  });
  const router = createRouter({
    routeTree: rootRoute.addChildren([detailRoute]),
    history: createMemoryHistory({ initialEntries: [`/farmers/${farmerId}`] }),
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>,
  );
}

describe("FarmerDetailPage", () => {
  beforeEach(() => {
    actorRef.current = createActorMock();
    actorRef.current.getSession.mockResolvedValue({
      id: 1n,
      username: "admin",
      displayName: "පරිපාලක",
      role: Role.admin,
    });
  });

  it("shows the farmer's details and harvest history", async () => {
    actorRef.current.getFarmer.mockResolvedValue({
      farmer: FARMER,
      harvests: [HARVEST],
    });

    renderFarmerDetail("7");

    expect(await screen.findByText("කමල් ජයසිංහ")).toBeInTheDocument();
    expect(screen.getByText("ගොවි කේතය G-007")).toBeInTheDocument();
    expect(screen.getByText("0771234567")).toBeInTheDocument();
    expect(screen.getByText("කුරුණෑගල")).toBeInTheDocument();
    expect(screen.getByText("දිගු කාලීන ගොවියා")).toBeInTheDocument();

    // Harvest history row: 10 kg at 100/kg totals 1,000.
    expect(
      await screen.findByTestId("farmer.harvest_item.1"),
    ).toBeInTheDocument();
    expect(screen.getByText("රු. 1,000")).toBeInTheDocument();
    expect(actorRef.current.getFarmer).toHaveBeenCalledWith(7n);
  });

  it("shows the Sinhala empty state when the farmer has no harvests", async () => {
    actorRef.current.getFarmer.mockResolvedValue({
      farmer: FARMER,
      harvests: [],
    });

    renderFarmerDetail("7");

    expect(await screen.findByText("තවම අස්වැන්න වාර්තා නොමැත")).toBeInTheDocument();
    expect(screen.getByTestId("farmer.add_harvest_button")).toBeInTheDocument();
  });

  it("shows a Sinhala not-found state when the farmer does not exist", async () => {
    actorRef.current.getFarmer.mockResolvedValue(null);

    renderFarmerDetail("7");

    expect(await screen.findByText("ගොවියා හමු නොවීය")).toBeInTheDocument();
  });
});
