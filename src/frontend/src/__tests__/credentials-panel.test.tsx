import { Role } from "@/backend";
import { CredentialsPanel } from "@/components/auth/CredentialsPanel";
import type { CredentialRow } from "@/types";
import { screen, waitFor, within } from "@testing-library/react";
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

/**
 * The seeded credentials the migration writes: one admin (id 0) and six
 * officers (ids 1-6). The panel is expected to render exactly these.
 */
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

function renderPanel() {
  return renderWithQueryClient(<CredentialsPanel />);
}

describe("CredentialsPanel", () => {
  beforeEach(() => {
    actorRef.current = createActorMock();
    actorRef.current.getSeededCredentials.mockResolvedValue(SEEDED_CREDENTIALS);
  });

  it("lists the admin and all six officer usernames with their passwords", async () => {
    renderPanel();

    const list = await screen.findByTestId("login.credentials_list");
    expect(within(list).getByText("admin")).toBeInTheDocument();
    expect(within(list).getByText("admin123")).toBeInTheDocument();

    for (let index = 1; index <= 6; index += 1) {
      expect(within(list).getByText(`officer${index}`)).toBeInTheDocument();
    }
    // Every officer shares the same temporary password, shown once per row.
    expect(within(list).getAllByText("officer123")).toHaveLength(6);
  });

  it("reads the credentials from the public backend query", async () => {
    renderPanel();

    await waitFor(() => {
      expect(actorRef.current.getSeededCredentials).toHaveBeenCalledTimes(1);
    });
  });

  it("copies a credential row to the clipboard and confirms inline", async () => {
    const user = userEvent.setup();
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: { writeText },
    });

    renderPanel();

    const copyButton = await screen.findByTestId("login.copy_button.0");
    await user.click(copyButton);

    expect(writeText).toHaveBeenCalledWith("admin / admin123");
    // The button swaps its label to the Sinhala confirmation text.
    await waitFor(() => {
      expect(copyButton).toHaveTextContent("පිටපත් විය");
    });
  });

  it("collapses and re-expands the panel without leaving the screen", async () => {
    const user = userEvent.setup();
    renderPanel();

    const toggle = await screen.findByTestId("login.credentials_toggle");
    expect(toggle).toHaveAttribute("aria-expanded", "true");
    expect(
      await screen.findByTestId("login.credentials_list"),
    ).toBeInTheDocument();

    await user.click(toggle);

    expect(toggle).toHaveAttribute("aria-expanded", "false");
    expect(
      screen.queryByTestId("login.credentials_list"),
    ).not.toBeInTheDocument();

    await user.click(toggle);

    expect(toggle).toHaveAttribute("aria-expanded", "true");
    expect(
      await screen.findByTestId("login.credentials_list"),
    ).toBeInTheDocument();
  });

  it("shows an empty state when the backend returns no seeded credentials", async () => {
    actorRef.current.getSeededCredentials.mockResolvedValue([]);

    renderPanel();

    expect(
      await screen.findByTestId("login.credentials_empty_state"),
    ).toBeInTheDocument();
  });
});
