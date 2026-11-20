import type { Prospect } from "./store";
import type { Utterance } from "./types";

export type OutreachScenario = {
  id: string;
  label: string;
  description: string;
  script: Utterance[];
  outcome: string;
};

export const outreachScenarios: OutreachScenario[] = [
  {
    id: "interested",
    label: "Interested — book a pilot",
    description: "Owner is frustrated by missed calls and wants to try the free pilot.",
    script: [
      {
        speaker: "ai",
        text: "Hi, this is Ringsure, an AI assistant calling on behalf of the team. I know I'm not a person in your office — I'll be quick. Is now a bad time?",
      },
      { speaker: "caller", text: "Go on then, I've got two minutes." },
      {
        speaker: "ai",
        text: "We help home service businesses answer every call while they're on the tools. Many firms miss 30 to 60 percent of calls, and most callers never leave a voicemail. Would a free 7 to 14 day pilot be worth a look?",
      },
      { speaker: "caller", text: "Aye, I'm missing loads when I'm under a boiler. How much after that?" },
      {
        speaker: "ai",
        text: "Starter is £49 a month. One recovered job usually covers it. I'll pass your details on and someone will set it up today.",
      },
    ],
    outcome: "Interested — pilot requested",
  },
  {
    id: "not-interested",
    label: "Not interested",
    description: "Polite refusal. Agent ends quickly and records the outcome.",
    script: [
      {
        speaker: "ai",
        text: "Hi, this is Ringsure, an AI assistant calling on behalf of the team. I'll be quick — is now okay?",
      },
      { speaker: "caller", text: "No thanks, we're sorted." },
      {
        speaker: "ai",
        text: "No problem at all. I'll make a note and we won't call again. Thanks for your time.",
      },
    ],
    outcome: "Not interested — do not call",
  },
  {
    id: "voicemail",
    label: "Voicemail",
    description: "No answer. Leaves a short, compliant message with a callback request.",
    script: [
      {
        speaker: "ai",
        text: "Hi, this is Ringsure, an AI assistant calling for the team. I'm not a person in the office. We help trades stop losing jobs to missed calls. Please call back on this number, or reply to our email. Thank you.",
      },
    ],
    outcome: "Voicemail left",
  },
  {
    id: "price-question",
    label: "Wants prices now",
    description: "Prospect asks for cost. Agent gives published tier prices only, no invented quotes.",
    script: [
      {
        speaker: "ai",
        text: "Hi, this is Ringsure, an AI assistant calling on behalf of the team. Quick question about missed calls — is now okay?",
      },
      { speaker: "caller", text: "How much does it cost? Just tell me." },
      {
        speaker: "ai",
        text: "Of course. Free pilot for 7 to 14 days, then £49, £99 or £149 a month depending on call volume and features. I'll send the full breakdown by text.",
      },
    ],
    outcome: "Pricing sent — follow up",
  },
  {
    id: "gatekeeper",
    label: "Reception / gatekeeper",
    description: "Staff member answers. Agent asks for the decision maker and leaves a callback.",
    script: [
      {
        speaker: "ai",
        text: "Hi, this is Ringsure, an AI assistant calling on behalf of the team. Could I speak to the owner or operations manager please?",
      },
      { speaker: "caller", text: "They're out. Can I take a message?" },
      {
        speaker: "ai",
        text: "Thanks. Please ask them to call back about a free pilot for missed calls. I'll leave the number. Have a good day.",
      },
    ],
    outcome: "Callback requested",
  },
];

export function runMockOutreach(prospect: Prospect, scenarioId: string) {
  const scenario = outreachScenarios.find((item) => item.id === scenarioId) ?? outreachScenarios[0];
  const opening: Utterance = {
    speaker: "ai",
    text: `Hello, is that ${prospect.businessName}? This is Ringsure, an AI assistant calling on behalf of the team.`,
  };

  return {
    prospectId: prospect.id,
    scenario: scenario.label,
    transcript: [opening, ...scenario.script],
    outcome: scenario.outcome,
    disclosureSpoken: true,
  };
}
