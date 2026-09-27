import { Role } from "@/backend";
import { screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  type ActorMock,
  QueryWrapper,
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

/**
 * Render the real application router at the current `window.location`.
 *
 * The admin-only routes (`/officers`, `/prices`) run `requireAdmin` in
 * `beforeLoad`, which resolves the session from the backend directly. Rendering
 * the real `App` exercises that guard end to end rather than asserting the
 * navigation links it protects. Callers set the target path with
 * `window.history.pushState` before rendering.
 */
async function renderApp() {
  const { default: App } = await import("@/App");
  const queryClient = createTestQueryClient();
  const { render } = await import("@testing-library/react");
  return render(
    <QueryWrapper queryClient={queryClient}>
      <App />
    </QueryWrapper>,
  );
}

describe("admin-only route guard", () => {
  beforeEach(() => {
    actorRef.current = createActorMock();
    window.history.pushState({}, "", "/");
  });

  it("redirects an officer away from the admin-only officers route", async () => {
    actorRef.current.getSession.mockResolvedValue(OFFICER_SESSION);
    window.history.pushState({}, "", "/officers");

    await renderApp();

    // The officer lands on the dashboard, not the officer-management page.
    expect(await screen.findByText("අද මුළු අස්වැන්න")).toBeInTheDocument();
    expect(screen.queryByText("නිලධාරී ලැයිස්තුව")).not.toBeInTheDocument();
  });

  it("redirects an officer away from the admin-only prices route", async () => {
    actorRef.current.getSession.mockResolvedValue(OFFICER_SESSION);
    window.history.pushState({}, "", "/prices");

    await renderApp();

    expect(await screen.findByText("අද මුළු අස්වැන්න")).toBeInTheDocument();
  });

  it("lets an admin reach the officers route", async () => {
    actorRef.current.getSession.mockResolvedValue(ADMIN_SESSION);
    actorRef.current.listOfficers.mockResolvedValue([]);
    window.history.pushState({}, "", "/officers");

    await renderApp();

    expect(await screen.findByText("නිලධාරී ලැයිස්තුව")).toBeInTheDocument();
  });

  it("sends an unauthenticated visitor to the sign-in screen", async () => {
    actorRef.current.getSession.mockResolvedValue(null);
    window.history.pushState({}, "", "/officers");

    await renderApp();

    expect(
      await screen.findByRole("heading", { name: "ඉකෝ සේෆ් අස්වැන්න" }),
    ).toBeInTheDocument();
    await waitFor(() => {
      expect(actorRef.current.getSession).toHaveBeenCalled();
    });
  });

  it("signs an officer in through the officer role and shows officer navigation", async () => {
    const user = (await import("@testing-library/user-event")).default.setup();
    // The backend session is empty until login succeeds, then reflects it —
    // the same contract the real canister has, and what the post-login
    // `invalidateQueries` refetch reads back.
    let signedIn = false;
    actorRef.current.getSession.mockImplementation(async () =>
      signedIn ? OFFICER_SESSION : null,
    );
    actorRef.current.login.mockImplementation(async () => {
      signedIn = true;
      return { __kind__: "ok", ok: OFFICER_SESSION };
    });
    window.history.pushState({}, "", "/dashboard");

    await renderApp();

    await user.type(await screen.findByLabelText("පරිශීලක නාමය"), "officer1");
    await user.type(screen.getByLabelText("මුරපදය"), "officer123");
    await user.click(screen.getByRole("button", { name: /නිලධාරී/ }));
    await user.click(screen.getByRole("button", { name: /පිවිසෙන්න/ }));

    await waitFor(() => {
      expect(actorRef.current.login).toHaveBeenCalledWith(
        "officer1",
        "officer123",
        Role.officer,
      );
    });

    // The officer reaches the dashboard and sees no admin-only tabs.
    expect(await screen.findByText("අද මුළු අස්වැන්න")).toBeInTheDocument();
    expect(screen.queryByTestId("nav.officers.link")).not.toBeInTheDocument();
    expect(screen.queryByTestId("nav.prices.link")).not.toBeInTheDocument();
  });

  it("never shows the credentials panel or officer passwords to a signed-in officer", async () => {
    actorRef.current.getSession.mockResolvedValue(OFFICER_SESSION);
    window.history.pushState({}, "", "/dashboard");

    await renderApp();

    // The signed-in shell renders the dashboard, not the pre-login panel.
    expect(await screen.findByText("අද මුළු අස්වැන්න")).toBeInTheDocument();
    expect(
      screen.queryByTestId("login.credentials_panel"),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByTestId("login.credentials_list"),
    ).not.toBeInTheDocument();
    // The seeded officer password is nowhere in the signed-in shell.
    expect(screen.queryByText("officer123")).not.toBeInTheDocument();
  });
});
