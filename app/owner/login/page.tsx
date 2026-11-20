import type { Metadata } from "next";
import OwnerLoginForm from "@/components/dashboard/OwnerLoginForm";
import Logo from "@/components/ui/Logo";

export const metadata: Metadata = {
  title: "Owner sign in | Ringsure",
  robots: { index: false, follow: false },
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await searchParams;

  return (
    <div className="flex min-h-screen items-center justify-center bg-paper px-4">
      <div className="w-full max-w-md">
        <div className="flex justify-center">
          <Logo />
        </div>
        <div className="card mt-8 p-7 sm:p-9">
          <span className="eyebrow">Owner access</span>
          <h1 className="mt-5 font-display text-2xl font-extrabold text-ink">Your control desk</h1>
          <p className="mt-2 text-sm text-muted">
            This area is private. Enter your owner password to continue.
          </p>
          <OwnerLoginForm next={next?.startsWith("/dashboard") ? next : "/dashboard"} />
        </div>
        <p className="mt-6 text-center text-xs text-muted">
          Customers never see this page. Their dashboards come later.
        </p>
      </div>
    </div>
  );
}
