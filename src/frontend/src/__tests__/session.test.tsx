import { Role } from "@/backend";
import { SessionProvider } from "@/context/SessionContext";
import { useSession } from "@/hooks/useSession";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  type ActorMock,
  createActorMock,
  renderWithQueryClient,
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

/** A minimal consumer that exposes the session context as observable text. */
function SessionProbe() {
  const { session, isAdmin, login, logout } = useSession();
  return (
    <div>
      <p data-ocid="session-name">{session?.displayName ?? "නොපිවිසුනි"}</p>
      <p data-ocid="session-admin">{isAdmin ? "admin" : "not-admin"}</p>
      <button
        type="button"
        data-ocid="probe-login"
        onClick={() => login("admin", "secret", Role.admin)}
      >
        login
      </button>
      <button type="button" data-ocid="probe-logout" onClick={logout}>
        logout
      </button>
    </div>
  );
}

function renderProbe() {
  return renderWithQueryClient(
    <SessionProvider>
      <SessionProbe />
    </SessionProvider>,
  );
}

describe("session lifecycle", () => {
  beforeEach(() => {
    actorRef.current = createActorMock();
  });

  it("persists a successful login and exposes the admin role", async () => {
    const user = userEvent.setup();
    // The backend session is empty until login succeeds, then reflects it —
    // the same contract the real canister has, and what the post-login
    // `invalidateQueries` refetch reads back.
    let signedIn = false;
    actorRef.current.getSession.mockImplementation(async () =>
      signedIn ? ADMIN_SESSION : null,
    );
    actorRef.current.login.mockImplementation(async () => {
      signedIn = true;
      return { __kind__: "ok", ok: ADMIN_SESSION };
    });

    renderProbe();

    await waitFor(() => {
      expect(screen.getByTestId("session-name")).toHaveTextContent("නොපිවිසුනි");
    });

    await user.click(screen.getByTestId("probe-login"));

    await waitFor(() => {
      expect(screen.getByTestId("session-name")).toHaveTextContent("පරිපාලක");
    });
    expect(screen.getByTestId("session-admin")).toHaveTextContent("admin");
    expect(actorRef.current.login).toHaveBeenCalledWith(
      "admin",
      "secret",
      Role.admin,
    );
  });

  it("clears the session on logout and calls the backend", async () => {
    const user = userEvent.setup();
    let signedIn = true;
    actorRef.current.getSession.mockImplementation(async () =>
      signedIn ? ADMIN_SESSION : null,
    );
    actorRef.current.logout.mockImplementation(async () => {
      signedIn = false;
    });

    renderProbe();

    await waitFor(() => {
      expect(screen.getByTestId("session-name")).toHaveTextContent("පරිපාලක");
    });

    await user.click(screen.getByTestId("probe-logout"));

    await waitFor(() => {
      expect(actorRef.current.logout).toHaveBeenCalledTimes(1);
    });
    await waitFor(() => {
      expect(screen.getByTestId("session-name")).toHaveTextContent("නොපිවිසුනි");
    });
    expect(screen.getByTestId("session-admin")).toHaveTextContent("not-admin");
  });
});
