"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const tabs = [
  { href: "/dashboard", label: "Overview" },
  { href: "/dashboard/briefs", label: "Briefs" },
  { href: "/dashboard/simulate", label: "Simulate a call" },
  { href: "/dashboard/evals", label: "Evals" },
];

export default function DashboardNav() {
  const pathname = usePathname();

  return (
    <nav className="flex flex-wrap gap-2" aria-label="Product demo navigation">
      {tabs.map((tab) => {
        const active = tab.href === "/dashboard" ? pathname === tab.href : pathname.startsWith(tab.href);
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
              active ? "bg-ink text-white" : "border border-line bg-white text-ink-soft hover:border-accent/40"
            }`}
          >
            {tab.label}
          </Link>
        );
      })}
      <Link
        href="/"
        className="rounded-full px-4 py-2 text-sm font-semibold text-muted transition-colors hover:text-accent"
      >
        ← Back to site
      </Link>
    </nav>
  );
}
