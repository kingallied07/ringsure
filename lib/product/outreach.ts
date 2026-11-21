import type { Prospect } from "./store";
import type { Utterance } from "./types";
import { chooseOpener, OUTBOUND_DISCLOSURE, renderOpener } from "./knowledge";

export type OutreachScenario = {
  id: string;
  label: string;
  description: string;
  script: Utterance[];
  outcome: string;
  summary: string;
};

const disclose: Utterance = { speaker: "ai", text: OUTBOUND_DISCLOSURE };

export const outreachScenarios: OutreachScenario[] = [
  {
    id: "interested",
    label: "Interested — book a pilot",
    description: "Owner is frustrated by missed calls and wants to try the free pilot.",
    script: [
      { speaker: "caller", text: "Go on then, I've got a minute." },
      disclose,
      {
        speaker: "ai",
        text: "Most callers don't leave a voicemail — they ring the next name on Google. Want to hear a 10-second demo? I'll do the 'customer with a burst pipe' version.",
      },
      { speaker: "caller", text: "Aye, go on." },
      {
        speaker: "ai",
        text: "Hi, you've reached the business. I'm the Ringsure AI assistant — how can I help? Burst pipe? I've got the address, flagged it urgent, and you'll get a summary now. That was me. Free 7 to 14 day pilot — worth a look?",
      },
      { speaker: "caller", text: "Aye, send me the details." },
    ],
    outcome: "interested",
    summary: "Owner is losing calls while out on jobs. Heard the live demo and asked for the pilot details. Next step: send setup details and book the start date.",
  },
  {
    id: "not-interested",
    label: "Not interested",
    description: "Polite refusal. Agent ends quickly and records do-not-call.",
    script: [
      { speaker: "caller", text: "No thanks, we're sorted." },
      disclose,
      {
        speaker: "ai",
        text: "No problem at all. I'll make a note and we won't call again. Thanks for your time.",
      },
    ],
    outcome: "do_not_call",
    summary: "Polite refusal. Asked not to be called again. Marked do-not-call — no follow-up.",
  },
  {
    id: "voicemail",
    label: "Voicemail",
    description: "No answer. Leaves a short message with a callback request.",
    script: [
      {
        speaker: "ai",
        text: "Hi, this is Sam, an AI assistant from Ringsure. We help home service businesses stop losing jobs to missed calls. Please call back on this number or reply to our email. Thank you.",
      },
    ],
    outcome: "not_reached",
    summary: "No answer. Left a short message explaining Ringsure and asking for a callback. Try again in the next call window.",
  },
  {
    id: "price-question",
    label: "Wants prices now",
    description: "Prospect asks for cost. Agent gives published tier prices only.",
    script: [
      { speaker: "caller", text: "How much does it cost? Just tell me." },
      disclose,
      {
        speaker: "ai",
        text: "Of course. Free pilot for 7 to 14 days, then £49, £99 or £149 a month depending on call volume and features. I'll send the full breakdown by text.",
      },
    ],
    outcome: "interested",
    summary: "Wanted costs up front. Published tiers quoted and the free pilot offered. Next step: send the written breakdown.",
  },
  {
    id: "gatekeeper",
    label: "Reception / gatekeeper",
    description: "Staff member answers. Agent leaves a callback message.",
    script: [
      { speaker: "caller", text: "They're out. Can I take a message?" },
      disclose,
      {
        speaker: "ai",
        text: "Thanks. Please ask them to call back about a free pilot for missed calls. I'll leave this number. Have a good day.",
      },
    ],
    outcome: "callback_requested",
    summary: "Receptionist took a message for the owner. Callback requested about a free pilot. Next step: call back when the owner is in.",
  },
];

export function runMockOutreach(prospect: Prospect, scenarioId: string) {
  const scenario = outreachScenarios.find((item) => item.id === scenarioId) ?? outreachScenarios[0];
  const who = prospect.contactName?.trim() || prospect.targetRole?.trim() || "the owner";
  const variant = chooseOpener(prospect.id || prospect.phone);
  const opening: Utterance = {
    speaker: "ai",
    text: renderOpener(variant.line, who, prospect.businessName),
  };
  const transcript = [opening, ...scenario.script];

  return {
    prospectId: prospect.id,
    openerId: variant.id,
    engaged: scenario.id !== "voicemail",
    mode: "mock" as const,
    status: "completed" as const,
    scenario: scenario.label,
    transcript,
    outcome: scenario.outcome,
    summary: scenario.summary,
    disclosureSpoken: transcript.some((line) => /AI assistant/i.test(line.text)),
  };
}
