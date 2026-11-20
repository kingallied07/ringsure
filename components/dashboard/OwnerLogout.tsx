"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function OwnerLogout() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function logout() {
    setBusy(true);
    await fetch("/api/owner/logout", { method: "POST" });
    router.push("/owner/login");
    router.refresh();
  }

  return (
    <button
      type="button"
      onClick={logout}
      disabled={busy}
      className="rounded-full border border-line bg-white px-4 py-2 text-xs font-bold text-muted transition hover:border-loss/40 hover:text-loss disabled:opacity-60"
    >
      {busy ? "Signing out…" : "Sign out"}
    </button>
  );
}
