import type { Database } from "@/lib/database.types";
import {
  addDays,
  BLOCK_CATEGORIES,
  mondayOf,
  resolvePlannerDate,
  toISODate,
} from "@/lib/planner-constants";

/*
 * Fictional seed data. Every person, company and note below is made up
 * for demonstration — any resemblance to real people or companies is
 * coincidental. Dates are generated relative to the first visit, so the
 * board and planner always look "lived in".
 */

type Tables = Database["public"]["Tables"];
type Enums = Database["public"]["Enums"];
type ContactRow = Tables["contacts"]["Row"];
type TouchRow = Tables["touches"]["Row"];
type BlockRow = Tables["time_blocks"]["Row"];
type TaskRow = Tables["tasks"]["Row"];

const USER = "demo-user";
const DAY_MS = 24 * 60 * 60 * 1000;

// Deterministic PRNG so every visitor gets the same demo.
function mulberry32(seed: number) {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const COMPANIES: { name: string; niche: Enums["contact_niche"] }[] = [
  { name: "Brightmoor AI", niche: "ai" },
  { name: "Cortexa Labs", niche: "ai" },
  { name: "Neuralpine", niche: "ai" },
  { name: "Promptwell", niche: "ai" },
  { name: "Quillstack", niche: "saas" },
  { name: "Parcelwave", niche: "saas" },
  { name: "Tidelist", niche: "saas" },
  { name: "Orbitdesk", niche: "saas" },
  { name: "Workloom", niche: "saas" },
  { name: "Ferrous Pay", niche: "fintech" },
  { name: "Mintgrove", niche: "fintech" },
  { name: "Coinvale", niche: "fintech" },
  { name: "Tallyport", niche: "fintech" },
  { name: "Ledgerleaf", niche: "web3" },
  { name: "Blockharbor", niche: "web3" },
  { name: "Chainmoss", niche: "web3" },
  { name: "Hollowpine Studio", niche: "design" },
  { name: "Pixelmoor", niche: "design" },
  { name: "Fernweh Design Co.", niche: "design" },
  { name: "Kitefin Health", niche: "other" },
  { name: "Driftwood Media", niche: "other" },
  { name: "Saltmarsh Travel", niche: "other" },
];

const FIRST = [
  "Avery", "Jonah", "Mila", "Theo", "Priya", "Lucas", "Noor", "Elena",
  "Kai", "Sofia", "Marcus", "Hana", "Oliver", "Zara", "Felix", "Ines",
  "Ravi", "Clara", "Mateo", "Aisha", "Leo", "Freya", "Tomas", "Yuki",
  "Daniel", "Amara", "Hugo", "Lena", "Omar", "Ruby", "Nils", "Camila",
];

const LAST = [
  "Hartwell", "Okafor", "Lindqvist", "Moreau", "Castellano", "Brennan",
  "Novak", "Achebe", "Takeda", "Whitlock", "Rasmussen", "Delacroix",
  "Fairbanks", "Iyer", "Kowalczyk", "Marlowe", "Petrov", "Quintero",
  "Ashby", "Vance", "Sorensen", "Halloran", "Mbeki", "Ellery",
  "Abernathy", "Bianchi", "Calloway", "Dumont", "Esposito", "Falk",
  "Grimaldi", "Haddad", "Ivanova", "Jansen", "Kincaid", "Laurent",
  "Mercer", "Nakamura", "Ostrander", "Pellegrini", "Rourke", "Sato",
  "Thorne", "Underwood", "Valdez", "Wexley", "Yilmaz", "Zielinski",
  "Brightwater", "Carver", "Drummond", "Easton", "Fontaine", "Galloway",
  "Holt", "Ingram", "Keller", "Lomax", "Moss", "Navarro",
  "Oakley", "Prescott", "Reyes", "Sinclair", "Tanaka", "Voss",
  "Winslow", "Archer", "Bishop", "Crane",
];

const POSITIONS_DIRECT = [
  "Head of Design", "Design Lead", "Founder", "CTO", "VP Product",
  "Creative Director", "Engineering Manager", "CEO", "Product Lead",
];
const POSITIONS_APPLIED = [
  "Recruiter", "Talent Partner", "HR Manager", "Hiring Manager",
  "Talent Acquisition Lead",
];

// [status, approach] — the shape of the pipeline.
const PIPELINE: [Enums["contact_status"], Enums["contact_approach"], number][] =
  [
    ["to_contact", "direct", 9],
    ["contacted", "direct", 8],
    ["followed_up", "direct", 6],
    ["replied", "direct", 4],
    ["in_conversation", "direct", 4],
    ["interview", "direct", 2],
    ["won", "direct", 1],
    ["to_contact", "applied", 4],
    ["contacted", "applied", 6],
    ["followed_up", "applied", 4],
    ["replied", "applied", 3],
    ["interview", "applied", 3],
    ["won", "applied", 1],
    ["rejected", "applied", 4],
    ["rejected", "direct", 2],
    ["ghosted", "direct", 4],
    ["ghosted", "applied", 3],
  ];

// Touch history per status: d = sent, r = received, oldest first.
const HISTORY: Record<Enums["contact_status"], string> = {
  to_contact: "",
  contacted: "d",
  followed_up: "dd",
  replied: "ddr",
  in_conversation: "drdr",
  interview: "drdrr",
  won: "drdrdr",
  rejected: "ddr",
  ghosted: "ddd",
};

// The first message, by approach; later sent touches are follow-ups.
const FIRST_NOTES: Record<Enums["contact_approach"], string[]> = {
  direct: [
    "Intro message, mentioned their recent product launch",
    "Cold intro with portfolio link",
    "Connected and sent a short intro note",
  ],
  applied: [
    "Sent application with a short cover note",
    "Applied via the careers page, CV + portfolio",
  ],
};
const FOLLOW_UP_NOTES = [
  "Short follow-up: asked if the role is still open",
  "Shared two relevant case studies",
  "Thank-you note after the call",
  "Sent availability for next week",
  "Shared a quick teardown of their onboarding flow",
  "",
];
const RECEIVED_NOTES: Partial<Record<Enums["contact_status"], string[]>> = {
  replied: [
    "Replied: happy to chat next week",
    "Asked for a few more work samples",
    "Forwarded my profile to the design lead",
  ],
  in_conversation: [
    "Call booked for Thursday, 30 min",
    "Discussed team structure and roadmap",
    "Asked about notice period and rates",
  ],
  interview: [
    "Interview scheduled with the product team",
    "Sent the take-home brief, due Friday",
    "Second round confirmed",
  ],
  won: [
    "Offer received, starting next month",
    "Signed the contract",
  ],
  rejected: [
    "Position filled internally, keep in touch",
    "Went with a more senior candidate",
    "Role put on hold until next quarter",
  ],
};

const COMPANY_NOTES = [
  "Series A, ~40 people, hiring two product designers",
  "Remote-first, EU hours. Strong design culture",
  "Just raised a seed round; small founding team",
  "Uses Figma + a mature design system, wants someone to own it",
  "Met at a meetup in the spring, warm intro",
  "Mobile app redesign planned for Q1",
  "Contract-to-hire possible",
  "Portfolio feedback: show more research work",
];

function slug(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function atHour(base: Date, hour: number, minute: number) {
  const d = new Date(base);
  d.setHours(hour, minute, 0, 0);
  return d;
}

export function buildSeed(now: Date) {
  const rand = mulberry32(20261004);
  const pick = <T>(list: readonly T[]) => list[Math.floor(rand() * list.length)];
  const between = (min: number, max: number) =>
    min + Math.floor(rand() * (max - min + 1));
  const id = () => crypto.randomUUID();

  const contacts: ContactRow[] = [];
  const touches: TouchRow[] = [];
  const usedLast = new Set<string>();

  let rank = 1;
  for (const [status, approach, count] of PIPELINE) {
    for (let i = 0; i < count; i++) {
      // Every last name at most once; first names may repeat.
      const first = pick(FIRST);
      let last = pick(LAST);
      while (usedLast.has(last)) last = pick(LAST);
      usedLast.add(last);

      const company = pick(COMPANIES);
      const position =
        approach === "applied" ? pick(POSITIONS_APPLIED) : pick(POSITIONS_DIRECT);
      const contactId = id();

      // Walk back from the latest touch so the history reads in order.
      const history = HISTORY[status];
      const lastDaysAgo =
        status === "ghosted"
          ? between(16, 40)
          : status === "rejected"
            ? between(5, 30)
            : status === "won"
              ? between(2, 12)
              : between(0, 18);
      let daysAgo = lastDaysAgo + (history.length - 1) * between(2, 5);
      const createdAt = new Date(now.getTime() - (daysAgo + between(1, 6)) * DAY_MS);

      for (let t = 0; t < history.length; t++) {
        const received = history[t] === "r";
        let when = atHour(
          new Date(now.getTime() - daysAgo * DAY_MS),
          between(9, 17),
          between(0, 59),
        );
        if (when.getTime() > now.getTime())
          when = new Date(now.getTime() - between(1, 4) * 60 * 60 * 1000);
        const receivedNotes = RECEIVED_NOTES[status] ?? RECEIVED_NOTES.replied!;
        touches.push({
          id: id(),
          user_id: USER,
          contact_id: contactId,
          happened_at: when.toISOString(),
          channel: pick(["email", "linkedin", "linkedin", "both"] as const),
          direction: received ? "received" : "sent",
          note:
            received && t === history.length - 1
              ? pick(receivedNotes)
              : received
                ? pick(RECEIVED_NOTES.replied!)
                : t === 0
                  ? pick(FIRST_NOTES[approach])
                  : pick(FOLLOW_UP_NOTES),
          created_at: when.toISOString(),
        });
        daysAgo -= between(2, 5);
        if (daysAgo < lastDaysAgo) daysAgo = lastDaysAgo;
      }

      const hasNote = rand() < 0.35;
      contacts.push({
        id: contactId,
        user_id: USER,
        first_name: first,
        last_name: last,
        position,
        company: company.name,
        company_note: hasNote ? pick(COMPANY_NOTES) : "",
        note_at: hasNote
          ? new Date(now.getTime() - between(1, 25) * DAY_MS).toISOString()
          : null,
        approach,
        niche: company.niche,
        status,
        board_rank: rank++,
        source_url:
          approach === "applied"
            ? `https://example.com/jobs/${slug(company.name)}-${slug(position)}`
            : rand() < 0.6
              ? `https://example.com/in/${slug(`${first} ${last}`)}`
              : null,
        created_at: createdAt.toISOString(),
        updated_at: createdAt.toISOString(),
      });
    }
  }

  const { blocks, tasks } = seedPlanner(now, rand, between, pick, id);
  return { contacts, touches, blocks, tasks };
}

const TASKS: Record<Enums["block_category"], string[]> = {
  research: [
    "Review 10 new job posts",
    "Shortlist SaaS companies hiring designers",
    "Read Brightmoor AI's product blog",
    "Find hiring managers at Quillstack",
    "Update the target company list",
    "Research Mintgrove's design team",
  ],
  client_work: [
    "Landing page wireframes for Kitefin Health",
    "Design review with the Tidelist team",
    "Export icon set v2",
    "Onboarding flow, high-fidelity screens",
    "Client feedback round on the dashboard",
    "Prepare developer handoff specs",
  ],
  internal: [
    "Update portfolio case study",
    "Write weekly outreach recap",
    "Refresh CV layout",
    "Clean up Figma components",
    "Plan next week's outreach",
  ],
};

const DAY_TASKS = [
  "Reply to recruiter emails",
  "Book dentist appointment",
  "Send invoice for September",
  "Prepare questions for Thursday's interview",
];

function seedPlanner(
  now: Date,
  rand: () => number,
  between: (min: number, max: number) => number,
  pick: <T>(list: readonly T[]) => T,
  id: () => string,
) {
  const blocks: BlockRow[] = [];
  const tasks: TaskRow[] = [];
  const today = toISODate(now);
  const plannerDay = resolvePlannerDate(today);
  // Last week, plus this (planner) week.
  const start = addDays(mondayOf(plannerDay), -7);
  const stamp = now.toISOString();

  for (let i = 0; i < 13; i++) {
    const date = addDays(start, i);
    if (new Date(`${date}T12:00:00`).getDay() === 0) continue;
    const past = date < today;
    const isToday = date === today;
    let taskRank = 1;

    for (const category of BLOCK_CATEGORIES) {
      const blockId = id();
      const planned = category.plannedMinutes * 60;
      const actual = past
        ? Math.round(planned * (0.7 + rand() * 0.45))
        : isToday && category.key === "research"
          ? between(35, 70) * 60
          : 0;
      blocks.push({
        id: blockId,
        user_id: USER,
        date,
        category: category.key,
        planned_minutes: category.plannedMinutes,
        actual_seconds: actual,
        started_at: null,
        status: past
          ? rand() < 0.85
            ? "done"
            : "in_progress"
          : actual > 0
            ? "in_progress"
            : "planned",
        created_at: stamp,
        updated_at: stamp,
      });

      const count = between(1, 3);
      const titles = new Set<string>();
      while (titles.size < count) titles.add(pick(TASKS[category.key]));
      let n = 0;
      for (const title of titles) {
        tasks.push({
          id: id(),
          user_id: USER,
          date,
          block_id: blockId,
          title,
          done: past ? rand() < 0.9 : isToday && category.key === "research" && n === 0,
          rank: taskRank++,
          created_at: stamp,
          updated_at: stamp,
        });
        n++;
      }
    }

    if (rand() < 0.6 || isToday) {
      tasks.push({
        id: id(),
        user_id: USER,
        date,
        block_id: null,
        title: pick(DAY_TASKS),
        done: past,
        rank: taskRank++,
        created_at: stamp,
        updated_at: stamp,
      });
    }
  }

  return { blocks, tasks };
}
