import { notFound } from "next/navigation";
import BriefForm from "@/components/dashboard/BriefForm";
import { getBusiness } from "@/lib/product/store";

export const dynamic = "force-dynamic";

export default async function EditBriefPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const brief = await getBusiness(id);
  if (!brief) notFound();

  return <BriefForm brief={brief} />;
}
