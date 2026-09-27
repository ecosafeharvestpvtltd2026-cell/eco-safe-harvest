import Runtime "mo:core/Runtime";
import Time "mo:core/Time";
import HarvestTypes "../types/harvest";
import FarmerTypes "../types/farmers";
import AuthTypes "../types/auth";
import Common "../types/common";
import HarvestLib "../lib/harvest";
import FarmerLib "../lib/farmers";

mixin (
  harvests : { var items : [HarvestTypes.Harvest] },
  nextHarvestId : { var value : Nat },
  farmers : { var items : [FarmerTypes.Farmer] },
  sessions : { var byPrincipal : [(Principal, Nat)] },
  accounts : { var items : [AuthTypes.Account] },
) {
  /// List harvest records. Officers see only their own; admin sees all.
  public query ({ caller }) func listHarvests() : async [HarvestTypes.Harvest] {
    let account = harvestRequireSignedIn(caller);
    HarvestLib.listHarvests(harvests.items, officerFilter(account));
  };

  /// Fetch one harvest record.
  public query ({ caller }) func getHarvest(id : Common.HarvestId) : async ?HarvestTypes.Harvest {
    let account = harvestRequireSignedIn(caller);
    switch (HarvestLib.getHarvest(harvests.items, id)) {
      case null { null };
      case (?record) {
        if (account.role == #admin or record.officerId == account.id) {
          ?record;
        } else {
          null;
        };
      };
    };
  };

  /// Enter a harvest record. The price used is frozen into the record.
  public shared ({ caller }) func addHarvest(input : HarvestTypes.HarvestInput) : async {
    #ok : HarvestTypes.Harvest;
    #err : HarvestTypes.HarvestError;
  } {
    let account = harvestRequireSignedIn(caller);
    switch (FarmerLib.getFarmer(farmers.items, input.farmerId)) {
      case null { #err(#farmerNotFound(input.farmerId)) };
      case (?farmer) {
        switch (HarvestLib.addHarvest(harvests.items, nextHarvestId.value, input, farmer, account.id, account.displayName, Time.now())) {
          case (#err e) { #err(e) };
          case (#ok record) {
            harvests.items := harvests.items.concat([record]);
            nextHarvestId.value += 1;
            #ok(record);
          };
        };
      };
    };
  };

  /// Edit a harvest record (admin only).
  public shared ({ caller }) func updateHarvest(id : Common.HarvestId, input : HarvestTypes.HarvestInput) : async {
    #ok : HarvestTypes.Harvest;
    #err : HarvestTypes.HarvestError;
  } {
    harvestRequireAdmin(caller);
    switch (FarmerLib.getFarmer(farmers.items, input.farmerId)) {
      case null { #err(#farmerNotFound(input.farmerId)) };
      case (?farmer) {
        switch (HarvestLib.updateHarvest(harvests.items, id, input, farmer)) {
          case (#err e) { #err(e) };
          case (#ok record) {
            harvests.items := harvests.items.map(func h = if (h.id == record.id) { record } else { h });
            #ok(record);
          };
        };
      };
    };
  };

  /// Delete a harvest record (admin only).
  public shared ({ caller }) func deleteHarvest(id : Common.HarvestId) : async {
    #ok : ();
    #err : HarvestTypes.HarvestError;
  } {
    harvestRequireAdmin(caller);
    switch (HarvestLib.deleteHarvest(harvests.items, id)) {
      case (#err e) { #err(e) };
      case (#ok ()) {
        harvests.items := harvests.items.filter(func h = h.id != id);
        #ok(());
      };
    };
  };

  /// Harvest history for one farmer.
  public query ({ caller }) func getFarmerHarvests(farmerId : Common.FarmerId) : async [FarmerTypes.HarvestSummary] {
    ignore harvestRequireSignedIn(caller);
    HarvestLib.harvestsForFarmer(harvests.items, farmerId);
  };

  /// The signed-in account, trapping when there is no session.
  func harvestRequireSignedIn(principal : Principal) : AuthTypes.Account {
    switch (harvestCurrentAccount(principal)) {
      case (?account) { account };
      case null { Runtime.trap("notAuthorized") };
    };
  };

  /// Trap unless the principal is a signed-in admin.
  func harvestRequireAdmin(principal : Principal) {
    let account = harvestRequireSignedIn(principal);
    if (account.role != #admin) {
      Runtime.trap("notAuthorized");
    };
  };

  /// The signed-in principal's account, or `null` when there is no session.
  func harvestCurrentAccount(principal : Principal) : ?AuthTypes.Account {
    switch (sessions.byPrincipal.find(func (p, _) = p == principal)) {
      case null { null };
      case (?(_, id)) { accounts.items.find(func a = a.id == id) };
    };
  };

  /// `null` for admin (all records), the officer's id otherwise.
  func officerFilter(account : AuthTypes.Account) : ?Common.OfficerId {
    if (account.role == #admin) { null } else { ?account.id };
  };
};
