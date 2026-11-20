"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import Reveal from "./ui/Reveal";
import { ChevronDownIcon } from "./ui/icons";

const faqs = [
  {
    q: "Is it really AI?",
    a: "Yes. Ringsure is an AI voice assistant trained on real home-service conversations. It handles the first call, asks the right questions and logs the details. You stay in control — you decide which jobs to take and when to call back.",
  },
  {
    q: "Will my customers know they're talking to AI?",
    a: "Yes. It introduces itself clearly as an AI assistant at the start of every call. In practice, callers care far more that someone answered than who answered — and we keep the voice natural, polite and unmistakably UK.",
  },
  {
    q: "What if it's an emergency?",
    a: "It gets flagged. You tell us your emergency rules — gas leaks, burst pipes, no power, lockouts — and urgent calls trigger an immediate priority notification so you can call back fast. You can also set calls to be transferred straight to you.",
  },
  {
    q: "Does it work with my existing number?",
    a: "Yes. We can route your current business number to Ringsure, or provide a dedicated UK number to use on ads, your website and your van. Either way, you decide when calls are answered by the AI.",
  },
  {
    q: "What about data protection and compliance?",
    a: "Caller details are handled in line with UK GDPR, calls are logged, and you control how long records are kept. We never sell or share your leads. The AI always discloses that it's an AI assistant on the call, and there's a full transcript in your dashboard.",
  },
  {
    q: "How quickly can I get started?",
    a: "Most businesses are live within 24 hours. The free pilot runs 7–14 days so you can see the leads it captures for yourself before paying anything.",
  },
  {
    q: "What if I don't like it?",
    a: "Cancel any time. Monthly plans have no long contracts, and there's nothing to lose during the free pilot — no card, no commitment.",
  },
];

export default function FAQ() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section id="faq" className="relative py-24 sm:py-28">
      <div className="absolute inset-0 -z-10 bg-[linear-gradient(180deg,rgba(255,255,255,0)_0%,rgba(255,255,255,0.6)_50%,rgba(255,255,255,0)_100%)]" />
      <div className="container-page">
        <div className="grid gap-12 lg:grid-cols-[0.85fr_1.15fr] lg:gap-16">
          <Reveal>
            <div className="lg:sticky lg:top-28">
              <span className="eyebrow">FAQ</span>
              <h2 className="text-balance mt-5 font-display text-3xl font-extrabold leading-tight text-ink sm:text-4xl lg:text-[2.7rem]">
                Straight answers. No small print.
              </h2>
              <p className="mt-5 max-w-sm text-base leading-relaxed text-muted">
                Still got a question? Email us at{" "}
                <a
                  href="mailto:hello@ringsure.co.uk"
                  className="font-semibold text-accent underline decoration-accent/30 underline-offset-4 hover:text-accent-dark"
                >
                  hello@ringsure.co.uk
                </a>{" "}
                and a real human will get back to you.
              </p>
            </div>
          </Reveal>

          <div className="space-y-3">
            {faqs.map((faq, i) => {
              const isOpen = open === i;
              return (
                <Reveal key={faq.q} delay={i * 0.05}>
                  <div
                    className={`overflow-hidden rounded-2xl border transition-colors duration-300 ${
                      isOpen ? "border-accent/30 bg-white" : "border-line bg-white/70"
                    }`}
                  >
                    <h3>
                      <button
                        type="button"
                        onClick={() => setOpen(isOpen ? null : i)}
                        aria-expanded={isOpen}
                        aria-controls={`faq-panel-${i}`}
                        id={`faq-button-${i}`}
                        className="flex w-full items-center justify-between gap-4 px-5 py-5 text-left sm:px-6"
                      >
                        <span className="font-display text-base font-bold text-ink sm:text-lg">
                          {faq.q}
                        </span>
                        <motion.span
                          animate={{ rotate: isOpen ? 180 : 0 }}
                          transition={{ duration: 0.25 }}
                          className={`grid h-7 w-7 shrink-0 place-items-center rounded-full ${
                            isOpen ? "bg-accent text-white" : "bg-paper-deep text-muted"
                          }`}
                        >
                          <ChevronDownIcon className="h-4 w-4" />
                        </motion.span>
                      </button>
                    </h3>
                    <AnimatePresence initial={false}>
                      {isOpen && (
                        <motion.div
                          key="content"
                          id={`faq-panel-${i}`}
                          role="region"
                          aria-labelledby={`faq-button-${i}`}
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
                          className="overflow-hidden"
                        >
                          <p className="px-5 pb-5 text-sm leading-relaxed text-muted sm:px-6 sm:pb-6 sm:text-base">
                            {faq.a}
                          </p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
