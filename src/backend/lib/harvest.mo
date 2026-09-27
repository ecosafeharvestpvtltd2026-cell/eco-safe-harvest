import Nat "mo:core/Nat";
import Types "../types/harvest";
import Farmers "../types/farmers";
import Common "../types/common";

module {
  /// List harvest records, optionally filtered to one officer.
  public func listHarvests(harvests : [Types.Harvest], officerFilter : ?Common.OfficerId) : [Types.Harvest] {
    switch (officerFilter) {
      case null { harvests };
      case (?officerId) { harvests.filter(func h = h.officerId == officerId) };
    };
  };

  /// Fetch one harvest record by id.
  public func getHarvest(harvests : [Types.Harvest], id : Common.HarvestId) : ?Types.Harvest {
    harvests.find(func h = h.id == id);
  };

  /// Create a harvest record, freezing the price used at entry time.
  public func addHarvest(
    harvests : [Types.Harvest],
    nextId : Nat,
    input : Types.HarvestInput,
    farmer : Farmers.Farmer,
    officerId : Common.OfficerId,
    officerName : Text,
    now : Int,
  ) : { #ok : Types.Harvest; #err : Types.HarvestError } {
    let record : Types.Harvest = {
      id = nextId;
      date = input.date;
      farmerId = farmer.id;
      farmerCode = farmer.code;
      farmerName = farmer.name;
      product = input.product;
      kg = input.kg;
      pricePerKg = input.pricePerKg;
      total = input.kg * input.pricePerKg;
      officerId;
      officerName;
      createdAt = now;
    };
    #ok(record);
  };

  /// Edit an existing harvest record (admin only).
  public func updateHarvest(
    harvests : [Types.Harvest],
    id : Common.HarvestId,
    input : Types.HarvestInput,
    farmer : Farmers.Farmer,
  ) : { #ok : Types.Harvest; #err : Types.HarvestError } {
    switch (getHarvest(harvests, id)) {
      case null { #err(#notFound(id)) };
      case (?existing) {
        #ok({
          existing with
          date = input.date;
          farmerId = farmer.id;
          farmerCode = farmer.code;
          farmerName = farmer.name;
          product = input.product;
          kg = input.kg;
          pricePerKg = input.pricePerKg;
          total = input.kg * input.pricePerKg;
        });
      };
    };
  };

  /// Delete a harvest record (admin only).
  public func deleteHarvest(harvests : [Types.Harvest], id : Common.HarvestId) : { #ok : (); #err : Types.HarvestError } {
    switch (getHarvest(harvests, id)) {
      case null { #err(#notFound(id)) };
      case (?_) { #ok(()) };
    };
  };

  /// Harvest history for one farmer, newest first.
  public func harvestsForFarmer(harvests : [Types.Harvest], farmerId : Common.FarmerId) : [Farmers.HarvestSummary] {
    harvests
      .filter(func h = h.farmerId == farmerId)
      .map(toSummary)
      .sort(func (a, b) = compareSummaryDesc(a, b));
  };

  /// The latest harvest entries, newest first, optionally scoped to one officer.
  public func recentHarvests(harvests : [Types.Harvest], limit : Nat, officerFilter : ?Common.OfficerId) : [Farmers.HarvestSummary] {
    let sorted = listHarvests(harvests, officerFilter).map(toSummary).sort(func (a, b) = compareSummaryDesc(a, b));
    if (sorted.size() <= limit) {
      sorted;
    } else {
      sorted.sliceToArray(0, limit);
    };
  };

  /// Today's totals for the dashboard, optionally scoped to one officer.
  public func todayStats(harvests : [Types.Harvest], today : Common.DateText, officerFilter : ?Common.OfficerId) : {
    totalKg : Common.Kg;
    farmerCount : Nat;
    totalValue : Common.Money;
    recordCount : Nat;
  } {
    let scoped = listHarvests(harvests, officerFilter).filter(func h = h.date == today);
    var totalKg = 0;
    var totalValue = 0;
    var farmerIds : [Common.FarmerId] = [];
    for (h in scoped.values()) {
      totalKg += h.kg;
      totalValue += h.total;
      if (not farmerIds.contains(h.farmerId)) {
        farmerIds := farmerIds.concat([h.farmerId]);
      };
    };
    {
      totalKg;
      farmerCount = farmerIds.size();
      totalValue;
      recordCount = scoped.size();
    };
  };

  /// Project a harvest record down to the compact summary view.
  public func toSummary(h : Types.Harvest) : Farmers.HarvestSummary {
    {
      id = h.id;
      date = h.date;
      product = h.product;
      kg = h.kg;
      pricePerKg = h.pricePerKg;
      total = h.total;
      officerId = h.officerId;
      officerName = h.officerName;
    };
  };

  /// Newest-first ordering by record id.
  func compareSummaryDesc(a : Farmers.HarvestSummary, b : Farmers.HarvestSummary) : { #less; #equal; #greater } {
    if (a.id > b.id) { #less } else if (a.id < b.id) { #greater } else { #equal };
  };
};
