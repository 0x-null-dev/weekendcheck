import { redirect } from "next/navigation";
import { isAdmin } from "@/lib/server-security";
import { LoginForm } from "./login-form";
export const dynamic = "force-dynamic";
export const metadata = { title: "Sign in · WeekendCheck", robots: { index: false, follow: false } };
export default async function LoginPage() {
  if (await isAdmin()) redirect("/admin");
  return <LoginForm />;
}
