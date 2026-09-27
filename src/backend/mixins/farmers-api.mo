import Runtime "mo:core/Runtime";
import Time "mo:core/Time";
import FarmerTypes "../types/farmers";
import HarvestTypes "../types/harvest";
import AuthTypes "../types/auth";
import Common "../types/common";
import FarmerLib "../lib/farmers";
import HarvestLib "../lib/harvest";

mixin (
  farmers : { var items : [FarmerTypes.Farmer] },
  nextFarmerId : { var value : Nat },
  harvests : { var items : [HarvestTypes.Harvest] },
  sessions : { var byPrincipal : [(Principal, Nat)] },
  accounts : { var items : [AuthTypes.Account] },
) {
  /// List every farmer.
  public query ({ caller }) func listFarmers() : async [FarmerTypes.Farmer] {
    farmersRequireSignedIn(caller);
    FarmerLib.listFarmers(farmers.items);
  };

  /// Search farmers across code, name, phone and village.
  public query ({ caller }) func searchFarmers(term : Text) : async [FarmerTypes.Farmer] {
    farmersRequireSignedIn(caller);
    FarmerLib.searchFarmers(farmers.items, term);
  };

  /// Fetch one farmer with that farmer's harvest history.
  public query ({ caller }) func getFarmer(id : Common.FarmerId) : async ?FarmerTypes.FarmerDetail {
    farmersRequireSignedIn(caller);
    switch (FarmerLib.getFarmer(farmers.items, id)) {
      case null { null };
      case (?farmer) {
        ?{
          farmer;
          harvests = HarvestLib.harvestsForFarmer(harvests.items, id);
        };
      };
    };
  };

  /// Add a farmer (admin only).
  public shared ({ caller }) func addFarmer(
    code : Text,
    name : Text,
    phone : Text,
    village : Text,
    address : Text,
    notes : Text,
  ) : async { #ok : FarmerTypes.Farmer; #err : FarmerTypes.FarmerError } {
    farmersRequireAdmin(caller);
    switch (FarmerLib.addFarmer(farmers.items, nextFarmerId.value, code, name, phone, village, address, notes, Time.now())) {
      case (#err e) { #err(e) };
      case (#ok farmer) {
        farmers.items := farmers.items.concat([farmer]);
        nextFarmerId.value += 1;
        #ok(farmer);
      };
    };
  };

  /// Edit a farmer's details (admin only).
  public shared ({ caller }) func updateFarmer(
    id : Common.FarmerId,
    code : Text,
    name : Text,
    phone : Text,
    village : Text,
    address : Text,
    notes : Text,
  ) : async { #ok : FarmerTypes.Farmer; #err : FarmerTypes.FarmerError } {
    farmersRequireAdmin(caller);
    switch (FarmerLib.updateFarmer(farmers.items, id, code, name, phone, village, address, notes)) {
      case (#err e) { #err(e) };
      case (#ok farmer) {
        farmers.items := farmers.items.map(func f = if (f.id == farmer.id) { farmer } else { f });
        #ok(farmer);
      };
    };
  };

  /// Trap unless the principal has a valid session.
  func farmersRequireSignedIn(principal : Principal) {
    if (farmersCurrentRole(principal) == null) {
      Runtime.trap("notAuthorized");
    };
  };

  /// Trap unless the principal is a signed-in admin.
  func farmersRequireAdmin(principal : Principal) {
    switch (farmersCurrentRole(principal)) {
      case (?#admin) {};
      case _ { Runtime.trap("notAuthorized") };
    };
  };

  /// The signed-in principal's role, or `null` when there is no session.
  func farmersCurrentRole(principal : Principal) : ?Common.Role {
    switch (sessions.byPrincipal.find(func (p, _) = p == principal)) {
      case null { null };
      case (?(_, id)) {
        switch (accounts.items.find(func a = a.id == id)) {
          case (?account) { ?account.role };
          case null { null };
        };
      };
    };
  };
};
