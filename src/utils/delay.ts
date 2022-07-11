import { Progress } from "vscode";

export function delay(ms: number) {
  return new Promise<void>(resolve => {
    setTimeout(resolve, ms);
  });
}

const SECOND = 1000;

export function withDelay(ms: number) {
  return async (progress: Progress<{ increment: number }>) => {
    const step = (SECOND / ms) * 100;
    let tick = step;

    const intervalId = setInterval(() => {
      progress.report({ increment: tick });

      tick += step;
    }, ms);

    await delay(ms);

    clearTimeout(intervalId);
  };
}