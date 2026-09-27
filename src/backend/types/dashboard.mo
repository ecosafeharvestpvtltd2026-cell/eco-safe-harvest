import Common "common";
import Farmers "farmers";

module {
  /// Today's aggregate figures shown on the main screen.
  public type DashboardStats = {
    date : Common.DateText;
    totalKg : Common.Kg;
    farmerCount : Nat;
    totalValue : Common.Money;
    recordCount : Nat;
  };

  /// The dashboard payload: today's totals plus the latest entries.
  public type Dashboard = {
    stats : DashboardStats;
    recent : [Farmers.HarvestSummary];
  };
};
