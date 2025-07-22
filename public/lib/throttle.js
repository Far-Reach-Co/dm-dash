export default function throttle(fn, wait) {
  let lastCall = 0;

  return function (...args) {
    const now = Date.now();

    if (now - lastCall >= wait) {
      lastCall = now;
      fn.apply(this, args);
    }
  };
}
