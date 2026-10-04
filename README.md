# Outreach Planner

An outreach CRM (kanban) and a daily time-blocking planner in one dark,
keyboard-first app. Built with Next.js 16, TypeScript, Tailwind CSS v4,
Radix and dnd-kit.

**This is the demo edition.** It runs entirely in your browser. There's
no account, no backend and no database to set up. It ships with
**fictional sample data**: every person, company and note is made up.
Your edits are saved in your browser's localStorage, and **Reset demo** in
the top bar restores the sample data.

## Features

**Outreach board**: a kanban pipeline for the people you're reaching out to.

- Nine stages: To contact → Contacted → Followed up → Replied →
  In conversation → Interview → Won / Rejected / Ghosted
- Three groups: Direct contact, Applied, and Rejected & Ghosted, each with
  a "View all" page, niche filters and pagination
- Drag and drop between and within groups (mouse and touch)
- Every card shows its touch count and days since the last activity. Both
  are derived from the touch log and never stored (yellow at 7+ days, red
  at 14+)
- Contact panel: full touch timeline, log or delete touches, edit, delete
- Ranked search: first-name matches first, then last names, then companies
- Quick add with `C`. Logging a touch on a *To contact* person moves them
  to *Contacted* automatically

**Daily planner**: Monday to Saturday, three blocks per day: research
(2h), client work (6h) and internal projects (2h).

- Start/stop timer per block, and starting one stops the running one
- Edit the planned hours per day, and fix tracked time by hand while the
  timer is stopped
- Tasks per block, plus unattached day tasks
- Week view: actual vs planned per category, per day and in total

Every change is optimistic: the UI updates instantly, and it reverts with
a notice if the change fails.

## Keyboard

Press `?` in the app for the full list. The main ones: `C` adds a new
contact, `/` searches, arrows move between cards, `Ctrl+arrows` moves a
card, `Enter` opens a contact, `T` jumps to the log-touch form.

## Run it locally

Requires Node.js 20+.

```bash
git clone https://github.com/srdjancul/outreach-planner-demo.git
cd outreach-planner-demo
npm install
npm run dev        # http://localhost:3200
```

## Deploy your own

Import the repo in [Vercel](https://vercel.com/new) and accept the
defaults. No environment variables are needed.

## How the data works

| File | Role |
| --- | --- |
| `src/lib/demo/seed.ts` | The fictional sample data. Edit it to change what a fresh visitor sees |
| `src/lib/demo/store.ts` | A tiny localStorage "database" (one JSON document) |
| `src/lib/demo/queries.ts` | Reads, including derived touch stats |
| `src/lib/actions/*.ts` | Writes, validated and async like real server calls |
| `src/lib/database.types.ts` | Row types, shaped like a Postgres schema |

The components only talk to `src/lib/actions` and `src/lib/demo/queries`,
so you can swap in a real backend (Supabase, Postgres, an API) by
replacing those files.

To change the sample data, edit `seed.ts` and bump `VERSION` in
`store.ts`, so existing browsers pick up the new seed.

## Design

Every token (colors, type scale, spacing, radii, glass surfaces) lives in
the `@theme` block of `src/app/globals.css`. Tailwind's default palette
is cleared, so components can only use those tokens. The typeface is
Hanken Grotesk.

## Scripts

```bash
npm run dev          # dev server on :3200
npm run build        # production build
npm run lint         # eslint
npm run typecheck    # route typegen + tsc
npm run verify       # all of the above
```

## License

MIT, see [LICENSE](LICENSE).
