import OQL "mo:caffeineai-oql";

module {
  /// Collapse a role variant to its stable machine key.
  public func _toRow(self : { #admin; #officer }) : OQL.Value {
    #text(
      switch (self) {
        case (#admin) { "admin" };
        case (#officer) { "officer" };
      }
    );
  };
};
