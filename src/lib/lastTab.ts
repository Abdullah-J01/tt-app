import { deviceStorageKey } from "./storage";

const KEY = deviceStorageKey("lastTab");


export function setLastTab(path: string) {
  try {
    window.sessionStorage.setItem(KEY, path);
  } catch {
    /* storage unavailable (private mode) — feed back falls back to /explore */
  }
}

export function getLastTab(): string | null {
  try {
    return window.sessionStorage.getItem(KEY);
  } catch {
    return null;
  }
}
