import { WeekWorkspace } from "@/components/admin/week-workspace";
export default async function Page({ params }: { params: Promise<{ id: string }> }) { return <WeekWorkspace id={(await params).id} />; }
