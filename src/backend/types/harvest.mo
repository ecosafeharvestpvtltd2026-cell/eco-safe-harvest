import Common "common";

module {
  /// A harvest record. `pricePerKg` and `total` are frozen at entry time and
  /// are never changed by later price-list updates.
  public type Harvest = {
    id : Common.HarvestId;
    date : Common.DateText; // දිනය
    farmerId : Common.FarmerId;
    farmerCode : Text; // ගොවි කේතය
    farmerName : Text; // ගොවි නම
    product : Common.Product; // අස්වැන්න වර්ගය
    kg : Common.Kg; // කිලෝ ගණන
    pricePerKg : Common.Money; // කිලෝවක මිල (at entry time)
    total : Common.Money; // මුළු මුදල = kg × pricePerKg
    officerId : Common.OfficerId;
    officerName : Text;
    createdAt : Int;
  };

  /// The fields supplied when creating or editing a harvest record.
  public type HarvestInput = {
    date : Common.DateText;
    farmerId : Common.FarmerId;
    product : Common.Product;
    kg : Common.Kg;
    pricePerKg : Common.Money;
  };

  /// Failure modes for harvest entry.
  public type HarvestError = {
    #farmerNotFound : Common.FarmerId;
    #notFound : Common.HarvestId;
    #notAuthorized;
  };
};
