import { ProjectDetail } from "@/components/admin/admin-lists";
export default async function Page({ params }: { params: Promise<{ id: string }> }) { return <ProjectDetail id={(await params).id} />; }
