import { PlannerLoader } from "@/components/planner/planner-loader";
import { TopBar } from "@/components/top-bar";
import { resolvePlannerDate } from "@/lib/planner-constants";

export default async function PlannerPage(props: PageProps<"/planner">) {
  const searchParams = await props.searchParams;
  const requested =
    typeof searchParams.d === "string" ? searchParams.d : undefined;
  const date = resolvePlannerDate(requested);

  return (
    <div className="flex h-dvh flex-col">
      <TopBar active="planner" />
      <PlannerLoader
        date={date}
        view={searchParams.view === "week" ? "week" : "day"}
      />
    </div>
  );
}
