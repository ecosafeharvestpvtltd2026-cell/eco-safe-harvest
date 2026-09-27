import Types "../types/auth";
import Common "../types/common";

module {
  /// Look up an account by username.
  public func findByUsername(accounts : [Types.Account], username : Text) : ?Types.Account {
    accounts.find(func a = a.username == username);
  };

  /// Verify a username/password pair and return the session.
  public func authenticate(accounts : [Types.Account], username : Text, password : Text) : ?Types.Session {
    switch (findByUsername(accounts, username)) {
      case (?account) {
        if (account.password == password and account.active) {
          ?toSession(account);
        } else {
          null;
        };
      };
      case null { null };
    };
  };

  /// Create a new account, rejecting duplicate usernames.
  public func createAccount(
    accounts : [Types.Account],
    nextId : Nat,
    username : Text,
    password : Text,
    displayName : Text,
    role : Common.Role,
    now : Int,
  ) : { #ok : Types.Account; #err : Types.AuthError } {
    switch (findByUsername(accounts, username)) {
      case (?_) { #err(#usernameTaken) };
      case null {
        let account : Types.Account = {
          id = nextId;
          username;
          password;
          displayName;
          role;
          active = true;
          createdAt = now;
        };
        #ok(account);
      };
    };
  };

  /// Update an account's display name.
  public func updateDisplayName(accounts : [Types.Account], id : Common.OfficerId, displayName : Text) : { #ok : Types.Account; #err : Types.AuthError } {
    switch (accounts.find(func a = a.id == id)) {
      case (?account) { #ok({ account with displayName }) };
      case null { #err(#notFound) };
    };
  };

  /// Reset an account's password.
  public func resetPassword(accounts : [Types.Account], id : Common.OfficerId, password : Text) : { #ok : Types.Account; #err : Types.AuthError } {
    switch (accounts.find(func a = a.id == id)) {
      case (?account) { #ok({ account with password }) };
      case null { #err(#notFound) };
    };
  };

  /// The six seeded officer accounts, created on first load.
  public func seedOfficers() : [Types.Account] {
    [
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

  /// The seeded administrator account, created on first load.
  public func seedAdmin() : Types.Account {
    {
      id = 0;
      username = "admin";
      password = "admin123";
      displayName = "පරිපාලක";
      role = #admin;
      active = true;
      createdAt = 0;
    };
  };

  /// Project an account down to the session view returned to the frontend.
  public func toSession(account : Types.Account) : Types.Session {
    {
      id = account.id;
      username = account.username;
      displayName = account.displayName;
      role = account.role;
    };
  };
};
