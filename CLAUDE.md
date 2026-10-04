@AGENTS.md

# Outreach Planner (demo edition): project conventions

## What this is

An outreach CRM (kanban) + daily planner. Next.js 16 App Router,
TypeScript, Tailwind v4. Demo edition: no backend and no login. All data
lives in the browser (localStorage), seeded with fictional sample data.

## Data

- `src/lib/demo/store.ts`: the localStorage document; `write()` mutates
  and persists, and `resetDemo()` restores the seed.
- `src/lib/demo/seed.ts`: fictional people and companies only. Never put
  real names, emails or profile URLs here (use `example.com`). Bump
  `VERSION` in `store.ts` when the seed or row shapes change.
- `src/lib/actions/*`: every write. Validate enums and required fields,
  then return `{ error }` like a server call would.
- Touch count / last touch are **derived** from touches
  (`boardContacts()`), never stored on the contact.
- Pages render a client loader (`BoardLoader`, `PlannerLoader`) that reads
  the store after hydration.

## Design system

- Source of truth: the `@theme` block of `src/app/globals.css`. The app
  is **dark-only**: `.glass` surfaces over the fixed `.app-beams` layer.
- **Tokens only.** Never use a raw hex, px size or new hue in a component.
  Tailwind's default palette and scales are cleared, so non-token
  utilities don't generate.
- Adjacent controls are exactly the same height (button next to input =
  h-10, next to a badge = h-8).
- A card's tint always matches its badge hue: blue = to contact,
  yellow = in progress, pink = replied, teal = won,
  red = rejected & ghosted, grey glass = everything else.
- Radii: badges/tabs/buttons/dropdowns/inputs 6, cards 10, dialogs 16.

## Patterns

- **Optimistic updates, no spinners.** Update state, call the action,
  revert + show a short danger notice on failure.
- Keyboard-first: new features get shortcuts and an entry in
  `src/components/shortcuts-dialog.tsx`.

## Commands

```bash
npm run dev / build / lint / typecheck / verify
```
