"use client";

import { motion, useReducedMotion } from "framer-motion";
import Reveal from "./ui/Reveal";
import { QuoteIcon, ShieldIcon, StarIcon } from "./ui/icons";

const quotes = [
  {
    result: "Recovered 4 leads in week one",
    quote:
      "Two of them turned into paid jobs. I used to find out about missed calls days later — now I know before I've parked the van.",
    author: "Plumber, Manchester",
  },
  {
    result: "Stopped checking my phone on site",
    quote:
      "The summary tells me everything: who called, where, and how urgent. I just call them back when I'm free. It's dead simple.",
    author: "Electrician, Bristol",
  },
  {
    result: "Customers just got an answer",
    quote:
      "It says up front that it's an AI assistant. Nobody minded — they were relieved someone picked up. Friendly, clear, proper UK voice.",
    author: "Cleaning company, Leeds",
  },
];

export default function SocialProof() {
  const reduce = useReducedMotion();

  return (
    <section id="results" className="relative overflow-hidden bg-ink py-24 sm:py-28">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-24 top-0 h-96 w-96 rounded-full bg-[radial-gradient(circle,rgba(14,124,116,0.35),transparent_70%)] blur-2xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-24 bottom-0 h-96 w-96 rounded-full bg-[radial-gradient(circle,rgba(231,166,75,0.16),transparent_70%)] blur-2xl"
      />

      <div className="container-page relative">
        <Reveal className="mx-auto max-w-2xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3.5 py-1.5 text-[11px] font-bold uppercase tracking-[0.08em] text-amber">
            Early pilot results
          </span>
          <h2 className="text-balance mt-5 font-display text-3xl font-extrabold leading-tight text-white sm:text-4xl lg:text-[2.7rem]">
            The difference a first answer makes.
          </h2>
          <p className="text-balance mx-auto mt-5 max-w-xl text-base leading-relaxed text-white/65 sm:text-lg">
            Real outcomes from businesses that stopped handing jobs to voicemail.
          </p>
          <div
            className="mt-4 flex items-center justify-center gap-1"
            role="img"
            aria-label="Rated five out of five"
          >
            {Array.from({ length: 5 }).map((_, i) => (
              <StarIcon key={i} className="h-4 w-4 text-amber" />
            ))}
          </div>
        </Reveal>

        <div className="mt-12 grid gap-5 md:grid-cols-3">
          {quotes.map((item, i) => (
            <Reveal key={item.author} delay={i * 0.1}>
              <motion.figure
                whileHover={reduce ? undefined : { y: -6 }}
                transition={{ duration: 0.3 }}
                className="flex h-full flex-col rounded-3xl border border-white/12 bg-white/[0.055] p-6 backdrop-blur-sm sm:p-7"
              >
                <QuoteIcon className="h-7 w-7 text-amber/60" />
                <p className="mt-5 text-sm font-bold uppercase tracking-wide text-amber">
                  {item.result}
                </p>
                <blockquote className="mt-3 flex-1 text-sm leading-relaxed text-white/85 sm:text-base">
                  &ldquo;{item.quote}&rdquo;
                </blockquote>
                <figcaption className="mt-6 flex items-center gap-2 border-t border-white/10 pt-4 text-xs font-semibold text-white/55">
                  <span className="h-1.5 w-1.5 rounded-full bg-accent" />
                  {item.author}
                </figcaption>
              </motion.figure>
            </Reveal>
          ))}
        </div>

        <Reveal>
          <div className="mt-10 flex flex-col gap-4 rounded-3xl border border-white/12 bg-white/[0.04] p-6 sm:flex-row sm:items-center sm:gap-5 sm:p-7">
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-white/10 text-amber">
              <ShieldIcon className="h-5 w-5" />
            </span>
            <p className="text-sm leading-relaxed text-white/75 sm:text-base">
              <strong className="font-semibold text-white">Clear and compliant by design.</strong>{" "}
              Ringsure identifies itself as an AI assistant at the start of every call, speaks in
              a natural UK voice, and keeps a full call log for your records.
            </p>
          </div>
        </Reveal>

        <p className="mt-5 text-center text-xs text-white/60">
          Illustrative pilot examples shown for layout — replace with verified customer quotes before launch.
        </p>
      </div>
    </section>
  );
}
