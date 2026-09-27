import Common "common";

module {
  /// A user account that can sign in to the application.
  public type Account = {
    id : Common.OfficerId;
    username : Text;
    password : Text;
    displayName : Text;
    role : Common.Role;
    active : Bool;
    createdAt : Int;
  };

  /// The signed-in user's identity and role, returned to the frontend.
  public type Session = {
    id : Common.OfficerId;
    username : Text;
    displayName : Text;
    role : Common.Role;
  };

  /// A seeded sign-in credential row shown on the pre-login credentials panel.
  public type CredentialRow = {
    username : Text;
    password : Text;
    role : Common.Role;
    displayName : Text;
  };

  /// Failure modes for sign-in and account management.
  public type AuthError = {
    #invalidCredentials;
    #usernameTaken;
    #notFound;
    #notAuthorized;
    #lastAdmin;
  };
};
