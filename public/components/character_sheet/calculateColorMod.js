export default function calculateColorMod(current, mod, altColor) {
  let color = "inherit";
  if (altColor) color = altColor;
  if (current) {
    if (mod) {
      if (Math.sign(mod) === 1) {
        color = "var(--green)";
        return color;
      } else if (Math.sign(mod) === -1) {
        color = "var(--pink)";
        return color;
      }
    } else return color;
  }
}
