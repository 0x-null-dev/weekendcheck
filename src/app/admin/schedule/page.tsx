import { XSchedule } from "@/components/admin/x-schedule";
export default async function Page({ searchParams }: { searchParams: Promise<{ week?: string }> }) {
  return <XSchedule initialWeek={(await searchParams).week} />;
}
