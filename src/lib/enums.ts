// RETURN STATUS ENUMS
enum userSubscriptionStatus {
  userIsNotPro = "USER_IS_NOT_PRO",
  projectIsNotPro = "PROJECT_IS_NOT_PRO",
  userDataHardLimitReached = "USER_DATA_HARD_LIMIT_REACHED",
  projectDataHardLimitReached = "PROJECT_DATA_HARD_LIMIT_REACHED",
}

enum megabytesInBytes {
  fifty = 52428800,
  fiveHundred = 524288000,
}

export { userSubscriptionStatus, megabytesInBytes };
