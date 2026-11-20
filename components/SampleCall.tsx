"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { CloseIcon, MicIcon, PhoneIcon, PlayIcon } from "./ui/icons";

const lines = [
  { who: "AI", text: "Hi, you've reached Apex Plumbing. I'm the Ringsure AI receptionist. How can I help?" },
  { who: "Caller", text: "Yeah, my boiler's packed in and there's water everywhere." },
  {
    who: "AI",
    text: "I'm sorry to hear that. Can I take your name and the address? I'll flag it as urgent straight away.",
  },
  { who: "Caller", text: "It's Sarah Clarke, 14 Birch Road. Can someone come today?" },
  {
    who: "AI",
    text: "Absolutely. I've got those details. The owner will get a summary now and call you back as soon as possible.",
  },
];

export default function SampleCall() {
  const [open, setOpen] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [activeLine, setActiveLine] = useState(-1);
  const [unsupported, setUnsupported] = useState(false);
  const speaking = useRef(false);
  const timer = useRef<number | undefined>(undefined);
  const closeRef = useRef<HTMLButtonElement>(null);
  const reduce = useReducedMotion();

  function stop() {
    speaking.current = false;
    if (timer.current) window.clearTimeout(timer.current);
    if ("speechSynthesis" in window) window.speechSynthesis.cancel();
    setPlaying(false);
    setActiveLine(-1);
  }

  function play() {
    if (!("speechSynthesis" in window)) {
      setUnsupported(true);
      return;
    }
    setUnsupported(false);
    window.speechSynthesis.cancel();
    speaking.current = true;
    setPlaying(true);

    const ukVoice = window.speechSynthesis
      .getVoices()
      .find((voice) => voice.lang.toLowerCase().startsWith("en-gb"));

    const speakLine = (index: number) => {
      if (!speaking.current) return;
      if (index >= lines.length) {
        stop();
        return;
      }
      setActiveLine(index);
      const utterance = new SpeechSynthesisUtterance(lines[index].text);
      utterance.lang = "en-GB";
      utterance.rate = 0.98;
      if (ukVoice) utterance.voice = ukVoice;
      utterance.onend = () => {
        if (speaking.current) timer.current = window.setTimeout(() => speakLine(index + 1), 220);
      };
      utterance.onerror = () => stop();
      window.speechSynthesis.speak(utterance);
    };

    speakLine(0);
  }

  function close() {
    stop();
    setOpen(false);
  }

  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") close();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener("keydown", onKey);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  useEffect(() => () => stop(), []);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="group inline-flex items-center justify-center gap-2.5 rounded-full border border-line bg-white px-6 py-3.5 text-base font-semibold text-ink transition-all duration-300 hover:-translate-y-0.5 hover:border-accent/40 hover:bg-accent-soft/50 hover:text-accent-dark"
      >
        <span className="grid h-6 w-6 place-items-center rounded-full bg-accent-soft text-accent">
          <PlayIcon className="h-3 w-3" />
        </span>
        Hear a sample call
      </button>

      {typeof document !== "undefined" &&
        createPortal(
          <AnimatePresence>
            {open && (
              <motion.div
                className="fixed inset-0 z-[90] flex items-center justify-center p-4"
            initial={reduce ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22 }}
          >
            <div
              className="absolute inset-0 bg-ink/55 backdrop-blur-sm"
              onClick={close}
              aria-hidden="true"
            />
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-labelledby="sample-call-title"
              initial={reduce ? false : { opacity: 0, y: 22, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 14, scale: 0.98 }}
              transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
              className="card relative z-10 max-h-[92vh] w-full max-w-lg overflow-y-auto p-6 shadow-[0_40px_100px_-40px_rgba(21,36,58,0.7)] sm:p-8"
            >
              <button
                ref={closeRef}
                type="button"
                onClick={close}
                aria-label="Close sample call"
                className="absolute right-4 top-4 grid h-9 w-9 place-items-center rounded-full bg-paper text-muted transition hover:bg-paper-deep hover:text-ink"
              >
                <CloseIcon className="h-4 w-4" />
              </button>

              <span className="eyebrow">
                <MicIcon className="h-3 w-3" /> Sample call
              </span>
              <h2 id="sample-call-title" className="mt-4 font-display text-2xl font-extrabold text-ink">
                Hear how the first call goes.
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-muted">
                A short demo of Ringsure taking a boiler enquiry, qualifying the job and flagging
                it as urgent.
              </p>

              <div className="mt-6 space-y-2.5 rounded-2xl bg-paper p-4 sm:p-5">
                {lines.map((line, i) => (
                  <div
                    key={i}
                    className={`flex gap-3 rounded-xl px-2 py-2 transition-colors duration-300 ${
                      activeLine === i ? "bg-accent-soft" : ""
                    }`}
                  >
                    <span
                      className={`mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full ${
                        line.who === "AI" ? "bg-accent text-white" : "bg-white text-muted ring-1 ring-line"
                      }`}
                    >
                      {line.who === "AI" ? <PhoneIcon className="h-3 w-3" /> : <MicIcon className="h-3 w-3" />}
                    </span>
                    <p className="text-sm leading-relaxed text-ink-soft">
                      <span className="mr-1.5 font-bold text-accent-dark">{line.who}:</span>
                      {line.text}
                    </p>
                  </div>
                ))}
              </div>

              <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
                <button
                  type="button"
                  onClick={playing ? stop : play}
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-accent px-6 py-3 text-sm font-bold text-white transition hover:bg-accent-dark"
                >
                  {playing ? <CloseIcon className="h-3.5 w-3.5" /> : <PlayIcon className="h-3.5 w-3.5" />}
                  {playing ? "Stop playback" : "Play with AI voice"}
                </button>
                <p className="text-xs leading-relaxed text-muted">
                  {unsupported
                    ? "Audio playback isn't available in this browser — the transcript above shows the full call."
                    : "Uses your device's UK English voice. No data leaves your browser."}
                </p>
              </div>
              </motion.div>
            </motion.div>
            )}
          </AnimatePresence>,
          document.body
        )}
    </>
  );
}
