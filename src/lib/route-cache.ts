"use client";

import * as React from "react";
import { useRouter } from "next/navigation";

/*
 * Instant page switches. In the demo every page renders from in-browser
 * data, so prefetching the route shell is all a click needs.
 */

// Kept as the single seam every write goes through — a server-backed
// build would invalidate prefetched snapshots here.
export async function trackWrite<T>(write: Promise<T>): Promise<T> {
  return write;
}

export function useWarmRoutes(hrefs: string[]) {
  const router = useRouter();
  // Effect deps want a stable primitive, not a fresh array each render.
  const key = hrefs.join("\n");

  React.useEffect(() => {
    key.split("\n").forEach((href) => router.prefetch(href));
  }, [router, key]);
}
