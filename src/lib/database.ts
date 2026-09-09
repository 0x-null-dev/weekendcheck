import { Pool, type PoolClient } from "pg";

const globalDatabase = globalThis as unknown as { weekendcheckPool?: Pool; weekendcheckDatabaseUrl?: string };
export function database() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) throw new Error("DATABASE_URL is required. Configure Postgres and run npm run db:migrate.");
  if (globalDatabase.weekendcheckPool && globalDatabase.weekendcheckDatabaseUrl !== connectionString) throw new Error("Close the database before changing its connection.");
  if (!globalDatabase.weekendcheckPool) {
    const url = new URL(connectionString);
    if (!["postgres:", "postgresql:"].includes(url.protocol)) throw new Error("DATABASE_URL must be a Postgres connection string.");
    const local = ["localhost", "127.0.0.1", "[::1]", "db"].includes(url.hostname);
    for (const key of ["sslmode", "sslcert", "sslkey", "sslrootcert"]) url.searchParams.delete(key);
    const pool = new Pool({ connectionString: url.toString(), max: 5, idleTimeoutMillis: 20000, connectionTimeoutMillis: 10000, ssl: local ? undefined : { rejectUnauthorized: true, ...(process.env.DATABASE_SSL_CA ? { ca: process.env.DATABASE_SSL_CA.replace(/\\n/g, "\n") } : {}) }, application_name: "weekendcheck" });
    pool.on("error", () => console.error("Postgres connection interrupted."));
    globalDatabase.weekendcheckPool = pool; globalDatabase.weekendcheckDatabaseUrl = connectionString;
  }
  return globalDatabase.weekendcheckPool;
}
export async function transaction<T>(work: (client: PoolClient) => Promise<T>): Promise<T> {
  const client = await database().connect();
  try {
    await client.query("BEGIN");
    await client.query("SET LOCAL lock_timeout = '10s'");
    await client.query("SET LOCAL statement_timeout = '30s'");
    const result = await work(client);
    await client.query("COMMIT"); return result;
  } catch (error) { await client.query("ROLLBACK").catch(() => {}); throw error; }
  finally { client.release(); }
}
export async function closeDatabase() {
  await globalDatabase.weekendcheckPool?.end();
  delete globalDatabase.weekendcheckPool; delete globalDatabase.weekendcheckDatabaseUrl;
}
