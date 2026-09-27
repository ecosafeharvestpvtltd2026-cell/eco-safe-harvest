import Runtime "mo:core/Runtime";
import ReportTypes "../types/reports";
import HarvestTypes "../types/harvest";
import AuthTypes "../types/auth";
import Common "../types/common";
import ReportLib "../lib/reports";

mixin (
  harvests : { var items : [HarvestTypes.Harvest] },
  sessions : { var byPrincipal : [(Principal, Nat)] },
  accounts : { var items : [AuthTypes.Account] },
) {
  /// Build a report of the requested kind over a date range.
  /// Officers are scoped to their own records; admin sees all.
  public query ({ caller }) func getReport(
    kind : ReportTypes.ReportKind,
    from : Common.DateText,
    to : Common.DateText,
  ) : async { #ok : ReportTypes.Report; #err : ReportTypes.ReportError } {
    let account = reportsRequireSignedIn(caller);
    let filter : ?Common.OfficerId = if (account.role == #admin) { null } else { ?account.id };
    ReportLib.buildReport(harvests.items, kind, from, to, filter);
  };

  /// The signed-in account, trapping when there is no session.
  func reportsRequireSignedIn(principal : Principal) : AuthTypes.Account {
    switch (reportsCurrentAccount(principal)) {
      case (?account) { account };
      case null { Runtime.trap("notAuthorized") };
    };
  };

  /// The signed-in principal's account, or `null` when there is no session.
  func reportsCurrentAccount(principal : Principal) : ?AuthTypes.Account {
    switch (sessions.byPrincipal.find(func (p, _) = p == principal)) {
      case null { null };
      case (?(_, id)) { accounts.items.find(func a = a.id == id) };
    };
  };
};
