import AccessControl "mo:caffeineai-authorization/access-control";
import MixinAuthorization "mo:caffeineai-authorization/MixinAuthorization";
import Expose "mo:caffeineai-oql/Expose";

import AuthTypes "types/auth";
import FarmerTypes "types/farmers";
import HarvestTypes "types/harvest";
import PriceTypes "types/prices";

import OqlEntities "oql/entities";

import AuthApi "mixins/auth-api";
import FarmersApi "mixins/farmers-api";
import HarvestApi "mixins/harvest-api";
import PricesApi "mixins/prices-api";
import ReportsApi "mixins/reports-api";
import DashboardApi "mixins/dashboard-api";
import ApiDocMixin "mixins/api-doc";

actor {
  // Authorization state (owned by the caffeineai-authorization component).
  let accessControlState : AccessControl.AccessControlState;

  // Accounts and sessions.
  let accounts : { var items : [AuthTypes.Account] };
  let nextAccountId : { var value : Nat };
  let sessions : { var byPrincipal : [(Principal, Nat)] };

  // Farmer management.
  let farmers : { var items : [FarmerTypes.Farmer] };
  let nextFarmerId : { var value : Nat };

  // Harvest records.
  let harvests : { var items : [HarvestTypes.Harvest] };
  let nextHarvestId : { var value : Nat };

  // Current price list.
  let prices : { var items : [PriceTypes.PriceEntry] };

  include MixinAuthorization(accessControlState, null);
  include AuthApi(accounts, nextAccountId, sessions);
  include FarmersApi(farmers, nextFarmerId, harvests, sessions, accounts);
  include HarvestApi(harvests, nextHarvestId, farmers, sessions, accounts);
  include PricesApi(prices, sessions, accounts);
  include ReportsApi(harvests, sessions, accounts);
  include DashboardApi(harvests, sessions, accounts);
  include ApiDocMixin();
  include Expose({
    entities = OqlEntities.entities(farmers, harvests, prices, accounts);
  });
};
