import AccessControl "mo:caffeineai-authorization/access-control";

module {
  // Previous deployed stable shape: an empty canister.
  type OldActor = {};

  // New stable shape: authorization state plus all domain state.
  type NewActor = {
    accessControlState : AccessControl.AccessControlState;
    accounts : { var items : [Account] };
    nextAccountId : { var value : Nat };
    sessions : { var byPrincipal : [(Principal, Nat)] };
    farmers : { var items : [Farmer] };
    nextFarmerId : { var value : Nat };
    harvests : { var items : [Harvest] };
    nextHarvestId : { var value : Nat };
    prices : { var items : [PriceEntry] };
  };

  // Inlined domain types (migrations may not import project modules).
  type Role = { #admin; #officer };

  type Product = {
    #passion;
    #pear;
    #guava;
    #banana;
    #woodApple;
    #mustard;
    #other;
  };

  type Account = {
    id : Nat;
    username : Text;
    password : Text;
    displayName : Text;
    role : Role;
    active : Bool;
    createdAt : Int;
  };

  type Farmer = {
    id : Nat;
    code : Text;
    name : Text;
    phone : Text;
    village : Text;
    address : Text;
    notes : Text;
    createdAt : Int;
  };

  type Harvest = {
    id : Nat;
    date : Text;
    farmerId : Nat;
    farmerCode : Text;
    farmerName : Text;
    product : Product;
    kg : Nat;
    pricePerKg : Nat;
    total : Nat;
    officerId : Nat;
    officerName : Text;
    createdAt : Int;
  };

  type PriceEntry = {
    product : Product;
    pricePerKg : Nat;
    updatedAt : Int;
  };

  public func migration(_ : OldActor) : NewActor {
    {
      accessControlState = AccessControl.initState();
      accounts = { var items = seedAccounts() };
      nextAccountId = { var value = 7 };
      sessions = { var byPrincipal = [] };
      farmers = { var items = [] };
      nextFarmerId = { var value = 0 };
      harvests = { var items = [] };
      nextHarvestId = { var value = 0 };
      prices = { var items = seedPrices() };
    };
  };

  // The seeded administrator (id 0) and six officer accounts (ids 1-6).
  func seedAccounts() : [Account] {
    [
      {
        id = 0;
        username = "admin";
        password = "admin123";
        displayName = "පරිපාලක";
        role = #admin;
        active = true;
        createdAt = 0;
      },
      {
        id = 1;
        username = "officer1";
        password = "officer123";
        displayName = "සුනිල් පෙරේරා";
        role = #officer;
        active = true;
        createdAt = 0;
      },
      {
        id = 2;
        username = "officer2";
        password = "officer123";
        displayName = "නිමල් සිල්වා";
        role = #officer;
        active = true;
        createdAt = 0;
      },
      {
        id = 3;
        username = "officer3";
        password = "officer123";
        displayName = "කමල් ජයසිංහ";
        role = #officer;
        active = true;
        createdAt = 0;
      },
      {
        id = 4;
        username = "officer4";
        password = "officer123";
        displayName = "රුවන් ප්‍රනාන්දු";
        role = #officer;
        active = true;
        createdAt = 0;
      },
      {
        id = 5;
        username = "officer5";
        password = "officer123";
        displayName = "චමින්ද රත්නායක";
        role = #officer;
        active = true;
        createdAt = 0;
      },
      {
        id = 6;
        username = "officer6";
        password = "officer123";
        displayName = "දිලිප් කුමාර";
        role = #officer;
        active = true;
        createdAt = 0;
      },
    ];
  };

  // Default price per kg (LKR) for all seven products.
  func seedPrices() : [PriceEntry] {
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
