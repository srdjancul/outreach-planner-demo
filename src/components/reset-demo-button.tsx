"use client";

import { RotateCcw } from "lucide-react";
import { Dialog } from "radix-ui";

import { Button } from "@/components/ui/button";
import { resetDemo, startEmpty } from "@/lib/demo/store";

// Two ways out: wipe everything and start with an empty board, or bring
// back the fictional sample data. Either one discards this browser's edits.
export function ResetDemoButton() {
  function apply(reset: () => void) {
    reset();
    window.location.reload();
  }

  return (
    <Dialog.Root>
      <Dialog.Trigger asChild>
        <Button
          type="button"
          variant="secondary"
          appearance="outline"
          size="sm"
          title="Clear your data or restore the sample data"
        >
          <RotateCcw />
          <span className="max-sm:hidden">Reset</span>
        </Button>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-overlay data-[state=open]:animate-in data-[state=open]:fade-in-0" />
        <Dialog.Content className="glass fixed top-1/2 left-1/2 flex w-[calc(100%-32px)] max-w-panel -translate-x-1/2 -translate-y-1/2 flex-col gap-4 rounded-xl p-4 data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95">
          <Dialog.Title className="text-lg font-medium">Reset data</Dialog.Title>
          <Dialog.Description className="text-neutral-secondary">
            Everything you added or changed in this browser will be deleted.
            Start with an empty board for your own contacts, or bring back the
            sample data.
          </Dialog.Description>
          <div className="flex flex-wrap justify-end gap-2">
            <Dialog.Close asChild>
              <Button type="button" variant="ghost">
                Cancel
              </Button>
            </Dialog.Close>
            <Button
              type="button"
              variant="secondary"
              appearance="outline"
              onClick={() => apply(resetDemo)}
            >
              Restore sample data
            </Button>
            <Button
              type="button"
              variant="danger"
              onClick={() => apply(startEmpty)}
            >
              Start empty
            </Button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
