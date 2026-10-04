import {
  BLOCK_CATEGORIES,
  type PlannerTask,
  type TimeBlock,
} from "@/lib/planner-constants";
import {
  clone,
  DEMO_USER,
  newId,
  nowISO,
  settle,
  write,
  type DemoData,
} from "@/lib/demo/store";

// Every block mutation returns the day's fresh rows so the client can
// reconcile its optimistic state.
export type BlocksResult = { blocks: TimeBlock[] | null; error: string | null };

function dayBlocks(data: DemoData, date: string): BlocksResult {
  return {
    blocks: clone(data.blocks.filter((b) => b.date === date)),
    error: null,
  };
}

// Bank a running timer's elapsed time and clear it.
function bank(block: TimeBlock) {
  if (!block.started_at) return;
  const elapsed = (Date.now() - Date.parse(block.started_at)) / 1000;
  block.actual_seconds = Math.round(block.actual_seconds + Math.max(0, elapsed));
  block.started_at = null;
  block.updated_at = nowISO();
}

// The three fixed blocks exist from the first visit to a day.
export function ensureDayBlocks(data: DemoData, date: string) {
  for (const c of BLOCK_CATEGORIES) {
    if (data.blocks.some((b) => b.date === date && b.category === c.key))
      continue;
    const stamp = nowISO();
    data.blocks.push({
      id: newId(),
      user_id: DEMO_USER,
      date,
      category: c.key,
      planned_minutes: c.plannedMinutes,
      actual_seconds: 0,
      started_at: null,
      status: "planned",
      created_at: stamp,
      updated_at: stamp,
    });
  }
}

function withBlock(
  id: string,
  date: string,
  error: string,
  change: (block: TimeBlock, data: DemoData) => string | void,
): Promise<BlocksResult> {
  return settle(
    write((data) => {
      const block = data.blocks.find((b) => b.id === id);
      if (!block) return { blocks: null, error };
      const refused = change(block, data);
      if (refused) return { blocks: null, error: refused };
      block.updated_at = nowISO();
      return dayBlocks(data, date);
    }),
  );
}

// Starting one timer stops whichever one runs — only one at a time.
export async function startBlock(id: string, date: string) {
  return withBlock(id, date, "Could not start the timer.", (block, data) => {
    data.blocks.forEach(bank);
    if (block.status === "done") return;
    block.started_at = nowISO();
    block.status = "in_progress";
  });
}

export async function stopBlock(id: string, date: string) {
  return withBlock(id, date, "Could not stop the timer.", bank);
}

// Planned hours are per day and per block.
export async function setBlockPlannedMinutes(
  id: string,
  date: string,
  plannedMinutes: number,
): Promise<BlocksResult> {
  if (
    !Number.isFinite(plannedMinutes) ||
    plannedMinutes < 0 ||
    plannedMinutes > 24 * 60
  ) {
    return { blocks: null, error: "Planned hours must be between 0 and 24." };
  }
  return withBlock(id, date, "Could not save the planned hours.", (block) => {
    block.planned_minutes = Math.round(plannedMinutes);
  });
}

// Fix tracked time by hand when the timer was forgotten — only while the
// block's timer is stopped, so a live timer is never overwritten.
export async function setBlockActualSeconds(
  id: string,
  date: string,
  actualSeconds: number,
): Promise<BlocksResult> {
  if (
    !Number.isInteger(actualSeconds) ||
    actualSeconds < 0 ||
    actualSeconds > 24 * 3600
  ) {
    return { blocks: null, error: "Tracked time must be 0–24 hours." };
  }
  return withBlock(id, date, "Could not update the tracked time.", (block) => {
    if (block.started_at) return "Stop the timer before editing the time.";
    block.actual_seconds = actualSeconds;
    // Done stays done; otherwise the status follows the time.
    if (block.status !== "done")
      block.status = actualSeconds > 0 ? "in_progress" : "planned";
  });
}

export async function setBlockDone(
  id: string,
  date: string,
  done: boolean,
): Promise<BlocksResult> {
  return withBlock(id, date, "Could not update the block.", (block) => {
    if (done) bank(block);
    block.status = done
      ? "done"
      : block.actual_seconds > 0
        ? "in_progress"
        : "planned";
  });
}

// --- Tasks -----------------------------------------------------------------

export async function createTask(
  date: string,
  blockId: string | null,
  title: string,
): Promise<{ task: PlannerTask | null; error: string | null }> {
  const trimmed = title.trim();
  if (!trimmed) return { task: null, error: "Task title is required." };

  return settle(
    write((data) => {
      const stamp = nowISO();
      const rank =
        Math.max(0, ...data.tasks.filter((t) => t.date === date).map((t) => t.rank)) + 1;
      const task: PlannerTask = {
        id: newId(),
        user_id: DEMO_USER,
        date,
        block_id: blockId,
        title: trimmed,
        done: false,
        rank,
        created_at: stamp,
        updated_at: stamp,
      };
      data.tasks.push(task);
      return { task: clone(task), error: null };
    }),
  );
}

function withTask(
  id: string,
  error: string,
  change: (task: PlannerTask) => void,
): Promise<{ error: string | null }> {
  return settle(
    write((data) => {
      const task = data.tasks.find((t) => t.id === id);
      if (!task) return { error };
      change(task);
      task.updated_at = nowISO();
      return { error: null };
    }),
  );
}

export async function setTaskDone(id: string, done: boolean) {
  return withTask(id, "Could not update the task.", (task) => {
    task.done = done;
  });
}

export async function renameTask(
  id: string,
  title: string,
): Promise<{ error: string | null }> {
  const trimmed = title.trim();
  if (!trimmed) return { error: "Task title is required." };
  return withTask(id, "Could not rename the task.", (task) => {
    task.title = trimmed;
  });
}

export async function deleteTask(
  id: string,
): Promise<{ error: string | null }> {
  return settle(
    write((data) => {
      data.tasks = data.tasks.filter((t) => t.id !== id);
      return { error: null };
    }),
  );
}
