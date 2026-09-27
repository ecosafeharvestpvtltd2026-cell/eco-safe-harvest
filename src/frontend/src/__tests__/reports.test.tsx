import { ReportKind, Role } from "@/backend";
import { ReportsPage } from "@/pages/ReportsPage";
import { screen, waitFor } from "@testing-library/react";
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

const REPORT = {
  to: "2026-09-25",
  totalValue: 125000n,
  from: "2026-09-25",
  totalKg: 250n,
  kind: ReportKind.daily,
  rows: [
    {
      key: "2026-09-25",
      title: "2026 සැප්තැම්බර් 25",
      kg: 250n,
      value: 125000n,
      count: 8n,
    },
  ],
  recordCount: 8n,
};

describe("ReportsPage", () => {
  beforeEach(() => {
    actorRef.current = createActorMock();
    actorRef.current.getReport.mockResolvedValue({
      __kind__: "ok",
      ok: REPORT,
    });
  });

  it("renders all six Sinhala report tabs", async () => {
    renderWithRouter(<ReportsPage />, "/reports");

    const tabs = await screen.findByTestId("reports.tabs");
    expect(tabs).toBeInTheDocument();
    for (const kind of [
      ReportKind.daily,
      ReportKind.weekly,
      ReportKind.monthly,
      ReportKind.byFarmer,
      ReportKind.byProduct,
      ReportKind.byOfficer,
    ]) {
      expect(screen.getByTestId(`reports.tab.${kind}`)).toBeInTheDocument();
    }
  });

  it("requests the daily report for today and shows the totals", async () => {
    renderWithRouter(<ReportsPage />, "/reports");

    await waitFor(() => {
      expect(actorRef.current.getReport).toHaveBeenCalled();
    });
    const [kind] = actorRef.current.getReport.mock.calls[0];
    expect(kind).toBe(ReportKind.daily);

    expect(await screen.findByTestId("reports.summary")).toHaveTextContent(
      "රු. 125,000",
    );
    expect(screen.getByTestId("reports.table")).toBeInTheDocument();
  });

  it("switches to a group-by report and requests the full date range", async () => {
    const user = userEvent.setup();
    renderWithRouter(<ReportsPage />, "/reports");

    await screen.findByTestId("reports.tabs");
    await user.click(screen.getByTestId(`reports.tab.${ReportKind.byProduct}`));

    await waitFor(() => {
      const lastCall =
        actorRef.current.getReport.mock.calls[
          actorRef.current.getReport.mock.calls.length - 1
        ];
      expect(lastCall[0]).toBe(ReportKind.byProduct);
      // Group-by reports are not date-scoped, so they span every record.
      expect(lastCall[1]).toBe("0000-01-01");
      expect(lastCall[2]).toBe("9999-12-31");
    });
  });

  it("shows the Sinhala empty state when a report has no rows", async () => {
    actorRef.current.getReport.mockResolvedValue({
      __kind__: "ok",
      ok: { ...REPORT, rows: [], totalKg: 0n, totalValue: 0n, recordCount: 0n },
    });

    renderWithRouter(<ReportsPage />, "/reports");

    expect(await screen.findByText("දත්ත නොමැත")).toBeInTheDocument();
  });
});
