"use client";

import { motion, useReducedMotion } from "framer-motion";
import { CheckIcon, ClockIcon, MicIcon, PhoneIcon, ZapIcon } from "./icons";

const bars = [12, 22, 34, 18, 40, 28, 14, 32, 24, 16, 36, 20, 30, 12, 26, 18];

export default function HeroGraphic() {
  const reduce = useReducedMotion();
  const float = (distance: number, duration: number, delay = 0) =>
    reduce
      ? {}
      : {
          animate: { y: [0, -distance, 0] },
          transition: { duration, delay, repeat: Infinity, ease: "easeInOut" as const },
        };

  return (
    <div className="relative mx-auto aspect-[1/1.02] w-full max-w-[520px] sm:aspect-[1/0.92]">
      {/* soft background layers */}
      <motion.div
        aria-hidden="true"
        className="absolute left-[2%] top-[6%] h-[62%] w-[70%] rounded-full bg-[radial-gradient(circle,rgba(14,124,116,0.2),rgba(14,124,116,0)_70%)] blur-[6px]"
        {...float(18, 12)}
      />
      <motion.div
        aria-hidden="true"
        className="absolute bottom-[4%] right-[0%] h-[58%] w-[62%] rounded-full bg-[radial-gradient(circle,rgba(231,166,75,0.25),rgba(231,166,75,0)_70%)] blur-[6px]"
        {...float(22, 14, 1.2)}
      />
      <div
        aria-hidden="true"
        className="dot-grid absolute left-[6%] top-[14%] h-[72%] w-[74%] rounded-[36px] opacity-70 [mask-image:radial-gradient(ellipse_at_center,black_35%,transparent_75%)]"
      />

      {/* phone */}
      <motion.div
        className="absolute left-1/2 top-[10%] w-[51%] min-w-[190px] -translate-x-1/2 sm:top-[8%] sm:w-[49%]"
        initial={reduce ? false : { opacity: 0, y: 34, scale: 0.96 }}
        animate={reduce ? undefined : { opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1], delay: 0.15 }}
      >
        <div className="phone-shadow relative rounded-[2.4rem] border-[6px] border-ink p-1.5 sm:rounded-[2.8rem]">
          <div className="relative overflow-hidden rounded-[1.9rem] bg-[#fbfbf9] sm:rounded-[2.2rem]">
            {/* notch */}
            <div className="absolute left-1/2 top-1.5 z-10 h-3.5 w-20 -translate-x-1/2 rounded-full bg-ink sm:h-4 sm:w-24" />

            {/* screen */}
            <div className="px-3.5 pb-4 pt-8 sm:px-4 sm:pt-10">
              <div className="mb-5 flex items-center justify-between text-[8px] font-semibold text-ink sm:text-[10px]">
                <span>09:41</span>
                <span className="flex items-center gap-1">
                  <span className="inline-block h-1.5 w-2.5 rounded-[2px] bg-ink/50" />
                  <span className="inline-block h-1.5 w-2.5 rounded-[2px] bg-ink/30" />
                  <span className="inline-block h-2 w-3.5 rounded-full border border-ink/40" />
                </span>
              </div>

              <div className="flex flex-col items-center text-center">
                <div className="relative grid h-12 w-12 place-items-center rounded-full bg-accent-soft text-accent sm:h-14 sm:w-14">
                  <span className="animate-pulse-ring absolute inset-0 rounded-full border border-accent/50" />
                  <MicIcon className="h-5 w-5 sm:h-6 sm:w-6" />
                </div>
                <p className="mt-2.5 font-display text-[13px] font-bold text-ink sm:text-base">
                  Ringsure
                </p>
                <p className="mt-0.5 text-[9px] font-semibold uppercase tracking-wider text-accent sm:text-[10px]">
                  AI receptionist
                </p>
                <div className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-[#e9f6ef] px-2 py-0.5 text-[8px] font-bold text-[#29714b] sm:text-[9px]">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#37a86e]" />
                  Call answered · 00:12
                </div>
              </div>

              {/* waveform */}
              <div className="mt-4 flex h-10 items-center justify-center gap-[3px] sm:mt-5 sm:h-12">
                {bars.map((h, i) => (
                  <motion.span
                    key={i}
                    className="w-[3px] rounded-full bg-accent/70 sm:w-[3.5px]"
                    style={{ height: h }}
                    animate={
                      reduce
                        ? undefined
                        : { scaleY: [0.55, 1, 0.65, 0.9, 0.55], opacity: [0.55, 1, 0.6, 1, 0.55] }
                    }
                    transition={{
                      duration: 1.8,
                      repeat: Infinity,
                      delay: (i % 7) * 0.12,
                      ease: "easeInOut",
                    }}
                  />
                ))}
              </div>

              {/* transcript */}
              <div className="mt-3 rounded-2xl rounded-tl-sm bg-white px-3 py-2.5 shadow-[0_6px_18px_-12px_rgba(21,36,58,0.4)] ring-1 ring-line/70">
                <p className="text-[9px] font-bold text-accent sm:text-[10px]">Ringsure</p>
                <p className="mt-0.5 text-[9px] leading-[1.5] text-ink-soft sm:text-[10px]">
                  &ldquo;Hi, you&apos;ve reached Apex Plumbing. I&apos;m the AI assistant — how can I
                  help?&rdquo;
                </p>
              </div>

              {/* call controls */}
              <div className="mt-4 flex items-center justify-center gap-5">
                <span className="grid h-7 w-7 place-items-center rounded-full bg-paper-deep text-muted sm:h-8 sm:w-8">
                  <MicIcon className="h-3.5 w-3.5" />
                </span>
                <span className="grid h-9 w-9 place-items-center rounded-full bg-[#d9524b] text-white shadow-[0_8px_16px_-8px_rgba(217,82,75,0.9)] sm:h-11 sm:w-11">
                  <PhoneIcon className="h-4 w-4 rotate-[135deg]" />
                </span>
                <span className="grid h-7 w-7 place-items-center rounded-full bg-paper-deep text-muted sm:h-8 sm:w-8">
                  <span className="grid grid-cols-3 gap-[2px]">
                    {Array.from({ length: 9 }).map((_, i) => (
                      <span key={i} className="h-[2px] w-[2px] rounded-full bg-current" />
                    ))}
                  </span>
                </span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* floating lead card */}
      <motion.div
        className="absolute -right-1 top-[24%] w-[54%] max-w-[225px] sm:right-[1%] sm:top-[22%]"
        initial={reduce ? false : { opacity: 0, x: 24, y: 10 }}
        animate={reduce ? { opacity: 1 } : { opacity: 1, x: 0, y: 0 }}
        transition={{ duration: 0.75, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
      >
        <motion.div
          className="glass card rounded-2xl p-3 shadow-[0_22px_50px_-28px_rgba(21,36,58,0.55)] sm:p-4"
          {...float(11, 6.5, 0.4)}
        >
          <div className="flex items-center gap-2">
            <span className="grid h-6 w-6 place-items-center rounded-full bg-[#e2f4e9] text-[#2f8657] sm:h-7 sm:w-7">
              <CheckIcon className="h-3.5 w-3.5" />
            </span>
            <p className="text-[10px] font-bold text-ink sm:text-xs">New lead captured</p>
          </div>
          <div className="mt-2.5 space-y-1.5">
            <div className="flex items-center justify-between gap-2">
              <span className="text-[9px] text-muted sm:text-[10px]">Caller</span>
              <span className="text-[9px] font-bold text-ink sm:text-[10px]">Mrs. Clarke</span>
            </div>
            <div className="flex items-center justify-between gap-2">
              <span className="text-[9px] text-muted sm:text-[10px]">Job</span>
              <span className="text-[9px] font-bold text-ink sm:text-[10px]">Boiler repair</span>
            </div>
            <div className="flex items-center justify-between gap-2">
              <span className="text-[9px] text-muted sm:text-[10px]">Urgency</span>
              <span className="inline-flex items-center gap-1 rounded-full bg-amber-soft px-1.5 py-0.5 text-[8px] font-bold text-[#7a4e0d] sm:text-[9px]">
                <ZapIcon className="h-2.5 w-2.5" /> Urgent
              </span>
            </div>
          </div>
          <div className="mt-2.5 flex items-center gap-1 border-t border-line pt-2 text-[8px] font-semibold text-accent sm:text-[9px]">
            <CheckIcon className="h-2.5 w-2.5" /> Sent to your phone
          </div>
        </motion.div>
      </motion.div>

      {/* floating 24/7 chip */}
      <motion.div
        className="absolute -left-1 bottom-[19%] sm:left-[1%] sm:bottom-[18%]"
        initial={reduce ? false : { opacity: 0, x: -20, y: 10 }}
        animate={reduce ? { opacity: 1 } : { opacity: 1, x: 0, y: 0 }}
        transition={{ duration: 0.75, delay: 0.7, ease: [0.22, 1, 0.36, 1] }}
      >
        <motion.div
          className="glass card flex items-center gap-2 rounded-2xl px-3 py-2.5 shadow-[0_18px_40px_-26px_rgba(21,36,58,0.6)] sm:px-4"
          {...float(9, 7.5, 1.4)}
        >
          <span className="grid h-7 w-7 place-items-center rounded-full bg-accent-soft text-accent">
            <ClockIcon className="h-4 w-4" />
          </span>
          <div>
            <p className="font-display text-xs font-extrabold leading-tight text-ink sm:text-sm">
              Always on
            </p>
            <p className="text-[9px] font-medium text-muted sm:text-[10px]">24/7 · 365 days</p>
          </div>
        </motion.div>
      </motion.div>

      {/* small decorative spark */}
      <motion.div
        aria-hidden="true"
        className="absolute right-[6%] bottom-[6%] h-3 w-3 rounded-full bg-amber shadow-[0_0_0_6px_rgba(231,166,75,0.15)]"
        {...float(14, 8, 0.6)}
      />
    </div>
  );
}
