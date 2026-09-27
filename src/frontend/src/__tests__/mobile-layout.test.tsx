import { Role } from "@/backend";
import { AppLayout } from "@/components/layout/AppLayout";
import { SessionProvider } from "@/context/SessionContext";
import { screen } from "@testing-library/react";
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

/**
 * jsdom has no layout engine, so this suite asserts the structural contract the
 * mobile design relies on — the tap-target and width classes the app applies —
 * rather than measured pixels. Real 390px rendering is not exercised here.
 */
describe("mobile layout contract", () => {
  beforeEach(() => {
    actorRef.current = createActorMock();
    actorRef.current.getSession.mockResolvedValue({
      id: 1n,
      username: "admin",
      displayName: "පරිපාලක",
      role: Role.admin,
    });
  });

  it("gives every bottom-nav tab a tap target of at least 44px", async () => {
    renderWithRouter(
      <SessionProvider>
        <AppLayout>
          <p>content</p>
        </AppLayout>
      </SessionProvider>,
      "/dashboard",
    );

    const nav = await screen.findByTestId("nav.bottom");
    const links = nav.querySelectorAll("a");
    expect(links.length).toBeGreaterThan(0);
    for (const link of links) {
      // min-h-[3.5rem] = 56px, comfortably above the 44px minimum.
      expect(link.className).toContain("min-h-[3.5rem]");
    }
  });

  it("constrains the app shell to a phone-friendly max width", async () => {
    renderWithRouter(
      <SessionProvider>
        <AppLayout>
          <p>content</p>
        </AppLayout>
      </SessionProvider>,
      "/dashboard",
    );

    const header = await screen.findByTestId("app.header");
    const inner = header.firstElementChild as HTMLElement;
    expect(inner.className).toContain("max-w-2xl");
    expect(inner.className).toContain("px-4");
  });
});
