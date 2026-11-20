import QaBoard from "@/components/dashboard/QaBoard";
import { listBusinesses, listQaReviews, listUnanswered } from "@/lib/product/store";

export const dynamic = "force-dynamic";

export default async function QaPage() {
  const [unanswered, reviews, tenants] = await Promise.all([
    listUnanswered(),
    listQaReviews(),
    listBusinesses(),
  ]);

  return (
    <QaBoard
      unanswered={unanswered}
      reviews={reviews}
      tenants={tenants.map((t) => ({ id: t.id, name: t.businessName }))}
    />
  );
}
