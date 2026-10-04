import { ensureDayBlocks } from "@/lib/actions/planner";
import type { BoardContact, ContactTouch } from "@/lib/contact-constants";
import { addDays, mondayOf } from "@/lib/planner-constants";
import { clone, db, write } from "@/lib/demo/store";

// contacts + derived touch stats — touch count and last touch are always
// computed from the touch log, never stored on the contact.
export function boardContacts(): BoardContact[] {
  const { contacts, touches } = db();
  const stats = new Map<string, { count: number; last: string | null }>();
  for (const t of touches) {
    const s = stats.get(t.contact_id) ?? { count: 0, last: null };
    s.count++;
    if (!s.last || t.happened_at > s.last) s.last = t.happened_at;
    stats.set(t.contact_id, s);
  }
  return contacts.map((c) => ({
    id: c.id,
    first_name: c.first_name,
    last_name: c.last_name,
    position: c.position,
    company: c.company,
    company_note: c.company_note,
    approach: c.approach,
    niche: c.niche,
    status: c.status,
    board_rank: c.board_rank,
    source_url: c.source_url,
    created_at: c.created_at,
    note_at: c.note_at,
    touch_count: stats.get(c.id)?.count ?? 0,
    last_touch_at: stats.get(c.id)?.last ?? null,
  }));
}

export function contactTouches(contactId: string): ContactTouch[] {
  return clone(
    db()
      .touches.filter((t) => t.contact_id === contactId)
      .sort((a, b) => b.happened_at.localeCompare(a.happened_at)),
  );
}

export function plannerDay(date: string) {
  return write((data) => {
    ensureDayBlocks(data, date);
    return {
      blocks: clone(data.blocks.filter((b) => b.date === date)),
      tasks: clone(
        data.tasks
          .filter((t) => t.date === date)
          .sort((a, b) => a.rank - b.rank),
      ),
    };
  });
}

// Mon–Sat of the week containing `date`, read-only.
export function plannerWeek(date: string) {
  const monday = mondayOf(date);
  const saturday = addDays(monday, 5);
  return clone(
    db().blocks.filter((b) => b.date >= monday && b.date <= saturday),
  );
}
