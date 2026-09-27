import Common "common";

module {
  /// The current price per kg for one product.
  public type PriceEntry = {
    product : Common.Product;
    pricePerKg : Common.Money;
    updatedAt : Int;
  };

  /// Failure modes for price-list updates.
  public type PriceError = {
    #notAuthorized;
  };
};
