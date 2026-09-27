import Common "common";

module {
  /// A farmer registered with the company.
  public type Farmer = {
    id : Common.FarmerId;
    code : Text; // ගොවි කේතය
    name : Text; // ගොවි නම
    phone : Text; // දුරකථන අංකය
    village : Text; // ගම
    address : Text; // ලිපිනය
    notes : Text; // සටහන්
    createdAt : Int;
  };

  /// A farmer together with that farmer's harvest history.
  public type FarmerDetail = {
    farmer : Farmer;
    harvests : [HarvestSummary];
  };

  /// A compact harvest row used inside farmer detail and list views.
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

  /// Failure modes for farmer management.
  public type FarmerError = {
    #duplicateCode : Text;
    #notFound : Common.FarmerId;
    #notAuthorized;
  };
};
