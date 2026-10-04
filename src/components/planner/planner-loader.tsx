"use client";

import * as React from "react";

import { PlannerDay } from "@/components/planner/planner-day";
import { PlannerWeek } from "@/components/planner/planner-week";
import { plannerDay, plannerWeek } from "@/lib/demo/queries";
import { useHydrated } from "@/lib/demo/use-hydrated";

export function PlannerLoader({
  date,
  view,
}: {
  date: string;
  view: "day" | "week";
}) {
  const hydrated = useHydrated();
  const data = React.useMemo(() => {
    if (!hydrated) return null;
    return view === "week"
      ? { view, blocks: plannerWeek(date) }
      : { view, ...plannerDay(date) };
  }, [hydrated, date, view]);

  if (!data) return null;
  return data.view === "week" ? (
    <PlannerWeek date={date} blocks={data.blocks} />
  ) : (
    <PlannerDay
      date={date}
      initialBlocks={data.blocks}
      initialTasks={data.tasks}
    />
  );
}
