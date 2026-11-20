import type { Metadata } from "next";
import Link from "next/link";
import DashboardNav from "@/components/dashboard/DashboardNav";
import OwnerLogout from "@/components/dashboard/OwnerLogout";
import Logo from "@/components/ui/Logo";

export const metadata: Metadata = {
  title: "Product demo | Ringsure",
  robots: { index: false, follow: false },
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-paper">
      <div className="border-b border-line bg-white">
        <div className="container-page flex flex-wrap items-center justify-between gap-4 py-5">
          <Link href="/dashboard" className="rounded-lg">
            <Logo />
          </Link>
          <div className="flex items-center gap-3">
            <span className="rounded-full bg-amber-soft px-3 py-1.5 text-xs font-bold text-[#8a5a12]">
              Owner control · mock mode
            </span>
            <OwnerLogout />
          </div>
        </div>
      </div>
      <div className="container-page py-8">
        <DashboardNav />
        <div className="mt-8">{children}</div>
      </div>
    </div>
  );
}
