import { XPostEditor } from "@/components/admin/x-schedule";
export default async function Page({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ date?: string; time?: string }> }) {
  const { id } = await params; const { date, time } = await searchParams;
  return <XPostEditor id={id} date={date} time={time} />;
}
