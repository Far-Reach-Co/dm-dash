import { megabytesInBytes } from "./enums";

const subscriptionPlanLimits = {
  // Free-tier limits
  freeOwnedWyrlds: 2,
  freeUserTables: 5,
  freeWyrldTables: 5,
  freeWyrldCharacterLinks: 5,
  freeUserDataBytes: megabytesInBytes.fifty,
  freeWyrldDataBytes: megabytesInBytes.fifty,
  // Pro hard caps
  proUserDataBytes: megabytesInBytes.fiveHundred,
  proWyrldDataBytes: megabytesInBytes.fiveHundred,
} as const;

function getUserDataUsageLimitBytes(isPro: boolean): number {
  return isPro
    ? subscriptionPlanLimits.proUserDataBytes
    : subscriptionPlanLimits.freeUserDataBytes;
}

function getWyrldDataUsageLimitBytes(isPro: boolean): number {
  return isPro
    ? subscriptionPlanLimits.proWyrldDataBytes
    : subscriptionPlanLimits.freeWyrldDataBytes;
}

export {
  subscriptionPlanLimits,
  getUserDataUsageLimitBytes,
  getWyrldDataUsageLimitBytes,
};
