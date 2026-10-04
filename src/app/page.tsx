import { Suspense } from "react";

import { BoardLoader } from "@/components/board/board-loader";
import { TopBar } from "@/components/top-bar";

export default function OutreachPage() {
  return (
    <div className="flex h-dvh flex-col">
      <TopBar active="outreach" />
      {/* The board reads its view (?g, ?n, ?p) from the URL. */}
      <Suspense>
        <BoardLoader />
      </Suspense>
    </div>
  );
}
