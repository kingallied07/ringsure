"use client";

import { motion, useReducedMotion } from "framer-motion";
import Reveal from "./ui/Reveal";
import { CheckIcon, ClockIcon, MessageIcon, PhoneIcon, ShieldIcon } from "./ui/icons";

const steps = [
  {
    n: "01",
    icon: PhoneIcon,
    title: "Answers instantly, 24/7",
    copy: "Day, night, weekends and bank holidays. Every call gets a real conversation, not a beep and a voicemail.",
    detail: "First-ring pickup, every time",
  },
  {
    n: "02",
    icon: MessageIcon,
    title: "Qualifies the job and collects details",
    copy: "Name, number, postcode, what's wrong and how urgent. It asks the right follow-ups, like a good receptionist would.",
    detail: "Your questions, your wording",
  },
  {
    n: "03",
    icon: CheckIcon,
    title: "You get a clean summary",
    copy: "A tidy SMS or email with everything you need — so you can quote the job the moment you're free.",
    detail: "Sent within seconds of the call",
  },
];

export default function HowItWorks() {
  const reduce = useReducedMotion();

  return (
    <section id="how-it-works" className="relative py-24 sm:py-28">
      <div className="absolute inset-0 -z-10 bg-[linear-gradient(180deg,rgba(255,255,255,0)_0%,rgba(255,255,255,0.55)_45%,rgba(255,255,255,0)_100%)]" />
      <div className="container-page">
        <Reveal className="max-w-2xl">
          <span className="eyebrow">How it works</span>
          <h2 className="text-balance mt-5 font-display text-3xl font-extrabold leading-tight text-ink sm:text-4xl lg:text-[2.7rem]">
            Three steps. No extra admin.
          </h2>
          <p className="text-balance mt-5 max-w-xl text-base leading-relaxed text-muted sm:text-lg">
            It works the way a brilliant receptionist would — just without the sick days, the hold
            music or the wage bill.
          </p>
        </Reveal>

        <div className="relative mt-12 grid gap-5 md:grid-cols-3">
          <div
            aria-hidden="true"
            className="absolute left-[16%] right-[16%] top-[46px] hidden h-px bg-gradient-to-r from-transparent via-accent/25 to-transparent md:block"
          />
          {steps.map((step, i) => {
            const Icon = step.icon;
            return (
              <Reveal key={step.n} delay={i * 0.12}>
                <motion.article
                  whileHover={reduce ? undefined : { y: -7 }}
                  transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                  className="card relative h-full p-6 sm:p-7"
                >
                  <div className="relative flex items-center justify-between">
                    <span className="grid h-12 w-12 place-items-center rounded-2xl bg-accent-soft text-accent">
                      <Icon className="h-5 w-5" />
                    </span>
                    <span className="font-display text-2xl font-extrabold text-line">{step.n}</span>
                  </div>
                  <h3 className="mt-6 font-display text-xl font-bold leading-snug text-ink">
                    {step.title}
                  </h3>
                  <p className="mt-3 text-sm leading-relaxed text-muted sm:text-base">{step.copy}</p>
                  <div className="mt-6 flex items-center gap-2 border-t border-line pt-4 text-xs font-semibold text-accent-dark">
                    <CheckIcon className="h-3.5 w-3.5" />
                    {step.detail}
                  </div>
                </motion.article>
              </Reveal>
            );
          })}
        </div>

        <Reveal>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 rounded-2xl bg-ink px-6 py-5 text-white sm:justify-between sm:px-9">
            <div className="flex items-center gap-3">
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-white/10 text-amber">
                <ClockIcon className="h-4 w-4" />
              </span>
              <p className="text-sm font-semibold sm:text-base">
                Emergencies are flagged first so you can call back fast.
              </p>
            </div>
            <p className="flex items-center gap-2 text-xs font-medium text-white/65 sm:text-sm">
              <ShieldIcon className="h-4 w-4 text-amber" />
              Clear AI disclosure on every call
            </p>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
