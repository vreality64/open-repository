import { env, Uri } from "vscode";

export function openUrl(url: string) {
  return env.openExternal(Uri.parse(url));
}