import { Role } from "@/backend";
import { FARMER_ERROR_MESSAGES } from "@/lib/sinhala";
import { FarmersPage } from "@/pages/FarmersPage";
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

const sessionRef = vi.hoisted(() => ({
  current: { isAdmin: true },
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
    isAdmin: sessionRef.current.isAdmin,
    loginError: null,
    isLoggingIn: false,
    login: vi.fn(),
    logout: vi.fn(),
  }),
}));

const FARMER = {
  id: 1n,
  code: "G-001",
  name: "සුනිල් පෙරේරා",
  phone: "0771234567",
  village: "කුරුණෑගල",
  address: "පාරේ 12",
  notes: "",
};

describe("FarmersPage", () => {
  beforeEach(() => {
    actorRef.current = createActorMock();
    sessionRef.current = { isAdmin: true };
  });

  it("lists farmers with their code, name and village", async () => {
    actorRef.current.listFarmers.mockResolvedValue([FARMER]);

    renderWithRouter(<FarmersPage />, "/farmers");

    expect(await screen.findByText("සුනිල් පෙරේරා")).toBeInTheDocument();
    expect(screen.getByText("G-001")).toBeInTheDocument();
    expect(screen.getByText("කුරුණෑගල")).toBeInTheDocument();
  });

  it("adds a farmer with a unique code and closes the dialog", async () => {
    const user = userEvent.setup();
    actorRef.current.listFarmers.mockResolvedValue([]);
    actorRef.current.addFarmer.mockResolvedValue({ __kind__: "ok", ok: null });

    renderWithRouter(<FarmersPage />, "/farmers");

    await user.click(await screen.findByTestId("farmers.add_button"));
    const dialog = await screen.findByTestId("farmers.add_dialog");

    await user.type(within(dialog).getByTestId("farmer.code_input"), "G-002");
    await user.type(within(dialog).getByTestId("farmer.name_input"), "නිමල් සිල්වා");
    await user.click(within(dialog).getByTestId("farmer.submit_button"));

    await waitFor(() => {
      expect(actorRef.current.addFarmer).toHaveBeenCalledWith(
        "G-002",
        "නිමල් සිල්වා",
        "",
        "",
        "",
        "",
      );
    });
    await waitFor(() => {
      expect(
        screen.queryByTestId("farmers.add_dialog"),
      ).not.toBeInTheDocument();
    });
  });

  it("rejects a duplicate farmer code with the Sinhala message", async () => {
    const user = userEvent.setup();
    actorRef.current.listFarmers.mockResolvedValue([FARMER]);
    actorRef.current.addFarmer.mockResolvedValue({
      __kind__: "err",
      err: { __kind__: "duplicateCode" },
    });

    renderWithRouter(<FarmersPage />, "/farmers");

    await user.click(await screen.findByTestId("farmers.add_button"));
    const dialog = await screen.findByTestId("farmers.add_dialog");

    await user.type(within(dialog).getByTestId("farmer.code_input"), "G-001");
    await user.type(
      within(dialog).getByTestId("farmer.name_input"),
      "වෙනත් නමක්",
    );
    await user.click(within(dialog).getByTestId("farmer.submit_button"));

    expect(await screen.findByTestId("farmer.error_state")).toHaveTextContent(
      FARMER_ERROR_MESSAGES.duplicateCode,
    );
    // The dialog stays open so the admin can correct the code.
    expect(screen.getByTestId("farmers.add_dialog")).toBeInTheDocument();
  });

  it("searches farmers by term and shows the result count", async () => {
    const user = userEvent.setup();
    actorRef.current.listFarmers.mockResolvedValue([FARMER]);
    actorRef.current.searchFarmers.mockResolvedValue([FARMER]);

    renderWithRouter(<FarmersPage />, "/farmers");

    await user.type(await screen.findByTestId("farmers.search_input"), "සුනිල්");

    await waitFor(() => {
      expect(actorRef.current.searchFarmers).toHaveBeenCalledWith("සුනිල්");
    });
    expect(
      await screen.findByTestId("farmers.search_result_count"),
    ).toBeInTheDocument();
  });

  it("hides the add-farmer action from an officer", async () => {
    sessionRef.current = { isAdmin: false };
    actorRef.current.listFarmers.mockResolvedValue([FARMER]);

    renderWithRouter(<FarmersPage />, "/farmers");

    await screen.findByText("සුනිල් පෙරේරා");
    expect(screen.queryByTestId("farmers.add_button")).not.toBeInTheDocument();
  });
});
