import { readState } from "@/lib/editorial-store";
import { requireAdminPage } from "@/lib/server-security";
import { AdminShell } from "@/components/admin/admin-context";
import "./admin.css";
export const dynamic = "force-dynamic";
export const metadata = { title: "Review desk · WeekendCheck", robots: { index: false, follow: false } };
export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireAdminPage();
  return <AdminShell initial={await readState()} xConnected={Boolean(process.env.X_BEARER_TOKEN)}>{children}</AdminShell>;
}
