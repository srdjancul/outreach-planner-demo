import {
  TOUCH_CHANNELS,
  TOUCH_DIRECTIONS,
  type ContactTouch,
  type TouchChannel,
  type TouchDirection,
} from "@/lib/contact-constants";
import { clone, DEMO_USER, newId, nowISO, settle, write } from "@/lib/demo/store";

export type TouchInput = {
  happened_at: string;
  channel: TouchChannel;
  direction: TouchDirection;
  note: string;
};

export async function createTouch(
  contactId: string,
  input: TouchInput,
  // Logging a touch on someone still in "to_contact" moves them to
  // "contacted" automatically.
  moveToContacted: boolean,
): Promise<{ touch: ContactTouch | null; error: string | null }> {
  if (
    !TOUCH_CHANNELS.includes(input.channel) ||
    !TOUCH_DIRECTIONS.includes(input.direction) ||
    Number.isNaN(Date.parse(input.happened_at))
  ) {
    return { touch: null, error: "Invalid touch." };
  }

  return settle(
    write((data) => {
      const touch: ContactTouch = {
        id: newId(),
        user_id: DEMO_USER,
        contact_id: contactId,
        created_at: nowISO(),
        ...input,
      };
      data.touches.push(touch);
      if (moveToContacted) {
        const contact = data.contacts.find((c) => c.id === contactId);
        if (contact?.status === "to_contact") contact.status = "contacted";
      }
      return { touch: clone(touch), error: null };
    }),
  );
}

export async function deleteTouch(
  id: string,
): Promise<{ error: string | null }> {
  return settle(
    write((data) => {
      data.touches = data.touches.filter((t) => t.id !== id);
      return { error: null };
    }),
  );
}
