import { database } from "./database";
import { xPostingEnabled, xWriteConfigured } from "./x-publisher";
export async function schedulerStatus() {
  const { rows } = await database().query<{ last_seen: Date }>("SELECT last_seen FROM weekendcheck.worker_status WHERE id='x-scheduler'");
  const lastSeen = rows[0]?.last_seen.toISOString() || null;
  return { configured: xWriteConfigured(), enabled: xPostingEnabled(), running: Boolean(lastSeen && Date.parse(lastSeen) > Date.now() - 90000), lastSeen };
}
export async function schedulerHeartbeat() { await database().query("INSERT INTO weekendcheck.worker_status(id,last_seen) VALUES('x-scheduler',now()) ON CONFLICT(id) DO UPDATE SET last_seen=now()"); }
