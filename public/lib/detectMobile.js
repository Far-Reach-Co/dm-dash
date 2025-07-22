export default function detectMob() {
  return (
    typeof window.orientation !== "undefined" ||
    navigator.userAgent.includes("IEMobile") ||
    navigator.maxTouchPoints > 1
  );
}
