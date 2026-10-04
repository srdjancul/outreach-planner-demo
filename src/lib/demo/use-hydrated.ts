"use client";

import { useSyncExternalStore } from "react";

const subscribe = () => () => {};

// False during the server render and hydration, true after — the demo's
// data lives in localStorage, which only exists in the browser.
export function useHydrated() {
  return useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );
}
