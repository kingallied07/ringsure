"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useState, type FormEvent } from "react";
import Reveal from "./ui/Reveal";
import { CheckIcon, ClockIcon, MailIcon, ShieldIcon } from "./ui/icons";

const businessTypes = [
  "Plumber",
  "Electrician",
  "Cleaner",
  "Heating & Gas",
  "Property Management",
  "Handyman",
  "Landscaper / Gardener",
  "Locksmith / Emergency",
  "Other home service",
];

const reassurance = ["No card required", "Live within 24 hours", "Cancel any time"];

export default function FinalCTA() {
  const [submitted, setSubmitted] = useState(false);
  const reduce = useReducedMotion();

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    // Wire this to your backend / CRM when ready.
    // e.g. await fetch("/api/pilot", { method: "POST", body: new FormData(event.currentTarget) });
    setSubmitted(true);
  }

  return (
    <section id="pilot" className="relative py-20 sm:py-24">
      <div className="container-page">
        <Reveal>
          <div className="relative overflow-hidden rounded-[2rem] border border-accent/15 bg-gradient-to-br from-accent-soft via-white to-amber-soft/50 px-5 py-12 sm:px-10 sm:py-16 lg:px-16">
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -right-24 -top-28 h-80 w-80 rounded-full bg-[radial-gradient(circle,rgba(14,124,116,0.16),transparent_70%)]"
            />
            <div
              aria-hidden="true"
              className="dot-grid pointer-events-none absolute -bottom-20 -left-20 h-64 w-64 rounded-full opacity-40"
            />

            <div className="relative grid items-center gap-12 lg:grid-cols-[1fr_1.02fr] lg:gap-16">
              <div>
                <span className="eyebrow bg-white/70">Start your free pilot</span>
                <h2 className="text-balance mt-5 font-display text-3xl font-extrabold leading-tight text-ink sm:text-4xl lg:text-[2.7rem]">
                  Stop losing the next job to voicemail.
                </h2>
                <p className="text-balance mt-5 max-w-lg text-base leading-relaxed text-ink-soft sm:text-lg">
                  Start a free 7–14 day pilot. We&apos;ll set Ringsure up on your number and show
                  you the leads it captures — before you pay a penny.
                </p>

                <ul className="mt-7 space-y-3">
                  {reassurance.map((item) => (
                    <li key={item} className="flex items-center gap-3 text-sm font-semibold text-ink-soft sm:text-base">
                      <span className="grid h-6 w-6 place-items-center rounded-full bg-accent text-white">
                        <CheckIcon className="h-3.5 w-3.5" />
                      </span>
                      {item}
                    </li>
                  ))}
                </ul>

                <p className="mt-8 flex items-center gap-2 text-xs text-muted">
                  <ShieldIcon className="h-4 w-4 text-accent" />
                  Ringsure discloses that it&apos;s an AI assistant on every call.
                </p>
              </div>

              <div className="relative">
                <div className="card relative overflow-hidden p-6 shadow-[0_34px_80px_-40px_rgba(21,36,58,0.55)] sm:p-8">
                  <AnimatePresence mode="wait">
                    {submitted ? (
                      <motion.div
                        key="success"
                        initial={reduce ? false : { opacity: 0, y: 14 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.4 }}
                        className="flex min-h-[380px] flex-col items-center justify-center text-center"
                      >
                        <motion.span
                          initial={reduce ? false : { scale: 0.6 }}
                          animate={{ scale: 1 }}
                          transition={{ type: "spring", stiffness: 220, damping: 16 }}
                          className="grid h-16 w-16 place-items-center rounded-full bg-accent-soft text-accent"
                        >
                          <CheckIcon className="h-8 w-8" />
                        </motion.span>
                        <h3 className="mt-6 font-display text-2xl font-extrabold text-ink">
                          You&apos;re booked in.
                        </h3>
                        <p className="mt-3 max-w-sm text-sm leading-relaxed text-muted">
                          Thanks for reaching out. We&apos;ll be in touch within one working day to get
                          your free pilot set up.
                        </p>
                        <button
                          type="button"
                          onClick={() => setSubmitted(false)}
                          className="mt-6 text-sm font-bold text-accent underline decoration-accent/30 underline-offset-4 hover:text-accent-dark"
                        >
                          Send another request
                        </button>
                      </motion.div>
                    ) : (
                      <motion.form
                        key="form"
                        onSubmit={handleSubmit}
                        initial={false}
                        exit={{ opacity: 0, y: -10 }}
                        className="space-y-5"
                      >
                        <div>
                          <h3 className="font-display text-xl font-extrabold text-ink">
                            Get my free pilot
                          </h3>
                          <p className="mt-1 text-sm text-muted">Takes less than a minute.</p>
                        </div>

                        <div>
                          <label htmlFor="name" className="mb-1.5 block text-sm font-semibold text-ink">
                            Your name
                          </label>
                          <input
                            id="name"
                            name="name"
                            type="text"
                            autoComplete="name"
                            required
                            placeholder="e.g. Dave Smith"
                            className="w-full rounded-xl border border-line bg-white px-4 py-3 text-sm text-ink placeholder:text-muted/60 transition-colors hover:border-accent/40 focus:border-accent focus:outline-none"
                          />
                        </div>

                        <div>
                          <label htmlFor="businessType" className="mb-1.5 block text-sm font-semibold text-ink">
                            Business type
                          </label>
                          <select
                            id="businessType"
                            name="businessType"
                            required
                            defaultValue=""
                            className="w-full rounded-xl border border-line bg-white px-4 py-3 text-sm text-ink transition-colors hover:border-accent/40 focus:border-accent focus:outline-none"
                          >
                            <option value="" disabled>
                              Select your trade
                            </option>
                            {businessTypes.map((type) => (
                              <option key={type} value={type}>
                                {type}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div className="grid gap-5 sm:grid-cols-2">
                          <div>
                            <label htmlFor="phone" className="mb-1.5 block text-sm font-semibold text-ink">
                              Phone number
                            </label>
                            <input
                              id="phone"
                              name="phone"
                              type="tel"
                              autoComplete="tel"
                              required
                              placeholder="07700 900123"
                              className="w-full rounded-xl border border-line bg-white px-4 py-3 text-sm text-ink placeholder:text-muted/60 transition-colors hover:border-accent/40 focus:border-accent focus:outline-none"
                            />
                          </div>
                          <div>
                            <label htmlFor="email" className="mb-1.5 block text-sm font-semibold text-ink">
                              Email address
                            </label>
                            <input
                              id="email"
                              name="email"
                              type="email"
                              autoComplete="email"
                              required
                              placeholder="you@yourbusiness.co.uk"
                              className="w-full rounded-xl border border-line bg-white px-4 py-3 text-sm text-ink placeholder:text-muted/60 transition-colors hover:border-accent/40 focus:border-accent focus:outline-none"
                            />
                          </div>
                        </div>

                        <button
                          type="submit"
                          className="group inline-flex w-full items-center justify-center gap-2 rounded-full bg-accent px-6 py-4 text-base font-bold text-white shadow-[0_16px_36px_-16px_rgba(14,124,116,0.8)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-accent-dark"
                        >
                          Start my free pilot
                          <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
                        </button>

                        <p className="flex items-center justify-center gap-1.5 text-center text-xs text-muted">
                          <ClockIcon className="h-3.5 w-3.5" />
                          No card required. We&apos;ll only use these details to set up your pilot.
                        </p>
                      </motion.form>
                    )}
                  </AnimatePresence>
                </div>
                <p className="mt-4 flex items-center justify-center gap-2 text-center text-xs text-muted">
                  <MailIcon className="h-3.5 w-3.5" />
                  Prefer email? Write to hello@ringsure.co.uk
                </p>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
