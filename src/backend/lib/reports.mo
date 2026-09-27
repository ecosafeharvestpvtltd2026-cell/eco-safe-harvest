import Nat "mo:core/Nat";
import Types "../types/reports";
import HarvestTypes "../types/harvest";
import Common "../types/common";

module {
  /// Build a report of the requested kind over the given date range.
  /// `officerFilter` is `null` for admin (all records) and the officer's id
  /// for an officer (own records only).
  public func buildReport(
    harvests : [HarvestTypes.Harvest],
    kind : Types.ReportKind,
    from : Common.DateText,
    to : Common.DateText,
    officerFilter : ?Common.OfficerId,
  ) : { #ok : Types.Report; #err : Types.ReportError } {
    if (from > to) {
      return #err(#invalidRange);
    };

    let scoped = switch (officerFilter) {
      case null { harvests };
      case (?officerId) { harvests.filter(func h = h.officerId == officerId) };
    };
    let inRange = scoped.filter(func h = h.date >= from and h.date <= to);

    var totalKg = 0;
    var totalValue = 0;
    for (h in inRange.values()) {
      totalKg += h.kg;
      totalValue += h.total;
    };

    let rows = switch (kind) {
      case (#daily) { groupBy(inRange, func h = h.date, func h = h.date) };
      case (#weekly) { groupBy(inRange, func h = weekKey(h.date), func h = weekKey(h.date)) };
      case (#monthly) { groupBy(inRange, func h = monthKey(h.date), func h = monthKey(h.date)) };
      case (#byFarmer) { groupBy(inRange, func h = h.farmerId.toText(), func h = h.farmerCode # " - " # h.farmerName) };
      case (#byProduct) { groupBy(inRange, func h = productKey(h.product), func h = productLabel(h.product)) };
      case (#byOfficer) { groupBy(inRange, func h = h.officerId.toText(), func h = h.officerName) };
    };

    #ok({
      kind;
      from;
      to;
      totalKg;
      totalValue;
      recordCount = inRange.size();
      rows;
    });
  };

  /// Group records by a key, accumulating kg, value and count per group.
  func groupBy(
    records : [HarvestTypes.Harvest],
    keyOf : HarvestTypes.Harvest -> Text,
    titleOf : HarvestTypes.Harvest -> Text,
  ) : [Types.ReportRow] {
    var keys : [Text] = [];
    var titles : [Text] = [];
    var kgs : [Common.Kg] = [];
    var values : [Common.Money] = [];
    var counts : [Nat] = [];

    for (h in records.values()) {
      let key = keyOf(h);
      switch (keys.findIndex(func k = k == key)) {
        case (?i) {
          kgs := replaceAt(kgs, i, kgs[i] + h.kg);
          values := replaceAt(values, i, values[i] + h.total);
          counts := replaceAt(counts, i, counts[i] + 1);
        };
        case null {
          keys := keys.concat([key]);
          titles := titles.concat([titleOf(h)]);
          kgs := kgs.concat([h.kg]);
          values := values.concat([h.total]);
          counts := counts.concat([1]);
        };
      };
    };

    keys.mapEntries(func (key, i) = {
      key;
      title = titles[i];
      kg = kgs[i];
      value = values[i];
      count = counts[i];
    });
  };

  /// Replace the element at `i`, returning a new array.
  func replaceAt<T>(arr : [T], i : Nat, value : T) : [T] {
    arr.mapEntries(func (item, j) = if (j == i) { value } else { item });
  };

  /// `YYYY-MM-DD` -> `YYYY-Www` (ISO week label).
  func weekKey(date : Common.DateText) : Text {
    let parts = date.split(#char '-').toArray();
    if (parts.size() < 3) {
      return date;
    };
    let year = parts[0];
    let month = parts[1].toNat() ?? 0;
    let day = parts[2].toNat() ?? 0;
    let week = ((dayOfYear(month, day) + 6) / 7);
    year # "-W" # pad2(week);
  };

  /// `YYYY-MM-DD` -> `YYYY-MM`.
  func monthKey(date : Common.DateText) : Text {
    let parts = date.split(#char '-').toArray();
    if (parts.size() < 2) {
      return date;
    };
    parts[0] # "-" # parts[1];
  };

  /// Day-of-year for a month/day pair (non-leap approximation is fine for grouping).
  func dayOfYear(month : Nat, day : Nat) : Nat {
    let cumulative = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334];
    let index = if (month == 0) { 0 } else if (month > 12) { 11 } else { month - 1 };
    cumulative[index] + day;
  };

  /// Zero-pad a number below 10 to two digits.
  func pad2(n : Nat) : Text {
    if (n < 10) { "0" # n.toText() } else { n.toText() };
  };

  /// Stable machine key for a product.
  func productKey(product : Common.Product) : Text {
    switch (product) {
      case (#passion) { "passion" };
      case (#pear) { "pear" };
      case (#guava) { "guava" };
      case (#banana) { "banana" };
      case (#woodApple) { "woodApple" };
      case (#mustard) { "mustard" };
      case (#other) { "other" };
    };
  };

  /// Sinhala display label for a product.
  func productLabel(product : Common.Product) : Text {
    switch (product) {
      case (#passion) { "පැශන්" };
      case (#pear) { "පේර" };
      case (#guava) { "ගස්ලබු" };
      case (#banana) { "කෙසෙල්" };
      case (#woodApple) { "දිවුල්" };
      case (#mustard) { "අබ" };
      case (#other) { "වෙනත්" };
    };
  };
};
