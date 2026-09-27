import OQL "mo:caffeineai-oql";
import Entity "mo:caffeineai-oql/Entity";
import ArrayEntity "mo:caffeineai-oql/ArrayEntity";
import RecordValue "mo:caffeineai-oql/RecordValue";
import NatValue "mo:caffeineai-oql/NatValue";
import IntValue "mo:caffeineai-oql/IntValue";
import TextValue "mo:caffeineai-oql/TextValue";
import BoolValue "mo:caffeineai-oql/BoolValue";
import ProductValue "ProductValue";
import RoleValue "RoleValue";

import AuthTypes "../types/auth";
import FarmerTypes "../types/farmers";
import HarvestTypes "../types/harvest";
import PriceTypes "../types/prices";
import Common "../types/common";

/// Builds the OQL entity list for the actor's persisted collections.
/// Every entity is `.controllerOnly()`: the Data Intelligence agent (which
/// calls as the controller) can answer over the data, while end users read it
/// only through the app's own session-guarded endpoints.
module {
  /// The compact per-record summary shape exposed as the `harvestSummary`
  /// entity (mirrors `Farmers.HarvestSummary`).
  public type HarvestSummary = {
    id : Common.HarvestId;
    date : Common.DateText;
    product : Common.Product;
    kg : Common.Kg;
    pricePerKg : Common.Money;
    total : Common.Money;
    officerId : Common.OfficerId;
    officerName : Text;
  };

  public func entities(
    farmers : { var items : [FarmerTypes.Farmer] },
    harvests : { var items : [HarvestTypes.Harvest] },
    prices : { var items : [PriceTypes.PriceEntry] },
    accounts : { var items : [AuthTypes.Account] },
  ) : [Entity.Decl] {
    [
      farmers.items.toEntity<FarmerTypes.Farmer>("farmer", "Farmer", "id")
        .sample({
          id = 0;
          code = "";
          name = "";
          phone = "";
          village = "";
          address = "";
          notes = "";
          createdAt = 0;
        })
        .controllerOnly()
        .build(),
      harvests.items.toEntity<HarvestTypes.Harvest>("harvest", "Harvest", "id")
        .sample({
          id = 0;
          date = "";
          farmerId = 0;
          farmerCode = "";
          farmerName = "";
          product = #other;
          kg = 0;
          pricePerKg = 0;
          total = 0;
          officerId = 0;
          officerName = "";
          createdAt = 0;
        })
        .edge("farmerId", "farmer")
        .controllerOnly()
        .build(),
      prices.items.toEntity<PriceTypes.PriceEntry>("price", "PriceEntry", "product")
        .sample({ product = #other; pricePerKg = 0; updatedAt = 0 })
        .controllerOnly()
        .build(),
      accounts.items.toEntity<AuthTypes.Account>("officer", "Account", "id")
        .sample({
          id = 0;
          username = "";
          password = "";
          displayName = "";
          role = #officer;
          active = true;
          createdAt = 0;
        })
        .hidden("password")
        .controllerOnly()
        .build(),
      harvests.items.map(toSummary).toEntity<HarvestSummary>("harvestSummary", "HarvestSummary", "id")
        .sample({
          id = 0;
          date = "";
          product = #other;
          kg = 0;
          pricePerKg = 0;
          total = 0;
          officerId = 0;
          officerName = "";
        })
        .controllerOnly()
        .build(),
    ];
  };

  /// Project a harvest record down to the compact summary row.
  func toSummary(h : HarvestTypes.Harvest) : HarvestSummary {
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
};
