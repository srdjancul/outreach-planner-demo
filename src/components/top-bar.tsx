import Image from "next/image";
import Link from "next/link";

import { ResetDemoButton } from "@/components/reset-demo-button";
import { ShortcutsDialog } from "@/components/shortcuts-dialog";
import { cn } from "@/lib/utils";

const tabs = [
  { href: "/", key: "outreach", label: "Outreach" },
  { href: "/planner", key: "planner", label: "Planner" },
] as const;

export function TopBar({ active }: { active: (typeof tabs)[number]["key"] }) {
  return (
    <header className="shrink-0 border-b border-neutral-secondary">
      {/* Three equal zones (1fr | auto | 1fr) keep the tabs mathematically
          centered no matter how wide the logo or the right controls are. */}
      <div className="mx-auto grid w-full max-w-page grid-cols-[1fr_auto_1fr] items-center px-4 py-3 sm:px-8">
        <Link
          href="/"
          className="justify-self-start rounded-sm outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
        >
          {/* Wordmark, 16px tall. Replace public/logo-white.png with your
              own logo (keep width/height in sync with the file). */}
          <Image
            src="/logo-white.png"
            alt="SERG"
            width={2328}
            height={444}
            priority
            className="h-logo w-auto"
          />
        </Link>

        <nav className="flex items-center gap-hairline justify-self-center">
          {tabs.map((tab) => (
            <Link
              key={tab.key}
              href={tab.href}
              aria-current={active === tab.key ? "page" : undefined}
              className={cn(
                "inline-flex h-8 items-center rounded-base px-3 outline-none transition-colors",
                "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand",
                active === tab.key
                  ? "bg-neutral-inverse font-medium text-neutral-inverse"
                  : "text-neutral-secondary hover:text-neutral-primary",
              )}
            >
              {tab.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-1 justify-self-end">
          <ShortcutsDialog />
          <ResetDemoButton />
        </div>
      </div>
    </header>
  );
}
