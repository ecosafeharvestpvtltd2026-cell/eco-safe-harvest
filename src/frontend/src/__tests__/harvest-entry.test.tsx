import { Product, Role } from "@/backend";
import { HarvestEntryPage } from "@/pages/HarvestEntryPage";
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
      id: 2n,
      username: "officer1",
      displayName: "නිලධාරී",
      role: Role.officer,
    },
    isLoading: false,
    isAdmin: false,
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
};

const PRICES = [{ product: Product.banana, pricePerKg: 100n, updatedAt: 1n }];

/** Open a Radix select by its trigger test id and pick an option by label. */
async function selectOption(
  user: ReturnType<typeof userEvent.setup>,
  triggerTestId: string,
  optionLabel: string,
) {
  await user.click(await screen.findByTestId(triggerTestId));
  const option = await screen.findByRole("option", { name: optionLabel });
  await user.click(option);
}

describe("HarvestEntryPage", () => {
  beforeEach(() => {
    actorRef.current = createActorMock();
    actorRef.current.listFarmers.mockResolvedValue([FARMER]);
    actorRef.current.listPrices.mockResolvedValue(PRICES);
  });

  it("auto-fills the farmer name and current price, and shows the live total before saving", async () => {
    const user = userEvent.setup();
    renderWithRouter(<HarvestEntryPage />, "/harvest/new");

    await selectOption(user, "harvest.farmer_select", "G-007 — කමල් ජයසිංහ");

    // Farmer name is auto-filled from the selected code.
    expect(screen.getByTestId("harvest.farmer_name_input")).toHaveValue(
      "කමල් ජයසිංහ",
    );

    // Choosing the product auto-fills the current price.
    await selectOption(user, "harvest.product_select", "කෙසෙල්");
    expect(screen.getByTestId("harvest.price_input")).toHaveValue(100);

    // 10 kg x 100/kg = රු. 1,000, shown before the record is saved.
    await user.type(screen.getByTestId("harvest.kg_input"), "10");
    expect(screen.getByTestId("harvest.total_value")).toHaveTextContent(
      "රු. 1,000",
    );
    expect(actorRef.current.addHarvest).not.toHaveBeenCalled();
  });

  it("submits the harvest with the frozen price per kg", async () => {
    const user = userEvent.setup();
    actorRef.current.addHarvest.mockResolvedValue({ __kind__: "ok", ok: null });

    renderWithRouter(<HarvestEntryPage />, "/harvest/new");

    await selectOption(user, "harvest.farmer_select", "G-007 — කමල් ජයසිංහ");
    await selectOption(user, "harvest.product_select", "කෙසෙල්");
    await user.type(screen.getByTestId("harvest.kg_input"), "10");
    await user.click(screen.getByTestId("harvest.submit_button"));

    await waitFor(() => {
      expect(actorRef.current.addHarvest).toHaveBeenCalledTimes(1);
    });
    const input = actorRef.current.addHarvest.mock.calls[0][0];
    expect(input.farmerId).toBe(7n);
    expect(input.product).toBe(Product.banana);
    expect(input.kg).toBe(10n);
    expect(input.pricePerKg).toBe(100n);
  });

  it("keeps submit disabled until the required fields are valid", async () => {
    const user = userEvent.setup();
    renderWithRouter(<HarvestEntryPage />, "/harvest/new");

    const submit = await screen.findByTestId("harvest.submit_button");
    expect(submit).toBeDisabled();

    await selectOption(user, "harvest.farmer_select", "G-007 — කමල් ජයසිංහ");
    await selectOption(user, "harvest.product_select", "කෙසෙල්");
    expect(submit).toBeDisabled();

    await user.type(screen.getByTestId("harvest.kg_input"), "10");
    expect(submit).toBeEnabled();
  });

  it("shows the Sinhala empty state when no farmers are registered", async () => {
    actorRef.current.listFarmers.mockResolvedValue([]);

    renderWithRouter(<HarvestEntryPage />, "/harvest/new");

    expect(await screen.findByText("ගොවීන් නොමැත")).toBeInTheDocument();
    expect(
      screen.getByTestId("harvest_entry.add_farmer_button"),
    ).toBeInTheDocument();
  });
});
