import { Product, Role } from "@/backend";
import { HarvestPage } from "@/pages/HarvestPage";
import { screen, within } from "@testing-library/react";
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

const FARMER = {
  id: 7n,
  code: "G-007",
  name: "කමල් ජයසිංහ",
  phone: "",
  village: "",
  address: "",
  notes: "",
  createdAt: 1n,
};

/** A harvest saved when banana was 100/kg: 10 kg x 100 = 1,000. */
const SAVED_HARVEST = {
  id: 3n,
  kg: 10n,
  officerId: 2n,
  total: 1000n,
  farmerId: 7n,
  date: "2026-09-25",
  createdAt: 1n,
  officerName: "නිලධාරී 1",
  pricePerKg: 100n,
  farmerCode: "G-007",
  farmerName: "කමල් ජයසිංහ",
  product: Product.banana,
};

describe("frozen harvest price", () => {
  beforeEach(() => {
    actorRef.current = createActorMock();
    actorRef.current.listFarmers.mockResolvedValue([FARMER]);
    actorRef.current.listHarvests.mockResolvedValue([SAVED_HARVEST]);
    // The current price list has since moved to 175/kg.
    actorRef.current.listPrices.mockResolvedValue([
      { product: Product.banana, pricePerKg: 175n, updatedAt: 2n },
    ]);
  });

  it("keeps a saved harvest's frozen price and total after the price list changes", async () => {
    renderWithRouter(<HarvestPage />, "/harvest");

    const item = await screen.findByTestId("harvest.item.1");
    // The record still shows the price frozen at entry time, not the new 175.
    expect(within(item).getByText(/රු\. 100\/kg/)).toBeInTheDocument();
    expect(within(item).getByText("රු. 1,000")).toBeInTheDocument();
    expect(within(item).queryByText(/රු\. 175/)).not.toBeInTheDocument();
  });

  it("pre-fills the edit form with the frozen price, not the current price", async () => {
    const user = userEvent.setup();
    renderWithRouter(<HarvestPage />, "/harvest");

    const item = await screen.findByTestId("harvest.item.1");
    await user.click(within(item).getByTestId("harvest.edit_button.1"));

    const dialog = await screen.findByTestId("harvest.edit_dialog");
    expect(within(dialog).getByTestId("harvest.price_input")).toHaveValue(100);
    expect(within(dialog).getByTestId("harvest.total_value")).toHaveTextContent(
      "රු. 1,000",
    );
  });
});
