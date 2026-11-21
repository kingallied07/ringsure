"use client";

import { motion, useReducedMotion } from "framer-motion";
import Reveal from "./ui/Reveal";
import { DEMO_PHONE_DISPLAY, DEMO_PHONE_TEL } from "@/lib/site";
import { CheckIcon, ClockIcon, PhoneIcon } from "./ui/icons";

const points = [
  "No signup, no card, no sales pitch",
  "Hear the AI disclosure and qualification first-hand",
  "Under a minute — then we'll text you the summary",
];

export default function CallToTest() {
  const reduce = useReducedMotion();

  return (
    <section id="try" className="relative py-12 sm:py-16">
      <div className="container-page">
        <Reveal>
          <div className="relative overflow-hidden rounded-[2rem] border border-accent/25 bg-ink px-6 py-10 text-white sm:px-12 sm:py-14">
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -right-24 -top-24 h-80 w-80 rounded-full bg-[radial-gradient(circle,rgba(14,124,116,0.55),transparent_70%)]"
            />
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -bottom-24 -left-20 h-72 w-72 rounded-full bg-[radial-gradient(circle,rgba(231,166,75,0.18),transparent_70%)]"
            />

            <div className="relative grid items-center gap-10 lg:grid-cols-[1.15fr_0.85fr]">
              <div>
                <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-[11px] font-bold uppercase tracking-wider text-amber">
                  <PhoneIcon className="h-3.5 w-3.5" /> Try her right now
                </span>
                <h2 className="text-balance mt-5 font-display text-3xl font-extrabold leading-tight sm:text-4xl">
                  Don&apos;t take our word for it. Give her a ring.
                </h2>
                <p className="text-balance mt-4 max-w-xl text-sm leading-relaxed text-white/70 sm:text-base">
                  Call our live demo line and speak to the same AI receptionist we&apos;d set up for
                  your business. Ask about a boiler, a burst pipe or a price — she&apos;ll handle it
                  like a real front desk, then send you the summary.
                </p>

                <ul className="mt-7 space-y-2.5">
                  {points.map((point) => (
                    <li key={point} className="flex items-start gap-3 text-sm text-white/80">
                      <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-accent/40 text-amber">
                        <CheckIcon className="h-3 w-3" />
                      </span>
                      {point}
                    </li>
                  ))}
                </ul>
              </div>

              <motion.div
                className="relative rounded-3xl border border-white/15 bg-white/[0.07] p-7 text-center backdrop-blur-sm sm:p-9"
                whileHover={reduce ? undefined : { y: -5 }}
                transition={{ duration: 0.3 }}
              >
                <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-accent text-white">
                  <PhoneIcon className="h-6 w-6" />
                </span>
                <p className="mt-6 text-xs font-bold uppercase tracking-widest text-white/50">
                  Free demo line
                </p>
                <a
                  href={DEMO_PHONE_TEL}
                  className="mt-2 block font-display text-4xl font-extrabold tracking-tight text-white transition-colors hover:text-amber sm:text-5xl"
                >
                  {DEMO_PHONE_DISPLAY}
                </a>
                <a
                  href={DEMO_PHONE_TEL}
                  className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full bg-white px-6 py-4 text-sm font-bold text-ink transition hover:bg-amber"
                >
                  <PhoneIcon className="h-4 w-4" /> Call for a free test
                </a>
                <p className="mt-4 flex items-center justify-center gap-2 text-xs text-white/50">
                  <ClockIcon className="h-3.5 w-3.5" /> Available 24/7
                </p>
              </motion.div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
