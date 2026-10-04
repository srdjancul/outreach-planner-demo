"use client";

import * as React from "react";

import { Board } from "@/components/board/board";
import { boardContacts } from "@/lib/demo/queries";
import { useHydrated } from "@/lib/demo/use-hydrated";

export function BoardLoader() {
  const hydrated = useHydrated();
  const contacts = React.useMemo(
    () => (hydrated ? boardContacts() : null),
    [hydrated],
  );
  if (!contacts) return null;
  return <Board contacts={contacts} />;
}
