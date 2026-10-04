"use client";

import type { Database } from "@/lib/database.types";
import { buildSeed } from "@/lib/demo/seed";

/*
 * The demo's "database": one JSON document in localStorage, per browser.
 *
 * Every visitor starts from the same fictional seed (see seed.ts), edits
 * stay on their own device, and "Reset demo" puts the seed back. Nothing
 * ever leaves the browser — there is no server, no account, no network.
 */

type Tables = Database["public"]["Tables"];
export type ContactRow = Tables["contacts"]["Row"];
export type TouchRow = Tables["touches"]["Row"];
export type BlockRow = Tables["time_blocks"]["Row"];
export type TaskRow = Tables["tasks"]["Row"];

export type DemoData = {
  version: number;
  contacts: ContactRow[];
  touches: TouchRow[];
  blocks: BlockRow[];
  tasks: TaskRow[];
};

// Bump when the seed or row shape changes; old saves are then replaced.
const VERSION = 1;
const KEY = "outreach-planner-demo";

export const DEMO_USER = "demo-user";

let cache: DemoData | null = null;

function read(): DemoData | null {
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as DemoData;
    return parsed.version === VERSION ? parsed : null;
  } catch {
    return null;
  }
}

function persist(data: DemoData) {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(data));
  } catch {
    // Private mode / full storage: the demo still works for this tab.
  }
}

export function db(): DemoData {
  if (cache) return cache;
  cache = read();
  if (!cache) {
    cache = { version: VERSION, ...buildSeed(new Date()) };
    persist(cache);
  }
  return cache;
}

// Apply a mutation and save. Throws propagate to the caller's error path.
export function write<T>(mutate: (data: DemoData) => T): T {
  const data = db();
  const result = mutate(data);
  persist(data);
  return result;
}

export function resetDemo() {
  try {
    window.localStorage.removeItem(KEY);
  } catch {
    // ignore
  }
  cache = null;
}

export function newId() {
  return crypto.randomUUID();
}

export function nowISO() {
  return new Date().toISOString();
}

// Actions are async like real network calls, so the optimistic UI paths
// stay exactly as they would be against a server.
export function settle<T>(value: T): Promise<T> {
  return Promise.resolve(value);
}

// A copy, so components never hold references into the store.
export function clone<T>(value: T): T {
  return structuredClone(value);
}
