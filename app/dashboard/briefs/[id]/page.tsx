import { notFound } from "next/navigation";
import BriefForm from "@/components/dashboard/BriefForm";
import { getBusiness, getIntegration } from "@/lib/product/store";

export const dynamic = "force-dynamic";

export default async function EditBriefPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [brief, integration] = await Promise.all([getBusiness(id), getIntegration()]);
  if (!brief) notFound();

  return <BriefForm brief={brief} integration={integration} />;
}
