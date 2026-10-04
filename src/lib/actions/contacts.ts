import {
  APPROACHES,
  CONTACT_STATUSES,
  NICHES,
  type ContactFields,
  type ContactStatus,
} from "@/lib/contact-constants";
import {
  clone,
  DEMO_USER,
  newId,
  nowISO,
  settle,
  write,
  type ContactRow,
} from "@/lib/demo/store";

export type ActionResult = { error: string | null };

function invalidFields(fields: ContactFields): string | null {
  if (!fields.first_name.trim()) return "First name is required.";
  if (!APPROACHES.includes(fields.approach)) return "Invalid approach.";
  if (!NICHES.includes(fields.niche)) return "Invalid niche.";
  return null;
}

// The note counts as activity: stamp it whenever it is written or changed.
function noteStamp(row: ContactRow | null, note: string): string | null {
  if (!row) return note ? nowISO() : null;
  if (note !== row.company_note && note) return nowISO();
  return row.note_at;
}

// Persist a card placement: any of status, approach and board_rank.
// Dragging between board groups changes approach and/or status; the
// panel's status select changes status alone.
export async function placeContact(
  id: string,
  patch: {
    status?: ContactStatus;
    approach?: (typeof APPROACHES)[number];
    boardRank?: number;
  },
): Promise<ActionResult> {
  if (patch.status !== undefined && !CONTACT_STATUSES.includes(patch.status))
    return { error: "Invalid status." };
  if (patch.approach !== undefined && !APPROACHES.includes(patch.approach))
    return { error: "Invalid approach." };
  if (patch.boardRank !== undefined && !Number.isFinite(patch.boardRank))
    return { error: "Invalid move." };

  return settle(
    write((data) => {
      const row = data.contacts.find((c) => c.id === id);
      if (!row) return { error: "Move failed — put back." };
      if (patch.status !== undefined) row.status = patch.status;
      if (patch.approach !== undefined) row.approach = patch.approach;
      if (patch.boardRank !== undefined) row.board_rank = patch.boardRank;
      row.updated_at = nowISO();
      return { error: null };
    }),
  );
}

export async function createContact(
  fields: ContactFields,
  boardRank: number,
): Promise<{ contact: ContactRow | null; error: string | null }> {
  const invalid = invalidFields(fields);
  if (invalid || !Number.isFinite(boardRank)) {
    return { contact: null, error: invalid ?? "Invalid contact." };
  }

  return settle(
    write((data) => {
      const stamp = nowISO();
      const row: ContactRow = {
        ...fields,
        id: newId(),
        user_id: DEMO_USER,
        status: "to_contact",
        board_rank: boardRank,
        note_at: noteStamp(null, fields.company_note),
        created_at: stamp,
        updated_at: stamp,
      };
      data.contacts.push(row);
      return { contact: clone(row), error: null };
    }),
  );
}

export async function updateContact(
  id: string,
  fields: ContactFields,
): Promise<ActionResult> {
  const invalid = invalidFields(fields);
  if (invalid) return { error: invalid };

  return settle(
    write((data) => {
      const row = data.contacts.find((c) => c.id === id);
      if (!row) return { error: "Could not save the changes." };
      const note_at = noteStamp(row, fields.company_note);
      Object.assign(row, fields, { note_at, updated_at: nowISO() });
      return { error: null };
    }),
  );
}

// Deletes the contact and its touches.
export async function deleteContact(id: string): Promise<ActionResult> {
  return settle(
    write((data) => {
      data.contacts = data.contacts.filter((c) => c.id !== id);
      data.touches = data.touches.filter((t) => t.contact_id !== id);
      return { error: null };
    }),
  );
}
