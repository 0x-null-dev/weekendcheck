import path from "node:path";
import type { EditorialState } from "./editorial";
import { database, transaction } from "./database";

export const storageDirectory = () => process.env.WEEKENDCHECK_DATA_DIR || path.join(process.cwd(), ".weekendcheck");
export class RevisionConflict extends Error {
  constructor() { super("The data changed in another tab or the scheduler. Refresh the admin and try again."); }
}
export async function readState(): Promise<EditorialState> {
  const { rows } = await database().query<{ document: EditorialState }>("SELECT document FROM weekendcheck.workspace WHERE id = 1");
  if (!rows[0]) throw new Error("Database is not initialized. Run npm run db:migrate.");
  return rows[0].document;
}
export async function changeState<T>(revision: number | null, change: (state: EditorialState) => T): Promise<{ state: EditorialState; result: T }> {
  return transaction(async client => {
    const { rows } = await client.query<{ document: EditorialState; revision: number }>("SELECT document, revision FROM weekendcheck.workspace WHERE id = 1 FOR UPDATE");
    if (!rows[0]) throw new Error("Database is not initialized. Run npm run db:migrate.");
    if (revision !== null && rows[0].revision !== revision) throw new RevisionConflict();
    const state = rows[0].document;
    const result = change(state);
    state.revision++;
    await client.query("UPDATE weekendcheck.workspace SET document = $1::jsonb, revision = $2, updated_at = now() WHERE id = 1", [JSON.stringify(state), state.revision]);
    return { state, result };
  });
}
