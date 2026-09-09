import { ReviewEditor } from "@/components/admin/review-editor";
export default async function Page({ params }: { params: Promise<{ id: string }> }) { return <ReviewEditor id={(await params).id} />; }
