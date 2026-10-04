"use client";

import { RotateCcw } from "lucide-react";

import { Button } from "@/components/ui/button";
import { resetDemo } from "@/lib/demo/store";

// Throws away this browser's edits and reloads the fictional seed data.
export function ResetDemoButton() {
  return (
    <Button
      type="button"
      variant="secondary"
      appearance="outline"
      size="sm"
      title="Discard your changes and restore the sample data"
      onClick={() => {
        if (!window.confirm("Reset the demo? Your changes in this browser will be lost."))
          return;
        resetDemo();
        window.location.reload();
      }}
    >
      <RotateCcw />
      <span className="max-sm:hidden">Reset demo</span>
    </Button>
  );
}
