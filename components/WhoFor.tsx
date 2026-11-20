"use client";

import { motion, useReducedMotion } from "framer-motion";
import Reveal from "./ui/Reveal";
import {
  BoltIcon,
  BuildingIcon,
  FlameIcon,
  HammerIcon,
  KeyIcon,
  LeafIcon,
  SparkleIcon,
  WrenchIcon,
} from "./ui/icons";

const trades = [
  {
    icon: WrenchIcon,
    name: "Plumbers",
    line: "Burst pipes don't wait for you to finish a job.",
  },
  {
    icon: BoltIcon,
    name: "Electricians",
    line: "From rewires to fault-finding, capture every enquiry.",
  },
  {
    icon: SparkleIcon,
    name: "Cleaners",
    line: "Fill cancelled slots without endless phone tag.",
  },
  {
    icon: FlameIcon,
    name: "Heating & Gas",
    line: "Boiler breakdowns are urgent. Answer them all.",
  },
  {
    icon: BuildingIcon,
    name: "Property Management",
    line: "Tenant calls, maintenance and viewings, sorted.",
  },
  {
    icon: HammerIcon,
    name: "Handymen",
    line: "One person, a thousand small jobs. Don't lose one.",
  },
  {
    icon: LeafIcon,
    name: "Landscapers",
    line: "Quote more gardens while you're on the mower.",
  },
  {
    icon: KeyIcon,
    name: "Locksmiths & Emergency",
    line: "When it's urgent, the first answer wins the job.",
  },
];

export default function WhoFor() {
  const reduce = useReducedMotion();

  return (
    <section id="who-for" className="relative py-24 sm:py-28">
      <div className="container-page">
        <Reveal className="mx-auto max-w-2xl text-center">
          <span className="eyebrow">Who it&apos;s for</span>
          <h2 className="text-balance mt-5 font-display text-3xl font-extrabold leading-tight text-ink sm:text-4xl lg:text-[2.7rem]">
            Built for the trades. Not call centres.
          </h2>
          <p className="text-balance mx-auto mt-5 max-w-xl text-base leading-relaxed text-muted sm:text-lg">
            If your work takes you away from a desk and your livelihood comes from the phone,
            Ringsure is for you.
          </p>
        </Reveal>

        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {trades.map((trade, i) => {
            const Icon = trade.icon;
            return (
              <Reveal key={trade.name} delay={(i % 4) * 0.08}>
                <motion.article
                  whileHover={reduce ? undefined : { y: -6 }}
                  transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                  className="group card h-full p-5 transition-colors duration-300 hover:border-accent/35 hover:bg-white sm:p-6"
                >
                  <span className="grid h-11 w-11 place-items-center rounded-xl bg-paper text-accent transition-colors duration-300 group-hover:bg-accent group-hover:text-white">
                    <Icon className="h-5 w-5" />
                  </span>
                  <h3 className="mt-5 font-display text-base font-bold text-ink sm:text-lg">
                    {trade.name}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted">{trade.line}</p>
                </motion.article>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
