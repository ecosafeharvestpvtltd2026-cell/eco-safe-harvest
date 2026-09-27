import {
  AuthError,
  type FarmerError,
  type HarvestError,
  PriceError,
  ReportError,
} from "@/backend";

/** Human-readable Sinhala messages for every backend error variant. */
export const AUTH_ERROR_MESSAGES: Record<AuthError, string> = {
  [AuthError.invalidCredentials]: "පරිශීලක නාමය හෝ මුරපදය වැරදිය. නැවත උත්සාහ කරන්න.",
  [AuthError.notAuthorized]: "ඔබට මෙම ක්‍රියාව සිදු කිරීමට අවසර නැත.",
  [AuthError.lastAdmin]: "අවසන් පරිපාලක ගිණුම ඉවත් කළ නොහැක.",
  [AuthError.notFound]: "ගිණුම හමු නොවීය.",
  [AuthError.usernameTaken]: "මෙම පරිශීලක නාමය දැනටමත් භාවිතයේ ඇත.",
};

export const FARMER_ERROR_MESSAGES: Record<FarmerError["__kind__"], string> = {
  notAuthorized: "ඔබට ගොවි තොරතුරු වෙනස් කිරීමට අවසර නැත.",
  notFound: "ගොවියා හමු නොවීය.",
  duplicateCode: "මෙම ගොවි කේතය දැනටමත් භාවිතයේ ඇත.",
};

export const HARVEST_ERROR_MESSAGES: Record<HarvestError["__kind__"], string> =
  {
    notAuthorized: "ඔබට මෙම අස්වැන්න වෙනස් කිරීමට අවසර නැත.",
    farmerNotFound: "තෝරාගත් ගොවියා හමු නොවීය.",
    notFound: "අස්වැන්න වාර්තාව හමු නොවීය.",
  };

export const PRICE_ERROR_MESSAGES: Record<PriceError, string> = {
  [PriceError.notAuthorized]: "ඔබට මිල වෙනස් කිරීමට අවසර නැත.",
};

export const REPORT_ERROR_MESSAGES: Record<ReportError, string> = {
  [ReportError.notAuthorized]: "ඔබට වාර්තා බැලීමට අවසර නැත.",
  [ReportError.invalidRange]: "තෝරාගත් දින පරාසය වැරදිය.",
};

/** Generic Sinhala message for an unexpected failure. */
export const GENERIC_ERROR_MESSAGE = "දෝෂයක් සිදුවිය. නැවත උත්සාහ කරන්න.";

/** Sinhala message for a failed network/backend request. */
export const NETWORK_ERROR_MESSAGE =
  "සේවාදායකය සමඟ සම්බන්ධ විය නොහැක. නැවත උත්සාහ කරන්න.";

/** Extract a Sinhala message from any thrown value. */
export function errorMessage(error: unknown): string {
  if (error instanceof Error && error.message) return error.message;
  if (typeof error === "string" && error) return error;
  return GENERIC_ERROR_MESSAGE;
}
