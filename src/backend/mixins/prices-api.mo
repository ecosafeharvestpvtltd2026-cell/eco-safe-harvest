import Runtime "mo:core/Runtime";
import Time "mo:core/Time";
import PriceTypes "../types/prices";
import AuthTypes "../types/auth";
import Common "../types/common";
import PriceLib "../lib/prices";

mixin (
  prices : { var items : [PriceTypes.PriceEntry] },
  sessions : { var byPrincipal : [(Principal, Nat)] },
  accounts : { var items : [AuthTypes.Account] },
) {
  /// The current price list for all seven products.
  public query ({ caller }) func listPrices() : async [PriceTypes.PriceEntry] {
    pricesRequireSignedIn(caller);
    PriceLib.listPrices(prices.items);
  };

  /// Update the current price per kg for one product (admin only).
  public shared ({ caller }) func setPrice(product : Common.Product, pricePerKg : Common.Money) : async {
    #ok : PriceTypes.PriceEntry;
    #err : PriceTypes.PriceError;
  } {
    pricesRequireAdmin(caller);
    switch (PriceLib.setPrice(prices.items, product, pricePerKg, Time.now())) {
      case (#err e) { #err(e) };
      case (#ok entry) {
        prices.items := replacePrice(prices.items, entry);
        #ok(entry);
      };
    };
  };

  /// Trap unless the principal has a valid session.
  func pricesRequireSignedIn(principal : Principal) {
    if (pricesCurrentRole(principal) == null) {
      Runtime.trap("notAuthorized");
    };
  };

  /// Trap unless the principal is a signed-in admin.
  func pricesRequireAdmin(principal : Principal) {
    switch (pricesCurrentRole(principal)) {
      case (?#admin) {};
      case _ { Runtime.trap("notAuthorized") };
    };
  };

  /// The signed-in principal's role, or `null` when there is no session.
  func pricesCurrentRole(principal : Principal) : ?Common.Role {
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

  /// Insert or replace the entry for a product.
  func replacePrice(list : [PriceTypes.PriceEntry], entry : PriceTypes.PriceEntry) : [PriceTypes.PriceEntry] {
    let without = list.filter(func p = p.product != entry.product);
    without.concat([entry]);
  };
};
