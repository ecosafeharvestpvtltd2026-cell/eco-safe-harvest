module {
  /// Unique identifier for a farmer record.
  public type FarmerId = Nat;

  /// Unique identifier for a harvest record.
  public type HarvestId = Nat;

  /// Unique identifier for an officer account.
  public type OfficerId = Nat;

  /// A calendar date in ISO `YYYY-MM-DD` form (local business date).
  public type DateText = Text;

  /// A monetary value in Sri Lankan Rupees (LKR), stored as a whole number.
  public type Money = Nat;

  /// A weight in kilograms, stored as a whole number.
  public type Kg = Nat;

  /// The seven supported harvest product categories.
  public type Product = {
    #passion; // පැශන්
    #pear; // පේර
    #guava; // ගස්ලබු
    #banana; // කෙසෙල්
    #woodApple; // දිවුල්
    #mustard; // අබ
    #other; // වෙනත්
  };

  /// The two application roles.
  public type Role = {
    #admin;
    #officer;
  };
};
