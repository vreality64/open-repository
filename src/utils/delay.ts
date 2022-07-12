import { Progress } from "vscode";

export function delay(ms: number) {
  return new Promise<void>(resolve => {
    setTimeout(resolve, ms);
  });
}

export function withDelay({ interval, timeout }: { interval: number; timeout: number }) {
  return async (progress: Progress<{ increment: number }>) => {
    const step = (interval / timeout) * 100;
    let tick = step;

    const intervalId = setInterval(() => {
      progress.report({ increment: tick });

      tick += step;
    }, interval);

    await delay(timeout);

    clearInterval(intervalId);
  };
}