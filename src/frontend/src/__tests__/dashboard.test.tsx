import { Role } from "@/backend";
import { DashboardPage } from "@/pages/DashboardPage";
import { screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  type ActorMock,
  createActorMock,
  renderWithRouter,
} from "./test-utils";

const actorRef = vi.hoisted(() => ({
  current: null as unknown as ActorMock,
}));

const sessionRef = vi.hoisted(() => ({
  current: {
    session: null as null | {
      id: bigint;
      username: string;
      displayName: string;
      role: Role;
    },
    isAdmin: false,
  },
}));

vi.mock("@caffeineai/core-infrastructure", () => ({
  useActor: () => ({ actor: actorRef.current, isFetching: false }),
  createActorWithConfig: async () => actorRef.current,
}));

vi.mock("@/backend", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/backend")>();
  return { ...actual, createActor: () => actorRef.current };
});

vi.mock("@/hooks/useSession", () => ({
  useSession: () => ({
    session: sessionRef.current.session,
    isLoading: false,
    isAdmin: sessionRef.current.isAdmin,
    loginError: null,
    isLoggingIn: false,
    login: vi.fn(),
    logout: vi.fn(),
  }),
}));

describe("DashboardPage", () => {
  beforeEach(() => {
    actorRef.current = createActorMock();
    sessionRef.current = {
      session: {
        id: 1n,
        username: "admin",
        displayName: "පරිපාලක",
        role: Role.admin,
      },
      isAdmin: true,
    };
  });

  it("shows today's harvest kg, farmer count and total value", async () => {
    actorRef.current.getDashboard.mockResolvedValue({
      stats: {
        totalValue: 125000n,
        date: "2026-09-25",
        totalKg: 250n,
        farmerCount: 12n,
        recordCount: 8n,
      },
      recent: [],
    });

    renderWithRouter(<DashboardPage />, "/dashboard");

    expect(await screen.findByText("අද මුළු අස්වැන්න")).toBeInTheDocument();
    expect(screen.getByText("අද ගොවීන් ගණන")).toBeInTheDocument();
    expect(screen.getByText("අද මුළු වටිනාකම")).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText("250")).toBeInTheDocument();
      expect(screen.getByText("12")).toBeInTheDocument();
      expect(screen.getByText("රු. 125,000")).toBeInTheDocument();
    });
  });

  it("renders four large quick-action buttons for an admin", async () => {
    renderWithRouter(<DashboardPage />, "/dashboard");

    const actions = await screen.findByTestId("dashboard.quick_actions");
    expect(actions).toBeInTheDocument();
    expect(
      screen.getByTestId("dashboard.quick_action.farmers"),
    ).toBeInTheDocument();
    expect(
      screen.getByTestId("dashboard.quick_action.harvest"),
    ).toBeInTheDocument();
    expect(
      screen.getByTestId("dashboard.quick_action.prices"),
    ).toBeInTheDocument();
    expect(
      screen.getByTestId("dashboard.quick_action.reports"),
    ).toBeInTheDocument();
  });

  it("hides the admin-only price action from an officer", async () => {
    sessionRef.current = {
      session: {
        id: 2n,
        username: "officer1",
        displayName: "නිලධාරී",
        role: Role.officer,
      },
      isAdmin: false,
    };

    renderWithRouter(<DashboardPage />, "/dashboard");

    await screen.findByTestId("dashboard.quick_actions");
    expect(
      screen.queryByTestId("dashboard.quick_action.prices"),
    ).not.toBeInTheDocument();
    expect(
      screen.getByTestId("dashboard.quick_action.farmers"),
    ).toBeInTheDocument();
  });

  it("lists recent harvests with farmer name and product", async () => {
    actorRef.current.listHarvests.mockResolvedValue([
      {
        id: 5n,
        kg: 10n,
        officerId: 1n,
        total: 1000n,
        farmerId: 1n,
        date: "2026-09-25",
        createdAt: 1n,
        officerName: "පරිපාලක",
        pricePerKg: 100n,
        farmerCode: "G-001",
        farmerName: "සුනිල්",
        product: "banana",
      },
    ]);

    renderWithRouter(<DashboardPage />, "/dashboard");

    expect(await screen.findByText("සුනිල්")).toBeInTheDocument();
    expect(screen.getByText(/කෙසෙල්/)).toBeInTheDocument();
  });
});
