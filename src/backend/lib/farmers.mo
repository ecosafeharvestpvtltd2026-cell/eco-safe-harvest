import Types "../types/farmers";
import Common "../types/common";

module {
  /// List every farmer.
  public func listFarmers(farmers : [Types.Farmer]) : [Types.Farmer] {
    farmers;
  };

  /// Search farmers across code, name, phone and village.
  public func searchFarmers(farmers : [Types.Farmer], term : Text) : [Types.Farmer] {
    let needle = term.toLower();
    if (needle == "") {
      return farmers;
    };
    farmers.filter(func f =
      f.code.toLower().contains(#text needle)
      or f.name.toLower().contains(#text needle)
      or f.phone.toLower().contains(#text needle)
      or f.village.toLower().contains(#text needle)
    );
  };

  /// Fetch one farmer by id.
  public func getFarmer(farmers : [Types.Farmer], id : Common.FarmerId) : ?Types.Farmer {
    farmers.find(func f = f.id == id);
  };

  /// Fetch one farmer by code.
  public func getFarmerByCode(farmers : [Types.Farmer], code : Text) : ?Types.Farmer {
    farmers.find(func f = f.code == code);
  };

  /// Create a farmer, rejecting a duplicate code.
  public func addFarmer(
    farmers : [Types.Farmer],
    nextId : Nat,
    code : Text,
    name : Text,
    phone : Text,
    village : Text,
    address : Text,
    notes : Text,
    now : Int,
  ) : { #ok : Types.Farmer; #err : Types.FarmerError } {
    switch (getFarmerByCode(farmers, code)) {
      case (?_) { #err(#duplicateCode(code)) };
      case null {
        let farmer : Types.Farmer = {
          id = nextId;
          code;
          name;
          phone;
          village;
          address;
          notes;
          createdAt = now;
        };
        #ok(farmer);
      };
    };
  };

  /// Update an existing farmer's details.
  public func updateFarmer(
    farmers : [Types.Farmer],
    id : Common.FarmerId,
    code : Text,
    name : Text,
    phone : Text,
    village : Text,
    address : Text,
    notes : Text,
  ) : { #ok : Types.Farmer; #err : Types.FarmerError } {
    switch (getFarmer(farmers, id)) {
      case null { #err(#notFound(id)) };
      case (?existing) {
        switch (getFarmerByCode(farmers, code)) {
          case (?other) {
            if (other.id != id) {
              return #err(#duplicateCode(code));
            };
          };
          case null {};
        };
        #ok({
          existing with
          code;
          name;
          phone;
          village;
          address;
          notes;
        });
      };
    };
  };
};
