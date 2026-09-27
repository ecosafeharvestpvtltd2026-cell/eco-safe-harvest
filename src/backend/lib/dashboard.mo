import Types "../types/dashboard";
import HarvestTypes "../types/harvest";
import Common "../types/common";
import HarvestLib "harvest";

module {
  /// Build the dashboard payload for the given day.
  /// `officerFilter` is `null` for admin (company-wide) and the officer's id
  /// for an officer (own records only).
  public func buildDashboard(
    harvests : [HarvestTypes.Harvest],
    today : Common.DateText,
    officerFilter : ?Common.OfficerId,
  ) : Types.Dashboard {
    let stats = HarvestLib.todayStats(harvests, today, officerFilter);
    {
      stats = { stats with date = today };
      recent = HarvestLib.recentHarvests(harvests, 5, officerFilter);
    };
  };
};
