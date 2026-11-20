import Logo from "./ui/Logo";

const productLinks = [
  { label: "How it works", href: "#how-it-works" },
  { label: "Who it's for", href: "#who-for" },
  { label: "Pricing", href: "#pricing" },
  { label: "FAQ", href: "#faq" },
];

const companyLinks = [
  { label: "Start free pilot", href: "#pilot" },
  { label: "Privacy", href: "#privacy" },
  { label: "Terms", href: "#terms" },
];

export default function Footer() {
  return (
    <footer className="relative overflow-hidden bg-ink text-white">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-32 -top-40 h-96 w-96 rounded-full bg-[radial-gradient(circle,rgba(14,124,116,0.25),transparent_70%)]"
      />
      <div className="container-page relative">
        <div className="grid gap-10 py-16 sm:grid-cols-2 lg:grid-cols-[1.5fr_1fr_1fr_1.2fr]">
          <div>
            <a href="#top" className="inline-block rounded-lg" aria-label="Ringsure — back to top">
              <Logo light />
            </a>
            <p className="mt-5 max-w-xs text-sm leading-relaxed text-white/60">
              The AI receptionist for UK home service businesses. Every call answered, every lead
              captured — even when you&apos;re on the tools.
            </p>
          </div>

          <nav aria-label="Product links">
            <h2 className="text-xs font-bold uppercase tracking-widest text-white/65">Product</h2>
            <ul className="mt-5 space-y-3">
              {productLinks.map((link) => (
                <li key={link.href}>
                  <a href={link.href} className="text-sm text-white/75 transition-colors hover:text-amber">
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <nav aria-label="Company links">
            <h2 className="text-xs font-bold uppercase tracking-widest text-white/65">Company</h2>
            <ul className="mt-5 space-y-3">
              {companyLinks.map((link) => (
                <li key={link.href}>
                  <a href={link.href} className="text-sm text-white/75 transition-colors hover:text-amber">
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <div>
            <h2 className="text-xs font-bold uppercase tracking-widest text-white/65">Get in touch</h2>
            <ul className="mt-5 space-y-3 text-sm">
              <li>
                <a
                  href="mailto:hello@ringsure.co.uk"
                  className="text-white/75 transition-colors hover:text-amber"
                >
                  hello@ringsure.co.uk
                </a>
              </li>
              <li className="text-white/75">Monday–Friday, 9am–6pm</li>
              <li className="text-white/75">Serving home service businesses across the UK</li>
            </ul>
          </div>
        </div>

        <div id="privacy" className="border-t border-white/10 py-7">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <p className="text-xs leading-relaxed text-white/65">
              © {new Date().getFullYear()} Ringsure. All rights reserved. We handle caller
              details in line with UK GDPR and never sell or share your leads.
            </p>
            <p className="max-w-xl text-xs leading-relaxed text-white/55">
              <strong className="font-semibold text-white/80">AI disclosure:</strong> Ringsure is
              an AI assistant. It clearly identifies itself as AI at the start of every call. No
              human is listening to or joining your calls.
            </p>
          </div>
          <p id="terms" className="mt-4 text-xs text-white/60">
            Built for UK home service businesses · Plumbers · Electricians · Cleaners · Heating &amp;
            Gas · Property managers · Handymen
          </p>
        </div>
      </div>
    </footer>
  );
}
