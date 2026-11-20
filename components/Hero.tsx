"use client";

import { motion, useReducedMotion } from "framer-motion";
import HeroGraphic from "./ui/HeroGraphic";
import SampleCall from "./SampleCall";
import { CheckIcon } from "./ui/icons";

const promises = ["No card required", "Live within 24 hours", "Keep your existing number"];

export default function Hero() {
  const reduce = useReducedMotion();

  return (
    <section id="top" className="relative overflow-hidden pt-10 sm:pt-16 lg:pt-20">
      <motion.div
        aria-hidden="true"
        className="mesh-bg pointer-events-none absolute inset-0 -z-10"
        initial={reduce ? false : { opacity: 0 }}
        animate={reduce ? undefined : { opacity: 1, y: [0, -14, 0] }}
        transition={{ opacity: { duration: 1 }, y: { duration: 18, repeat: Infinity, ease: "easeInOut" } }}
      />

      <div className="container-page grid items-center gap-12 lg:grid-cols-[1.02fr_0.98fr] lg:gap-8">
        <div className="relative z-10 max-w-2xl">
          <motion.div
            initial={reduce ? false : { opacity: 0, y: 16 }}
            animate={reduce ? undefined : { opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          >
            <span className="eyebrow">
              <span className="h-1.5 w-1.5 rounded-full bg-accent" />
              AI receptionist for UK home services
            </span>
          </motion.div>

          <motion.h1
            className="text-balance mt-6 font-display text-[2.65rem] font-extrabold leading-[1.06] text-ink sm:text-5xl lg:text-[3.8rem] lg:leading-[1.04]"
            initial={reduce ? false : { opacity: 0, y: 22 }}
            animate={reduce ? undefined : { opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
          >
            Never miss another job while you&apos;re{" "}
            <span className="relative whitespace-nowrap text-accent">
              on the tools
              <svg
                className="absolute -bottom-1 left-0 w-full text-amber/70"
                viewBox="0 0 300 12"
                fill="none"
                preserveAspectRatio="none"
                aria-hidden="true"
              >
                <path
                  d="M2 9C74 3 214 2 298 7"
                  stroke="currentColor"
                  strokeWidth="5"
                  strokeLinecap="round"
                />
              </svg>
            </span>
            .
          </motion.h1>

          <motion.p
            className="text-balance mt-6 max-w-xl text-base leading-relaxed text-muted sm:text-lg"
            initial={reduce ? false : { opacity: 0, y: 20 }}
            animate={reduce ? undefined : { opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.16, ease: [0.22, 1, 0.36, 1] }}
          >
            Ringsure is the AI receptionist that answers every call for UK home service
            businesses, captures the details, and sends you the lead — so the next £200–£600 job
            doesn&apos;t go to your competitor.
          </motion.p>

          <motion.div
            className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center"
            initial={reduce ? false : { opacity: 0, y: 18 }}
            animate={reduce ? undefined : { opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.24, ease: [0.22, 1, 0.36, 1] }}
          >
            <a
              href="#pilot"
              className="group inline-flex items-center justify-center gap-2 rounded-full bg-accent px-7 py-3.5 text-base font-semibold text-white shadow-[0_16px_36px_-16px_rgba(14,124,116,0.8)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-accent-dark hover:shadow-[0_22px_44px_-18px_rgba(14,124,116,0.85)]"
            >
              Start free pilot
              <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
            </a>
            <SampleCall />
          </motion.div>

          <motion.ul
            className="mt-7 flex flex-wrap items-center gap-x-5 gap-y-2.5"
            initial={reduce ? false : { opacity: 0 }}
            animate={reduce ? undefined : { opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.36 }}
          >
            {promises.map((item) => (
              <li key={item} className="flex items-center gap-1.5 text-[13px] font-medium text-muted">
                <CheckIcon className="h-4 w-4 text-accent" />
                {item}
              </li>
            ))}
          </motion.ul>
        </div>

        <div className="relative z-0">
          <HeroGraphic />
        </div>
      </div>
    </section>
  );
}
