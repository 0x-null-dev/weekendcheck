import { createHash, randomBytes, scrypt, timingSafeEqual } from "node:crypto";
import { database, transaction } from "./database";

export const SESSION_COOKIE = "wc_admin_session";
export const SESSION_SECONDS = 12 * 60 * 60;
const digest = (value: string) => createHash("sha256").update(value).digest("hex");
const derive = (password: string, salt: Buffer) => new Promise<Buffer>((resolve, reject) => scrypt(password, salt, 64, { N: 65536, r: 8, p: 2, maxmem: 128 * 1024 * 1024 }, (error, key) => error ? reject(error) : resolve(key)));
export async function hashPassword(password: string) {
  if (password.length < 12 || password.length > 256) throw new Error("Use an admin password between 12 and 256 characters.");
  const salt = randomBytes(16);
  return `scrypt-v1:${salt.toString("hex")}:${(await derive(password, salt)).toString("hex")}`;
}
export async function verifyPassword(password: string, stored: string) {
  if (password.length > 256 || !/^scrypt-v1:[a-f0-9]{32}:[a-f0-9]{128}$/.test(stored)) return false;
  const [,salt,key] = stored.split(":");
  return timingSafeEqual(await derive(password, Buffer.from(salt, "hex")), Buffer.from(key, "hex"));
}
export async function setAdminPassword(password: string, onlyIfMissing = false) {
  const hash = await hashPassword(password);
  await transaction(async client => {
    if (onlyIfMissing) await client.query("INSERT INTO weekendcheck.admin_account(id,password_hash) VALUES (1,$1) ON CONFLICT DO NOTHING", [hash]);
    else {
      await client.query("INSERT INTO weekendcheck.admin_account(id,password_hash) VALUES (1,$1) ON CONFLICT(id) DO UPDATE SET password_hash = EXCLUDED.password_hash, updated_at = now()", [hash]);
      await client.query("DELETE FROM weekendcheck.admin_sessions");
    }
  });
}
export class LoginRateLimited extends Error {}
export async function login(password: string): Promise<string | null> {
  // A shared single-admin limit cannot be bypassed by spoofed forwarding headers.
  const { rows: limits } = await database().query<{ attempts: number }>(`INSERT INTO weekendcheck.login_limits(id,attempts,resets_at) VALUES ('admin',1,now()+interval '15 minutes')
    ON CONFLICT(id) DO UPDATE SET attempts = CASE WHEN weekendcheck.login_limits.resets_at <= now() THEN 1 ELSE weekendcheck.login_limits.attempts + 1 END,
    resets_at = CASE WHEN weekendcheck.login_limits.resets_at <= now() THEN now()+interval '15 minutes' ELSE weekendcheck.login_limits.resets_at END RETURNING attempts`);
  if (limits[0].attempts > 10) throw new LoginRateLimited("Too many attempts. Try again in 15 minutes.");
  const { rows } = await database().query<{ password_hash: string }>("SELECT password_hash FROM weekendcheck.admin_account WHERE id = 1");
  if (!rows[0]) throw new Error("Admin login has not been configured.");
  if (!await verifyPassword(password, rows[0].password_hash)) return null;
  const token = randomBytes(32).toString("hex");
  await transaction(async client => {
    const current = await client.query<{ password_hash: string }>("SELECT password_hash FROM weekendcheck.admin_account WHERE id=1 FOR UPDATE");
    if (current.rows[0].password_hash !== rows[0].password_hash) throw new Error("Password changed. Sign in again.");
    await client.query("DELETE FROM weekendcheck.admin_sessions WHERE expires_at <= now()");
    await client.query("INSERT INTO weekendcheck.admin_sessions(token_hash,admin_id,expires_at) VALUES($1,1,now()+interval '12 hours')", [digest(token)]);
  });
  return token;
}
export async function validSession(token?: string) {
  if (!token || !/^[a-f0-9]{64}$/.test(token)) return false;
  const { rowCount } = await database().query("SELECT 1 FROM weekendcheck.admin_sessions WHERE token_hash=$1 AND expires_at>now()", [digest(token)]);
  return Boolean(rowCount);
}
export async function revokeSession(token?: string) {
  if (token) await database().query("DELETE FROM weekendcheck.admin_sessions WHERE token_hash=$1", [digest(token)]);
}
