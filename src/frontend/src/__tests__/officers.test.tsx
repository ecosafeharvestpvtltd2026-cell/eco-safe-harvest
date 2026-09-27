import { Role } from "@/backend";
import { OfficersPage } from "@/pages/OfficersPage";
import { screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  type ActorMock,
  createActorMock,
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

vi.mock("@/hooks/useSession", () => ({
  useSession: () => ({
    session: {
      id: 1n,
      username: "admin",
      displayName: "පරිපාලක",
      role: Role.admin,
    },
    isLoading: false,
    isAdmin: true,
    loginError: null,
    isLoggingIn: false,
    login: vi.fn(),
    logout: vi.fn(),
  }),
}));

/** The six seeded officer accounts the app ships with. */
const SEEDED_OFFICERS = Array.from({ length: 6 }, (_, index) => ({
  id: BigInt(index + 2),
  username: `officer${index + 1}`,
  displayName: `නිලධාරී ${index + 1}`,
  role: Role.officer,
}));

describe("OfficersPage", () => {
  beforeEach(() => {
    actorRef.current = createActorMock();
    actorRef.current.listOfficers.mockResolvedValue(SEEDED_OFFICERS);
    actorRef.current.listHarvests.mockResolvedValue([]);
  });

  it("lists all six seeded officer accounts", async () => {
    renderWithRouter(<OfficersPage />, "/officers");

    expect(await screen.findByText("නිලධාරී 1")).toBeInTheDocument();
    for (let index = 1; index <= 6; index += 1) {
      expect(screen.getByText(`නිලධාරී ${index}`)).toBeInTheDocument();
    }
  });

  it("creates a new officer through the backend", async () => {
    const user = userEvent.setup();
    actorRef.current.createOfficer.mockResolvedValue({
      __kind__: "ok",
      ok: null,
    });

    renderWithRouter(<OfficersPage />, "/officers");

    const form = await screen.findByTestId("officers.form");
    await user.type(
      within(form).getByTestId("officers.display_name_input"),
      "නව නිලධාරී",
    );
    await user.type(
      within(form).getByTestId("officers.username_input"),
      "officer7",
    );
    await user.type(
      within(form).getByTestId("officers.password_input"),
      "pass1234",
    );
    await user.click(within(form).getByTestId("officers.submit_button"));

    await waitFor(() => {
      expect(actorRef.current.createOfficer).toHaveBeenCalledWith(
        "officer7",
        "pass1234",
        "නව නිලධාරී",
      );
    });
  });

  it("shows each officer's harvest record count", async () => {
    actorRef.current.listHarvests.mockResolvedValue([
      {
        id: 1n,
        kg: 10n,
        officerId: 2n,
        total: 1000n,
        farmerId: 1n,
        date: "2026-09-25",
        createdAt: 1n,
        officerName: "නිලධාරී 1",
        pricePerKg: 100n,
        farmerCode: "G-001",
        farmerName: "සුනිල්",
        product: "banana",
      },
    ]);

    renderWithRouter(<OfficersPage />, "/officers");

    expect(await screen.findByText("නිලධාරී 1")).toBeInTheDocument();
    // The record count badge for officer id 2 is rendered as "වාර්තා 1".
    expect(screen.getByText("වාර්තා 1")).toBeInTheDocument();
  });

  it("renames an officer through updateOfficer", async () => {
    const user = userEvent.setup();
    actorRef.current.updateOfficer.mockResolvedValue({
      __kind__: "ok",
      ok: null,
    });

    renderWithRouter(<OfficersPage />, "/officers");

    const list = await screen.findByTestId("officers.list");
    const firstRow = within(list).getAllByTestId("officers.item")[0];
    await user.click(within(firstRow).getByTestId("officers.edit_button"));

    const input = within(firstRow).getByTestId("officers.edit_input");
    await user.clear(input);
    await user.type(input, "නව නම");
    await user.click(within(firstRow).getByTestId("officers.save_button"));

    await waitFor(() => {
      expect(actorRef.current.updateOfficer).toHaveBeenCalledWith(2n, "නව නම");
    });
  });

  it("resets an officer password through resetOfficerPassword", async () => {
    const user = userEvent.setup();
    actorRef.current.resetOfficerPassword.mockResolvedValue({
      __kind__: "ok",
      ok: null,
    });

    renderWithRouter(<OfficersPage />, "/officers");

    const list = await screen.findByTestId("officers.list");
    const firstRow = within(list).getAllByTestId("officers.item")[0];
    await user.click(
      within(firstRow).getByTestId("officers.reset_password_button"),
    );

    const input = within(firstRow).getByTestId("officers.edit_input");
    await user.type(input, "newpass1");
    await user.click(within(firstRow).getByTestId("officers.save_button"));

    await waitFor(() => {
      expect(actorRef.current.resetOfficerPassword).toHaveBeenCalledWith(
        2n,
        "newpass1",
      );
    });
  });

  it("keeps the rename save disabled until a non-empty name is entered", async () => {
    const user = userEvent.setup();

    renderWithRouter(<OfficersPage />, "/officers");

    const list = await screen.findByTestId("officers.list");
    const firstRow = within(list).getAllByTestId("officers.item")[0];
    await user.click(within(firstRow).getByTestId("officers.edit_button"));

    const input = within(firstRow).getByTestId("officers.edit_input");
    const save = within(firstRow).getByTestId("officers.save_button");
    // The rename draft starts at the current display name, so save is enabled.
    expect(save).toBeEnabled();

    await user.clear(input);
    expect(save).toBeDisabled();
  });

  it("cancels an in-progress rename without calling the backend", async () => {
    const user = userEvent.setup();

    renderWithRouter(<OfficersPage />, "/officers");

    const list = await screen.findByTestId("officers.list");
    const firstRow = within(list).getAllByTestId("officers.item")[0];
    await user.click(within(firstRow).getByTestId("officers.edit_button"));
    await user.click(within(firstRow).getByTestId("officers.cancel_button"));

    expect(
      within(firstRow).getByTestId("officers.edit_button"),
    ).toBeInTheDocument();
    expect(actorRef.current.updateOfficer).not.toHaveBeenCalled();
  });
});
