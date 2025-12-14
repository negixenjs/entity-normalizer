export function throttleByTime<T extends (...args: any[]) => void>(
  fn: T,
  interval: number,
) {
  let lastRun = 0;

  return (...args: Parameters<T>) => {
    const now = Date.now();

    if (now - lastRun >= interval) {
      lastRun = now;
      fn(...args);
    }
  };
}
