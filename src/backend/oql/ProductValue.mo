import OQL "mo:caffeineai-oql";

module {
  /// Collapse a product variant to its stable machine key.
  public func _toRow(self : { #passion; #pear; #guava; #banana; #woodApple; #mustard; #other }) : OQL.Value {
    #text(
      switch (self) {
        case (#passion) { "passion" };
        case (#pear) { "pear" };
        case (#guava) { "guava" };
        case (#banana) { "banana" };
        case (#woodApple) { "woodApple" };
        case (#mustard) { "mustard" };
        case (#other) { "other" };
      }
    );
  };
};
