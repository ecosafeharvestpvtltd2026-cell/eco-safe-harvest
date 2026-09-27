import { Role } from "@/backend";
import { BottomNav } from "@/components/layout/BottomNav";
import { SessionProvider } from "@/context/SessionContext";
import { screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  type ActorMock,
  createActorMock,
  renderWithQueryClient,
  renderWithRouter,
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

const ADMIN_SESSION = {
  id: 1n,
  username: "admin",
  displayName: "පරිපාලක",
  role: Role.admin,
};

const OFFICER_SESSION = {
  id: 2n,
  username: "officer1",
  displayName: "නිලධාරී 1",
  role: Role.officer,
};

/** Render the bottom navigation inside a real SessionProvider. */
function renderNav() {
  return renderWithRouter(
    <SessionProvider>
      <BottomNav />
    </SessionProvider>,
    "/dashboard",
  );
}

describe("role-based navigation", () => {
  beforeEach(() => {
    actorRef.current = createActorMock();
  });

  it("shows the admin-only මිල ලැයිස්තුව and නිලධාරීන් tabs to an admin", async () => {
    actorRef.current.getSession.mockResolvedValue(ADMIN_SESSION);

    renderNav();

    expect(await screen.findByTestId("nav.prices.link")).toBeInTheDocument();
    expect(screen.getByTestId("nav.officers.link")).toBeInTheDocument();
    expect(screen.getByText("මිල ලැයිස්තුව")).toBeInTheDocument();
    expect(screen.getByText("නිලධාරීන්")).toBeInTheDocument();
  });

  it("hides the admin-only tabs from an officer", async () => {
    actorRef.current.getSession.mockResolvedValue(OFFICER_SESSION);

    renderNav();

    // The shared tabs render once the session resolves.
    expect(await screen.findByTestId("nav.dashboard.link")).toBeInTheDocument();
    expect(screen.getByTestId("nav.farmers.link")).toBeInTheDocument();
    expect(screen.getByTestId("nav.harvest.link")).toBeInTheDocument();
    expect(screen.getByTestId("nav.reports.link")).toBeInTheDocument();
    expect(screen.queryByTestId("nav.prices.link")).not.toBeInTheDocument();
    expect(screen.queryByTestId("nav.officers.link")).not.toBeInTheDocument();
  });

  it("restores a persisted session on load instead of showing the login screen", async () => {
    actorRef.current.getSession.mockResolvedValue(ADMIN_SESSION);

    renderWithQueryClient(
      <SessionProvider>
        <div data-ocid="signed-in">{ADMIN_SESSION.displayName}</div>
      </SessionProvider>,
    );

    await waitFor(() => {
      expect(actorRef.current.getSession).toHaveBeenCalled();
    });
    expect(await screen.findByTestId("signed-in")).toHaveTextContent("පරිපාලක");
  });
});
