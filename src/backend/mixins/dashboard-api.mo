import Runtime "mo:core/Runtime";
import DashboardTypes "../types/dashboard";
import HarvestTypes "../types/harvest";
import AuthTypes "../types/auth";
import Common "../types/common";
import DashboardLib "../lib/dashboard";

mixin (
  harvests : { var items : [HarvestTypes.Harvest] },
  sessions : { var byPrincipal : [(Principal, Nat)] },
  accounts : { var items : [AuthTypes.Account] },
) {
  /// Today's totals plus the latest harvest entries.
  /// Officers are scoped to their own records; admin sees company-wide totals.
  public query ({ caller }) func getDashboard(today : Common.DateText) : async DashboardTypes.Dashboard {
    let account = dashboardRequireSignedIn(caller);
    let filter : ?Common.OfficerId = if (account.role == #admin) { null } else { ?account.id };
    DashboardLib.buildDashboard(harvests.items, today, filter);
  };

  /// The signed-in account, trapping when there is no session.
  func dashboardRequireSignedIn(principal : Principal) : AuthTypes.Account {
    switch (dashboardCurrentAccount(principal)) {
      case (?account) { account };
      case null { Runtime.trap("notAuthorized") };
    };
  };

  /// The signed-in principal's account, or `null` when there is no session.
  func dashboardCurrentAccount(principal : Principal) : ?AuthTypes.Account {
    switch (sessions.byPrincipal.find(func (p, _) = p == principal)) {
      case null { null };
      case (?(_, id)) { accounts.items.find(func a = a.id == id) };
    };
  };
};
