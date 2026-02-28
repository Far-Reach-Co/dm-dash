import toast from "../components/Toast.js";
import renderTierLimitWarning from "../components/renderTierLimitWarning.js";

const TIER_LIMIT_WARNING_BY_CODE = {
  USER_IS_NOT_PRO:
    'You have reached the limit for this feature on your account. Please subscribe to our "Pro User" package to increase the limit.',
  PROJECT_IS_NOT_PRO:
    'This Wyrld has reached the limit for this feature. Please subscribe to our "Pro Wyrld" package to increase the limit.',
  USER_DATA_HARD_LIMIT_REACHED:
    "This account is at its hard image data cap. Remove unused images to free space.",
  PROJECT_DATA_HARD_LIMIT_REACHED:
    "This Wyrld is at its hard image data cap. Remove unused images to free space.",
};

function readCode(resultOrCode) {
  if (typeof resultOrCode === "string") {
    return resultOrCode;
  }
  return resultOrCode?.code || null;
}

export function getTierLimitWarningMessage(resultOrCode) {
  const code = readCode(resultOrCode);
  if (!code) return null;
  return TIER_LIMIT_WARNING_BY_CODE[code] || null;
}

export function showTierLimitWarning(resultOrCode) {
  const message = getTierLimitWarningMessage(resultOrCode);
  if (!message) return false;
  renderTierLimitWarning(message);
  return true;
}

export function showApiErrorToast(result, options = {}) {
  const { fallbackMessage = "Error", includeResultMessage = false } = options;
  if (!result || result.ok) return false;
  const message =
    includeResultMessage && result.error ? result.error : fallbackMessage;
  toast.error(message || fallbackMessage);
  return true;
}

export function handleApiFailure(result, options = {}) {
  if (!result || result.ok) return false;
  const {
    showTierLimit = true,
    fallbackMessage = "Error",
    includeResultMessage = false,
  } = options;

  if (showTierLimit && showTierLimitWarning(result)) {
    return true;
  }
  return showApiErrorToast(result, { fallbackMessage, includeResultMessage });
}
