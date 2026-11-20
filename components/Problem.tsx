"use client";

import { motion, useReducedMotion } from "framer-motion";
import Reveal from "./ui/Reveal";
import { ArrowRightIcon, CheckIcon, CloseIcon, PhoneIcon, ZapIcon } from "./ui/icons";

const stats = [
  {
    value: "30–60%",
    label: "of calls missed",
    detail: "by many small UK trade and home service businesses.",
  },
  {
    value: "£150–£800+",
    label: "per job, often",
    detail: "one recovered job covers weeks of the service.",
  },
  {
    value: "No voicemail",
    label: "from most callers",
    detail: "they simply ring the next business on Google.",
  },
];

const today = [
  "The phone rings while you're up a ladder",
  "You can't safely take the call",
  "Most callers don't leave a message",
  "The competitor down the road answers",
];

const withAA = [
  "The phone rings — AI answers instantly",
  "It asks the right job questions",
  "Urgent work is flagged for you",
  "You get a clean lead on your phone",
];

export default function Problem() {
  const reduce = useReducedMotion();

  return (
    <section id="problem" className="relative py-24 sm:py-28">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-line to-transparent" />
      <div className="container-page">
        <Reveal className="mx-auto max-w-3xl text-center">
          <span className="eyebrow">The real cost</span>
          <h2 className="text-balance mt-5 font-display text-3xl font-extrabold leading-tight text-ink sm:text-4xl lg:text-[2.7rem]">
            Every missed call is a job you already paid to attract.
          </h2>
          <p className="text-balance mx-auto mt-5 max-w-2xl text-base leading-relaxed text-muted sm:text-lg">
            You paid for the ad. You earned the rating. Then the phone rang while your hands were
            full. In home services, the first business to answer usually wins the work — and most
            callers never leave a voicemail.
          </p>
        </Reveal>

        <div className="mt-12 grid gap-4 sm:grid-cols-3 sm:gap-5">
          {stats.map((stat, i) => (
            <Reveal key={stat.label} delay={i * 0.1}>
              <div className="card h-full p-6 text-center transition-transform duration-300 hover:-translate-y-1 sm:p-7">
                <p
                  className={`font-display text-3xl font-extrabold tracking-tight sm:text-4xl ${
                    i === 1 ? "text-accent" : "text-ink"
                  }`}
                >
                  {stat.value}
                </p>
                <p className="mt-2 text-sm font-bold text-ink-soft">{stat.label}</p>
                <p className="mt-1.5 text-sm leading-relaxed text-muted">{stat.detail}</p>
              </div>
            </Reveal>
          ))}
        </div>

        <div className="mt-8 grid gap-5 lg:grid-cols-2">
          <Reveal>
            <motion.div
              whileHover={reduce ? undefined : { y: -5 }}
              transition={{ duration: 0.3 }}
              className="h-full rounded-3xl border border-line bg-white/60 p-6 sm:p-8"
            >
              <div className="flex items-center gap-3">
                <span className="grid h-9 w-9 place-items-center rounded-xl bg-paper-deep text-muted">
                  <PhoneIcon className="h-4 w-4" />
                </span>
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-muted">Today</p>
                  <p className="font-display text-lg font-bold text-ink">The job walks away</p>
                </div>
              </div>
              <ul className="mt-6 space-y-3.5">
                {today.map((item) => (
                  <li key={item} className="flex items-start gap-3 text-sm text-ink-soft sm:text-base">
                    <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-[#f6e8e4] text-loss">
                      <CloseIcon className="h-3 w-3" />
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
            </motion.div>
          </Reveal>

          <Reveal delay={0.12}>
            <motion.div
              whileHover={reduce ? undefined : { y: -5 }}
              transition={{ duration: 0.3 }}
              className="relative h-full overflow-hidden rounded-3xl border border-accent/20 bg-accent-soft/60 p-6 sm:p-8"
            >
              <div
                aria-hidden="true"
                className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-[radial-gradient(circle,rgba(14,124,116,0.14),transparent_70%)]"
              />
              <div className="relative flex items-center gap-3">
                <span className="grid h-9 w-9 place-items-center rounded-xl bg-accent text-white">
                  <ZapIcon className="h-4 w-4" />
                </span>
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-accent">
                    With Ringsure
                  </p>
                  <p className="font-display text-lg font-bold text-ink">The job lands in your pocket</p>
                </div>
              </div>
              <ul className="relative mt-6 space-y-3.5">
                {withAA.map((item) => (
                  <li key={item} className="flex items-start gap-3 text-sm text-ink-soft sm:text-base">
                    <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-accent text-white">
                      <CheckIcon className="h-3 w-3" />
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
            </motion.div>
          </Reveal>
        </div>

        <Reveal>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 rounded-3xl border border-dashed border-accent/35 bg-white/50 px-6 py-6 text-center sm:flex-row sm:gap-5 sm:text-left">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-accent-soft text-accent">
              <ArrowRightIcon className="h-5 w-5" />
            </span>
            <p className="text-base font-semibold text-ink sm:text-lg">
              One recovered job pays for weeks of Ringsure.
            </p>
            <a
              href="#pricing"
              className="shrink-0 text-sm font-bold text-accent underline decoration-accent/30 underline-offset-4 transition hover:text-accent-dark"
            >
              See pricing
            </a>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
