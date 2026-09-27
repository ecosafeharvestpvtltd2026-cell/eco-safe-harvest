import Runtime "mo:core/Runtime";
import Time "mo:core/Time";
import AuthTypes "../types/auth";
import Common "../types/common";
import AuthLib "../lib/auth";

mixin (
  accounts : { var items : [AuthTypes.Account] },
  nextAccountId : { var value : Nat },
  sessions : { var byPrincipal : [(Principal, Nat)] },
) {
  /// Sign in with username, password and the selected role.
  public shared ({ caller }) func login(username : Text, password : Text, role : Common.Role) : async {
    #ok : AuthTypes.Session;
    #err : AuthTypes.AuthError;
  } {
    switch (AuthLib.authenticate(accounts.items, username, password)) {
      case null { #err(#invalidCredentials) };
      case (?session) {
        if (session.role != role) {
          return #err(#invalidCredentials);
        };
        sessions.byPrincipal := setSession(sessions.byPrincipal, caller, session.id);
        #ok(session);
      };
    };
  };

  /// The signed-in user's session, or `null` when not signed in.
  public query ({ caller }) func getSession() : async ?AuthTypes.Session {
    switch (sessionIdFor(sessions.byPrincipal, caller)) {
      case null { null };
      case (?id) {
        switch (accounts.items.find(func a = a.id == id)) {
          case (?account) { ?AuthLib.toSession(account) };
          case null { null };
        };
      };
    };
  };

  /// Clear the current session.
  public shared ({ caller }) func logout() : async () {
    sessions.byPrincipal := sessions.byPrincipal.filter(func (p, _) = p != caller);
  };

  /// The seeded sign-in credentials (admin + six officers) shown on the
  /// pre-login credentials panel. Intentionally public: it returns only the
  /// accounts created by the migration seed (ids 0-6) and no other account data.
  public query func getSeededCredentials() : async [AuthTypes.CredentialRow] {
    accounts.items
      .filter(func a = a.id <= 6)
      .map(func a = {
        username = a.username;
        password = a.password;
        role = a.role;
        displayName = a.displayName;
      });
  };

  /// List all officer accounts (admin only).
  public query ({ caller }) func listOfficers() : async [AuthTypes.Session] {
    authRequireAdmin(caller);
    accounts.items
      .filter(func a = a.role == #officer)
      .map(AuthLib.toSession);
  };

  /// Create an officer account (admin only).
  public shared ({ caller }) func createOfficer(username : Text, password : Text, displayName : Text) : async {
    #ok : AuthTypes.Session;
    #err : AuthTypes.AuthError;
  } {
    authRequireAdmin(caller);
    switch (AuthLib.createAccount(accounts.items, nextAccountId.value, username, password, displayName, #officer, Time.now())) {
      case (#err e) { #err(e) };
      case (#ok account) {
        accounts.items := accounts.items.concat([account]);
        nextAccountId.value += 1;
        #ok(AuthLib.toSession(account));
      };
    };
  };

  /// Update an officer's display name (admin only).
  public shared ({ caller }) func updateOfficer(id : Common.OfficerId, displayName : Text) : async {
    #ok : AuthTypes.Session;
    #err : AuthTypes.AuthError;
  } {
    authRequireAdmin(caller);
    switch (AuthLib.updateDisplayName(accounts.items, id, displayName)) {
      case (#err e) { #err(e) };
      case (#ok account) {
        accounts.items := replaceAccount(accounts.items, account);
        #ok(AuthLib.toSession(account));
      };
    };
  };

  /// Reset an officer's password (admin only).
  public shared ({ caller }) func resetOfficerPassword(id : Common.OfficerId, password : Text) : async {
    #ok : ();
    #err : AuthTypes.AuthError;
  } {
    authRequireAdmin(caller);
    switch (AuthLib.resetPassword(accounts.items, id, password)) {
      case (#err e) { #err(e) };
      case (#ok account) {
        accounts.items := replaceAccount(accounts.items, account);
        #ok(());
      };
    };
  };

  /// The signed-in account for a principal, or `null` when there is no session.
  func authCurrentAccount(principal : Principal) : ?AuthTypes.Account {
    switch (sessionIdFor(sessions.byPrincipal, principal)) {
      case null { null };
      case (?id) { accounts.items.find(func a = a.id == id) };
    };
  };

  /// Trap unless the principal is a signed-in admin.
  func authRequireAdmin(principal : Principal) {
    switch (authCurrentAccount(principal)) {
      case (?account) {
        if (account.role != #admin) {
          Runtime.trap("notAuthorized");
        };
      };
      case null { Runtime.trap("notAuthorized") };
    };
  };

  /// The signed-in account id for a principal, if any.
  func sessionIdFor(entries : [(Principal, Nat)], principal : Principal) : ?Nat {
    switch (entries.find(func (p, _) = p == principal)) {
      case (?(_, id)) { ?id };
      case null { null };
    };
  };

  /// Insert or replace a principal's session id.
  func setSession(entries : [(Principal, Nat)], principal : Principal, id : Nat) : [(Principal, Nat)] {
    entries.filter(func (p, _) = p != principal).concat([(principal, id)]);
  };

  /// Replace an account with the same id.
  func replaceAccount(list : [AuthTypes.Account], account : AuthTypes.Account) : [AuthTypes.Account] {
    list.map(func a = if (a.id == account.id) { account } else { a });
  };
};
