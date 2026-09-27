import Common "common";

module {
  /// The six report types offered by the application.
  public type ReportKind = {
    #daily; // දෛනික වාර්තාව
    #weekly; // සතිපතා වාර්තාව
    #monthly; // මාසික වාර්තාව
    #byFarmer; // ගොවියා අනුව
    #byProduct; // අස්වැන්න වර්ගය අනුව
    #byOfficer; // නිලධාරියා අනුව
  };

  /// One row of a report breakdown.
  public type ReportRow = {
    key : Text;
    title : Text;
    kg : Common.Kg;
    value : Common.Money;
    count : Nat;
  };

  /// A report result: overall totals plus a per-key breakdown.
  public type Report = {
    kind : ReportKind;
    from : Common.DateText;
    to : Common.DateText;
    totalKg : Common.Kg;
    totalValue : Common.Money;
    recordCount : Nat;
    rows : [ReportRow];
  };

  /// Failure modes for report generation.
  public type ReportError = {
    #notAuthorized;
    #invalidRange;
  };
};
