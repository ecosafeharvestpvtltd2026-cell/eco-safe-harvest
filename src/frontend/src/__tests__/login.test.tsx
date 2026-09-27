import { Role } from "@/backend";
import { SessionProvider } from "@/context/SessionContext";
import { AUTH_ERROR_MESSAGES } from "@/lib/sinhala";
import { LoginPage } from "@/pages/LoginPage";
import type { CredentialRow } from "@/types";
import { screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  type ActorMock,
  createActorMock,
  renderWithQueryClient,
} from "./test-utils";

/** The seeded credentials the migration writes and the panel displays. */
const SEEDED_CREDENTIALS: CredentialRow[] = [
  {
    username: "admin",
    password: "admin123",
    displayName: "පරිපාලක",
    role: Role.admin,
  },
  ...Array.from({ length: 6 }, (_, index) => ({
    username: `officer${index + 1}`,
    password: "officer123",
    displayName: `නිලධාරී ${index + 1}`,
    role: Role.officer,
  })),
];

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

function renderLogin() {
  return renderWithQueryClient(
    <SessionProvider>
      <LoginPage />
    </SessionProvider>,
  );
}

describe("LoginPage", () => {
  beforeEach(() => {
    actorRef.current = createActorMock();
  });

  it("renders the Sinhala sign-in screen with username, password and role selector", async () => {
    renderLogin();

    expect(
      await screen.findByRole("heading", { name: "ඉකෝ සේෆ් අස්වැන්න" }),
    ).toBeInTheDocument();
    expect(screen.getByLabelText("පරිශීලක නාමය")).toBeInTheDocument();
    expect(screen.getByLabelText("මුරපදය")).toBeInTheDocument();
    expect(screen.getByText("භූමිකාව")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /පරිපාලක/ })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /නිලධාරී/ })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /පිවිසෙන්න/ })).toBeInTheDocument();
  });

  it("keeps submit disabled until both credentials are present", async () => {
    const user = userEvent.setup();
    renderLogin();

    const submit = await screen.findByRole("button", { name: /පිවිසෙන්න/ });
    expect(submit).toBeDisabled();

    await user.type(screen.getByLabelText("පරිශීලක නාමය"), "admin");
    expect(submit).toBeDisabled();

    await user.type(screen.getByLabelText("මුරපදය"), "secret");
    expect(submit).toBeEnabled();
  });

  it("signs in with the selected role and calls the backend login", async () => {
    const user = userEvent.setup();
    actorRef.current.login.mockResolvedValue({
      __kind__: "ok",
      ok: {
        id: 1n,
        username: "admin",
        displayName: "පරිපාලක",
        role: Role.admin,
      },
    });
    renderLogin();

    await user.type(await screen.findByLabelText("පරිශීලක නාමය"), "admin");
    await user.type(screen.getByLabelText("මුරපදය"), "secret");
    await user.click(screen.getByRole("button", { name: /පරිපාලක/ }));
    await user.click(screen.getByRole("button", { name: /පිවිසෙන්න/ }));

    await waitFor(() => {
      expect(actorRef.current.login).toHaveBeenCalledWith(
        "admin",
        "secret",
        Role.admin,
      );
    });
  });

  it("shows the Sinhala message when credentials are rejected", async () => {
    const user = userEvent.setup();
    actorRef.current.login.mockResolvedValue({
      __kind__: "err",
      err: "invalidCredentials",
    });
    renderLogin();

    await user.type(await screen.findByLabelText("පරිශීලක නාමය"), "admin");
    await user.type(screen.getByLabelText("මුරපදය"), "wrong");
    await user.click(screen.getByRole("button", { name: /පිවිසෙන්න/ }));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      AUTH_ERROR_MESSAGES.invalidCredentials,
    );
  });

  it("defaults the role selector to officer and switches to admin on click", async () => {
    const user = userEvent.setup();
    renderLogin();

    const officer = await screen.findByRole("button", { name: /නිලධාරී/ });
    const admin = screen.getByRole("button", { name: /පරිපාලක/ });
    expect(officer).toHaveAttribute("aria-pressed", "true");
    expect(admin).toHaveAttribute("aria-pressed", "false");

    await user.click(admin);
    expect(admin).toHaveAttribute("aria-pressed", "true");
    expect(officer).toHaveAttribute("aria-pressed", "false");
  });

  it("toggles password visibility without changing the typed value", async () => {
    const user = userEvent.setup();
    renderLogin();

    const password = await screen.findByLabelText("මුරපදය");
    expect(password).toHaveAttribute("type", "password");

    await user.type(password, "secret");
    await user.click(screen.getByRole("button", { name: "මුරපදය පෙන්වන්න" }));

    expect(password).toHaveAttribute("type", "text");
    expect(password).toHaveValue("secret");

    await user.click(screen.getByRole("button", { name: "මුරපදය සඟවන්න" }));
    expect(password).toHaveAttribute("type", "password");
  });

  it("signs in with the Admin credentials shown in the panel and the Admin role", async () => {
    const user = userEvent.setup();
    actorRef.current.getSeededCredentials.mockResolvedValue(SEEDED_CREDENTIALS);
    actorRef.current.login.mockResolvedValue({
      __kind__: "ok",
      ok: {
        id: 0n,
        username: "admin",
        displayName: "පරිපාලක",
        role: Role.admin,
      },
    });
    renderLogin();

    // Read the Admin pair straight off the panel, then use it to sign in.
    const list = await screen.findByTestId("login.credentials_list");
    const adminRow = within(list).getByTestId("login.credential_item.0");
    expect(within(adminRow).getByText("admin")).toBeInTheDocument();
    expect(within(adminRow).getByText("admin123")).toBeInTheDocument();

    await user.type(screen.getByLabelText("පරිශීලක නාමය"), "admin");
    await user.type(screen.getByLabelText("මුරපදය"), "admin123");
    await user.click(screen.getByTestId("login.role_admin_button"));
    await user.click(screen.getByRole("button", { name: /පිවිසෙන්න/ }));

    await waitFor(() => {
      expect(actorRef.current.login).toHaveBeenCalledWith(
        "admin",
        "admin123",
        Role.admin,
      );
    });
  });
});
