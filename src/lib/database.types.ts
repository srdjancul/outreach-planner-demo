// Row shapes for the demo's in-browser store. The layout mirrors a
// Postgres schema (`Database["public"]["Tables"][...]["Row"]`) so the app
// can be pointed at a real database later without touching components.

type Enums = {
  block_category: "research" | "client_work" | "internal";
  block_status: "planned" | "in_progress" | "done" | "skipped";
  contact_approach: "applied" | "direct";
  contact_niche: "web3" | "ai" | "saas" | "fintech" | "design" | "other";
  contact_status:
    | "to_contact"
    | "contacted"
    | "followed_up"
    | "replied"
    | "in_conversation"
    | "interview"
    | "won"
    | "rejected"
    | "ghosted";
  touch_channel: "email" | "linkedin" | "both";
  touch_direction: "sent" | "received";
};

export type Database = {
  public: {
    Tables: {
      contacts: {
        Row: {
          approach: Enums["contact_approach"];
          board_rank: number;
          company: string;
          company_note: string;
          created_at: string;
          first_name: string;
          id: string;
          last_name: string;
          niche: Enums["contact_niche"];
          note_at: string | null;
          position: string;
          source_url: string | null;
          status: Enums["contact_status"];
          updated_at: string;
          user_id: string;
        };
      };
      tasks: {
        Row: {
          block_id: string | null;
          created_at: string;
          date: string;
          done: boolean;
          id: string;
          rank: number;
          title: string;
          updated_at: string;
          user_id: string;
        };
      };
      time_blocks: {
        Row: {
          actual_seconds: number;
          category: Enums["block_category"];
          created_at: string;
          date: string;
          id: string;
          planned_minutes: number;
          started_at: string | null;
          status: Enums["block_status"];
          updated_at: string;
          user_id: string;
        };
      };
      touches: {
        Row: {
          channel: Enums["touch_channel"];
          contact_id: string;
          created_at: string;
          direction: Enums["touch_direction"];
          happened_at: string;
          id: string;
          note: string;
          user_id: string;
        };
      };
    };
    Enums: Enums;
  };
};
