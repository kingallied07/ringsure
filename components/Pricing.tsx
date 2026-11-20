"use client";

import { motion, useReducedMotion } from "framer-motion";
import Reveal from "./ui/Reveal";
import { CheckIcon, SparkleIcon, ZapIcon } from "./ui/icons";

type Plan = {
  name: string;
  bestFor: string;
  price: string;
  period: string;
  allowance: string;
  features: string[];
  cta: string;
  featured?: boolean;
};

const plans: Plan[] = [
  {
    name: "Free Pilot",
    bestFor: "Validation & first customers",
    price: "0",
    period: "(7–14 days)",
    allowance: "Up to ~100 minutes or 50 calls",
    features: [
      "Full service on your number or a test number",
      "Lead summaries by SMS & email",
      "No credit card required",
    ],
    cta: "Start free pilot",
  },
  {
    name: "Starter",
    bestFor: "Sole traders & low-volume home services",
    price: "49",
    period: "/month",
    allowance: "200–250 minutes included",
    features: [
      "24/7 answering",
      "Lead summaries by SMS & email",
      "Basic qualification",
      "AI disclosure on every call",
    ],
    cta: "Choose Starter",
  },
  {
    name: "Growth",
    bestFor: "Busier trades & small teams",
    price: "99",
    period: "/month",
    allowance: "600–800 minutes included",
    features: [
      "Everything in Starter",
      "Calendar booking",
      "Emergency escalation",
      "Call recordings & transcripts",
      "Priority support",
    ],
    cta: "Choose Growth",
    featured: true,
  },
  {
    name: "Pro",
    bestFor: "Growing firms or multi-location",
    price: "149",
    period: "/month",
    allowance: "Higher minute allowance or fair-use unlimited",
    features: [
      "Everything in Growth",
      "Custom voice options",
      "CRM & job-management integrations",
      "Multi-user access",
    ],
    cta: "Choose Pro",
  },
];

export default function Pricing() {
  const reduce = useReducedMotion();

  return (
    <section id="pricing" className="relative py-24 sm:py-28">
      <div className="container-page">
        <Reveal className="mx-auto max-w-2xl text-center">
          <span className="eyebrow">Simple pricing</span>
          <h2 className="text-balance mt-5 font-display text-3xl font-extrabold leading-tight text-ink sm:text-4xl lg:text-[2.7rem]">
            Pays for itself with one extra job.
          </h2>
          <p className="text-balance mx-auto mt-5 max-w-xl text-base leading-relaxed text-muted sm:text-lg">
            At £150–£800+ a job, a single recovered lead covers weeks of Ringsure. No setup fees, no
            long contracts.
          </p>
        </Reveal>

        <div className="mt-12 grid items-stretch gap-4 sm:grid-cols-2 sm:gap-5 xl:grid-cols-4">
          {plans.map((plan, i) => (
            <Reveal key={plan.name} delay={i * 0.08}>
              <motion.article
                whileHover={reduce ? undefined : { y: -7 }}
                transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                className={`relative flex h-full flex-col rounded-3xl p-6 ${
                  plan.featured
                    ? "bg-ink text-white shadow-[0_30px_70px_-34px_rgba(21,36,58,0.75)] xl:-mt-3 xl:mb-[-0.75rem]"
                    : "card"
                }`}
              >
                {plan.featured && (
                  <>
                    <div
                      aria-hidden="true"
                      className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-[radial-gradient(circle,rgba(14,124,116,0.5),transparent_70%)]"
                    />
                    <span className="absolute -top-3 left-6 inline-flex items-center gap-1.5 rounded-full bg-amber px-3 py-1 text-[11px] font-extrabold uppercase tracking-wide text-ink">
                      <SparkleIcon className="h-3 w-3" /> Most popular
                    </span>
                  </>
                )}

                <div className="relative">
                  <h3
                    className={`font-display text-xl font-extrabold ${plan.featured ? "text-white" : "text-ink"}`}
                  >
                    {plan.name}
                  </h3>
                  <p className={`mt-2 text-sm ${plan.featured ? "text-white/65" : "text-muted"}`}>
                    {plan.bestFor}
                  </p>

                  <div className="mt-6 flex items-end gap-2">
                    <span
                      className={`font-display text-4xl font-extrabold tracking-tight ${plan.featured ? "text-white" : "text-ink"}`}
                    >
                      £{plan.price}
                    </span>
                    <span
                      className={`mb-1.5 text-sm ${plan.featured ? "text-white/65" : "text-muted"}`}
                    >
                      {plan.period}
                    </span>
                  </div>

                  <div
                    className={`mt-4 rounded-xl px-3 py-2 text-center text-xs font-bold ${
                      plan.featured ? "bg-accent/25 text-amber" : "bg-accent-soft text-accent-dark"
                    }`}
                  >
                    {plan.allowance}
                  </div>
                </div>

                <ul className="relative mt-7 space-y-3.5">
                  {plan.features.map((feature) => (
                    <li
                      key={feature}
                      className={`flex items-start gap-3 text-sm leading-relaxed ${
                        plan.featured ? "text-white/80" : "text-ink-soft"
                      }`}
                    >
                      <span
                        className={`mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full ${
                          plan.featured ? "bg-accent/30 text-amber" : "bg-accent-soft text-accent"
                        }`}
                      >
                        <CheckIcon className="h-3 w-3" />
                      </span>
                      {feature}
                    </li>
                  ))}
                </ul>

                <a
                  href="#pilot"
                  className={`relative mt-8 inline-flex w-full items-center justify-center gap-2 rounded-full px-5 py-3.5 text-sm font-bold transition-all duration-300 hover:-translate-y-0.5 ${
                    plan.featured
                      ? "bg-white text-ink hover:bg-amber"
                      : plan.price === "0"
                        ? "border border-accent/30 bg-accent-soft text-accent-dark hover:bg-accent hover:text-white"
                        : "bg-accent text-white hover:bg-accent-dark"
                  }`}
                >
                  {plan.cta}
                  <span aria-hidden="true">→</span>
                </a>
              </motion.article>
            </Reveal>
          ))}
        </div>

        <Reveal>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 rounded-3xl border border-accent/20 bg-accent-soft/60 px-6 py-6 text-center sm:flex-row sm:gap-5 sm:text-left">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-accent text-white">
              <ZapIcon className="h-5 w-5" />
            </span>
            <p className="text-sm leading-relaxed text-ink-soft sm:text-base">
              <strong className="font-bold text-ink">Do the maths:</strong> one £200–£600 job every
              few weeks more than covers the cost. Everything after that is pure upside.
            </p>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
