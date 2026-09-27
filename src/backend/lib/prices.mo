import Types "../types/prices";
import Common "../types/common";

module {
  /// The current price list for all seven products.
  public func listPrices(prices : [Types.PriceEntry]) : [Types.PriceEntry] {
    prices;
  };

  /// The current price per kg for one product.
  public func getPrice(prices : [Types.PriceEntry], product : Common.Product) : Common.Money {
    switch (prices.find(func p = p.product == product)) {
      case (?entry) { entry.pricePerKg };
      case null { 0 };
    };
  };

  /// Update the current price for one product.
  public func setPrice(
    prices : [Types.PriceEntry],
    product : Common.Product,
    pricePerKg : Common.Money,
    now : Int,
  ) : { #ok : Types.PriceEntry; #err : Types.PriceError } {
    #ok({ product; pricePerKg; updatedAt = now });
  };

  /// The default seeded price list for all seven products.
  public func seedPrices() : [Types.PriceEntry] {
    [
      { product = #passion; pricePerKg = 350; updatedAt = 0 },
      { product = #pear; pricePerKg = 280; updatedAt = 0 },
      { product = #guava; pricePerKg = 220; updatedAt = 0 },
      { product = #banana; pricePerKg = 180; updatedAt = 0 },
      { product = #woodApple; pricePerKg = 200; updatedAt = 0 },
      { product = #mustard; pricePerKg = 420; updatedAt = 0 },
      { product = #other; pricePerKg = 150; updatedAt = 0 },
    ];
  };
};
