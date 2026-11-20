import CallLibrary from "@/components/dashboard/CallLibrary";
import { listBusinesses, listCalls } from "@/lib/product/store";

export const dynamic = "force-dynamic";

export default async function CallsPage() {
  const [calls, businesses] = await Promise.all([listCalls(), listBusinesses()]);

  return (
    <CallLibrary
      calls={calls}
      businesses={businesses.map((b) => ({ id: b.id, name: b.businessName }))}
    />
  );
}
