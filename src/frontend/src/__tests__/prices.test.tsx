import { Product, Role } from "@/backend";
import { PricesPage } from "@/pages/PricesPage";
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

const PRICES = [
  { product: Product.banana, pricePerKg: 100n, updatedAt: 1n },
  { product: Product.pear, pricePerKg: 250n, updatedAt: 1n },
];

describe("PricesPage", () => {
  beforeEach(() => {
    actorRef.current = createActorMock();
    actorRef.current.listPrices.mockResolvedValue(PRICES);
  });

  it("lists the current price per kg for each product", async () => {
    renderWithRouter(<PricesPage />, "/prices");

    expect(await screen.findByText("කෙසෙල්")).toBeInTheDocument();
    expect(screen.getByText("පේර")).toBeInTheDocument();
    expect(screen.getByText("රු. 100")).toBeInTheDocument();
    expect(screen.getByText("රු. 250")).toBeInTheDocument();
  });

  it("saves an edited price through setPrice", async () => {
    const user = userEvent.setup();
    actorRef.current.setPrice.mockResolvedValue({ __kind__: "ok", ok: null });

    renderWithRouter(<PricesPage />, "/prices");

    const rows = await screen.findAllByTestId("prices.item");
    const bananaRow = rows.find((row) => within(row).queryByText("කෙසෙල්"));
    expect(bananaRow).toBeDefined();

    await user.click(
      within(bananaRow as HTMLElement).getByTestId("prices.edit_button"),
    );
    const input = within(bananaRow as HTMLElement).getByTestId("prices.input");
    await user.clear(input);
    await user.type(input, "175");
    await user.click(
      within(bananaRow as HTMLElement).getByTestId("prices.save_button"),
    );

    await waitFor(() => {
      expect(actorRef.current.setPrice).toHaveBeenCalledWith(
        Product.banana,
        175n,
      );
    });
  });

  it("explains that saving a new price does not change saved harvest records", async () => {
    renderWithRouter(<PricesPage />, "/prices");

    expect(await screen.findByTestId("prices.notice")).toHaveTextContent(
      "දැනට සටහන් කර ඇති අස්වැන්න වාර්තාවල මිල නොවෙනස්ව පවතී",
    );
  });
});
