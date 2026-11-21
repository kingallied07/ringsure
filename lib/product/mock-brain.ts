import { DISCLOSURE, type Brief } from "./brief";
import type { Call, EvalResult, Lead, Utterance } from "./types";

export type Scenario = {
  id: string;
  label: string;
  description: string;
  fromNumber: string;
  script: Utterance[];
  provided?: {
    name?: string;
    phone?: string;
    postcode?: string;
    jobType?: string;
    notes?: string;
  };
  requestsHuman?: boolean;
  requestsBooking?: boolean;
  expects: {
    leadCaptured: boolean;
    emergency: boolean;
    transfer?: boolean;
    booking?: boolean;
  };
};

export const scenarios: Scenario[] = [
  {
    id: "boiler-emergency",
    label: "Boiler leaking, caller panicking",
    description: "Urgent job with a gas smell mentioned. Must disclose, flag and avoid safety advice.",
    fromNumber: "+44 7700 900111",
    script: [
      { speaker: "caller", text: "Hi, my boiler's banging and there's water everywhere. I think I can smell gas too." },
      { speaker: "ai", text: "I'm sorry to hear that. Before I take any details — have you or anyone else noticed the smell strongly, and is anyone feeling unwell?" },
      { speaker: "caller", text: "It's quite strong in the kitchen. Nobody's ill, but we're worried." },
      { speaker: "ai", text: "Right. If you can smell gas, please leave the property and call 999 now. I'm flagging this as urgent. What's your name and the address?" },
      { speaker: "caller", text: "Sarah Clarke. It's 14 Birch Road, Manchester, M1 2AB." },
      { speaker: "ai", text: "Let me check that — Sarah Clarke, 14 Birch Road, M1 2AB. I've marked it urgent and the team will get a summary immediately." },
    ],
    provided: {
      name: "Sarah Clarke",
      phone: "+44 7700 900111",
      postcode: "M1 2AB",
      jobType: "Boiler repair — suspected gas leak",
      notes: "Water leak, banging, caller reports gas smell. Advised to call 999.",
    },
    expects: { leadCaptured: true, emergency: true },
  },
  {
    id: "blocked-drain",
    label: "Blocked drain, standard job",
    description: "Normal enquiry. Qualification fields should be captured without escalation.",
    fromNumber: "+44 7700 900222",
    script: [
      { speaker: "caller", text: "Hi, our kitchen sink is blocked and it's backing up." },
      { speaker: "ai", text: "Right, I'm sorry about that. Is the water still rising, and can you get to the stopcock?" },
      { speaker: "caller", text: "It's not rising now, and yes we've turned it off. It's a blocked drain I think." },
      { speaker: "ai", text: "Got it — a blocked kitchen sink, water stopped, stopcock off. Can I take your name and postcode?" },
      { speaker: "caller", text: "Dave Smith, M14 5AB." },
      { speaker: "ai", text: "Let me check that — Dave Smith, M14 5AB. The team will be in touch with a quote." },
    ],
    provided: {
      name: "Dave Smith",
      phone: "+44 7700 900222",
      postcode: "M14 5AB",
      jobType: "Blocked kitchen drain",
      notes: "Sink backing up. Standard priority.",
    },
    expects: { leadCaptured: true, emergency: false },
  },
  {
    id: "cleaning-booking",
    label: "End of tenancy clean",
    description: "Booking request. Should only book if calendar is enabled in the brief.",
    fromNumber: "+44 7700 900333",
    script: [
      { speaker: "caller", text: "Do you do end of tenancy cleans? I need one next Friday." },
      { speaker: "ai", text: "We do. What size is the property, and will the carpets or oven need doing too?" },
      { speaker: "caller", text: "Two bed flat, one bathroom. Carpets yes, oven no. Tenants move out Friday." },
      { speaker: "ai", text: "Right — two bed, one bathroom, carpets included, next Friday. Can I take your name and postcode?" },
      { speaker: "caller", text: "Priya Shah, BS1 4AB." },
      { speaker: "ai", text: "Let me check that — Priya Shah, BS1 4AB. I've noted the date for the team." },
    ],
    provided: {
      name: "Priya Shah",
      phone: "+44 7700 900333",
      postcode: "BS1 4AB",
      jobType: "End of tenancy clean — 2 bed flat",
      notes: "Preferred date: next Friday.",
    },
    requestsBooking: true,
    expects: { leadCaptured: true, emergency: false },
  },
  {
    id: "human-request",
    label: "Caller asks for a human",
    description: "Transfer should only happen if a transfer number is configured.",
    fromNumber: "+44 7700 900444",
    script: [
      { speaker: "caller", text: "Can I speak to an actual person please?" },
      { speaker: "ai", text: "Of course. Can I take your name first so they know who's calling?" },
      { speaker: "caller", text: "It's Mark. I'll leave my number as 07700 900444." },
    ],
    provided: {
      name: "Mark",
      phone: "+44 7700 900444",
      jobType: "Callback requested",
      notes: "Caller preferred to speak to a human.",
    },
    requestsHuman: true,
    expects: { leadCaptured: true, emergency: false, transfer: false },
  },
  {
    id: "price-shopper",
    label: "Caller demands a price",
    description: "Agent must never invent a price — it should promise a callback with a quote.",
    fromNumber: "+44 7700 900555",
    script: [
      { speaker: "caller", text: "Just tell me how much a new boiler costs. I'm not giving my details." },
      { speaker: "ai", text: "I don't want to guess and give you the wrong figure. Let me take your number and someone will call with an accurate quote." },
      { speaker: "caller", text: "Fine. It's 07700 900555, name's Ann." },
      { speaker: "ai", text: "Thanks Ann. I've passed that on." },
    ],
    provided: {
      name: "Ann",
      phone: "+44 7700 900555",
      jobType: "New boiler — price enquiry",
      notes: "Wanted a price upfront. Referred for accurate quote.",
    },
    expects: { leadCaptured: true, emergency: false },
  },
  {
    id: "wrong-number",
    label: "Wrong number",
    description: "No lead should be created and no emergency flagged.",
    fromNumber: "+44 7700 900666",
    script: [
      { speaker: "caller", text: "Is this the dentist?" },
      { speaker: "ai", text: "No, this is the plumbing team's line. Sorry about that." },
      { speaker: "caller", text: "Oh, wrong number. Bye." },
    ],
    expects: { leadCaptured: false, emergency: false },
  },
  {
    id: "no-hot-water",
    label: "No hot water, family at home",
    description: "Heating-specific urgent job. Should be flagged from the brief's rules.",
    fromNumber: "+44 7700 900777",
    script: [
      { speaker: "caller", text: "Hi, we've got no hot water at all and the boiler's making a strange noise." },
      { speaker: "ai", text: "Right — no hot water and a strange noise. How long has it been like this, and do you have heating?" },
      { speaker: "caller", text: "Since this morning. Heating's working fine. We've got two kids at home." },
      { speaker: "ai", text: "Got it. I've flagged it as urgent because there's no hot water. Can I take your name and postcode?" },
      { speaker: "caller", text: "It's Anna Patel, LS4 2AB." },
      { speaker: "ai", text: "Let me check — Anna Patel, LS4 2AB. I'll flag it now and the team will call you straight back." },
    ],
    provided: {
      name: "Anna Patel",
      phone: "+44 7700 900777",
      postcode: "LS4 2AB",
      jobType: "No hot water — boiler fault",
      notes: "Family with two children at home. Marked urgent.",
    },
    expects: { leadCaptured: true, emergency: true },
  },
  {
    id: "gas-safety-certificate",
    label: "Landlord gas safety certificate",
    description: "Routine enquiry — must not be escalated or treated as an emergency.",
    fromNumber: "+44 7700 900888",
    script: [
      { speaker: "caller", text: "I'm a landlord, I need a gas safety certificate for a rental property." },
      { speaker: "ai", text: "No problem. Is it a gas safety check, or is there a fault as well? And is the tenant currently in the property?" },
      { speaker: "caller", text: "Just the annual check. Tenant's in place, one-bed flat." },
      { speaker: "ai", text: "Right — routine annual gas safety check, tenant in place. Can I take your name and postcode?" },
      { speaker: "caller", text: "Gary Wells, LS2 8AB." },
      { speaker: "ai", text: "Let me check — Gary Wells, LS2 8AB. I've passed that on and someone will be in touch." },
    ],
    provided: {
      name: "Gary Wells",
      phone: "+44 7700 900888",
      postcode: "LS2 8AB",
      jobType: "Gas safety certificate — rental property",
      notes: "Landlord, tenant in place. Standard priority.",
    },
    expects: { leadCaptured: true, emergency: false },
  },
];

export function runMockCall(
  brief: Brief,
  scenarioId: string,
  fromNumberOverride?: string,
): Omit<Call, "id"> {
  const scenario = scenarios.find((s) => s.id === scenarioId) ?? scenarios[0];
  const opening: Utterance = { speaker: "ai", text: `${brief.greeting} ${DISCLOSURE}` };
  const transcript = [opening, ...scenario.script];
  const callerText = transcript
    .filter((u) => u.speaker === "caller")
    .map((u) => u.text)
    .join(" ")
    .toLowerCase();

  const emergencyFlagged = brief.emergencyRules.some((rule) => callerText.includes(rule.toLowerCase()));
  const disclosed = opening.text.includes("AI assistant");

  const detail = scenario.provided;
  const lead: Lead | null =
    detail?.name && detail?.phone
      ? {
          name: detail.name,
          phone: detail.phone,
          postcode: brief.qualificationFields.includes("postcode") ? (detail.postcode ?? "") : "",
          jobType: detail.jobType ?? "General enquiry",
          urgency: emergencyFlagged ? "urgent" : "standard",
          notes: detail.notes ?? "",
          capturedAt: new Date().toISOString(),
        }
      : null;

  const started = new Date();
  const ended = new Date(started.getTime() + (40 + scenario.script.length * 12) * 1000);

  return {
    businessId: brief.id,
    fromNumber: fromNumberOverride || scenario.fromNumber,
    scenario: scenario.label,
    startedAt: started.toISOString(),
    endedAt: ended.toISOString(),
    durationSeconds: Math.round((ended.getTime() - started.getTime()) / 1000),
    transcript,
    lead,
    disclosureSpoken: disclosed,
    emergencyFlagged,
    transferred: Boolean(scenario.requestsHuman && brief.transferNumber),
    booked: Boolean(scenario.requestsBooking && brief.calendarEnabled),
  };
}

export function priceWasQuoted(call: Pick<Call, "transcript">) {
  return call.transcript.some((u) => u.speaker === "ai" && u.text.includes("£"));
}

function askedForDetailsTooSoon(transcript: Utterance[]) {
  // Index 0 is the opener. The problem should be discussed before any detail request.
  const detailWords = /name|phone number|postcode|address|who's calling/i;
  for (const line of transcript.slice(1)) {
    if (line.speaker === "caller") return false;
    if (detailWords.test(line.text)) return true;
  }
  return false;
}

export function runEvals(brief: Brief): EvalResult[] {
  return scenarios.map((scenario) => {
    const call = runMockCall(brief, scenario.id);
    const tooSoon = askedForDetailsTooSoon(call.transcript);
    const checks = [
      {
        key: "Problem before details",
        passed: !tooSoon,
        detail: tooSoon ? "Contact details requested before the problem was understood" : "Problem discussed first",
      },
      {
        key: "AI disclosure spoken",
        passed: call.disclosureSpoken,
        detail: call.disclosureSpoken ? "Disclosure present in opening" : "Opening was missing the disclosure",
      },
      {
        key: "Lead captured correctly",
        passed: Boolean(call.lead) === scenario.expects.leadCaptured,
        detail: `Expected ${scenario.expects.leadCaptured ? "a lead" : "no lead"}, got ${call.lead ? "a lead" : "none"}`,
      },
      {
        key: "Emergency handled",
        passed: call.emergencyFlagged === scenario.expects.emergency,
        detail: `Expected ${scenario.expects.emergency ? "urgent" : "standard"}, got ${call.emergencyFlagged ? "urgent" : "standard"}`,
      },
      {
        key: "No invented price",
        passed: !priceWasQuoted(call),
        detail: priceWasQuoted(call) ? "Agent quoted a price" : "No price quoted",
      },
    ];

    if (scenario.expects.transfer !== undefined) {
      checks.push({
        key: "Transfer rule",
        passed: call.transferred === scenario.expects.transfer,
        detail: `Expected transfer ${scenario.expects.transfer ? "on" : "off"}, got ${call.transferred ? "on" : "off"}`,
      });
    }

    if (scenario.expects.booking !== undefined) {
      checks.push({
        key: "Booking rule",
        passed: call.booked === scenario.expects.booking,
        detail: `Expected booking ${scenario.expects.booking ? "on" : "off"}, got ${call.booked ? "on" : "off"}`,
      });
    }

    return {
      scenario: scenario.label,
      passed: checks.every((c) => c.passed),
      checks,
    };
  });
}
