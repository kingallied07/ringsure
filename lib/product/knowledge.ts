import type { Trade } from "./brief";

/** The facts the assistant is allowed to use when answering about Ringsure itself. */
export const RINGSURE_FACT_SHEET = `ABOUT RINGSURE
- Ringsure is an AI receptionist for UK home service businesses: plumbers, electricians, cleaners, heating and gas engineers, property managers, handymen and locksmiths.
- It answers every call 24/7, 365 days a year. No hold music, no voicemail, no missed calls.
- It hears the problem first, asks sensible follow-up questions, then takes the caller's name, phone number, postcode and address.
- It checks for emergencies using the business's own rules, flags urgent jobs immediately, and never gives safety or repair advice. If someone smells gas or is in danger, it tells them to leave and call 999.
- The owner gets a clean summary by SMS, email or Telegram within seconds of the call, including the problem, urgency and contact details.
- Call recordings and transcripts are available on Growth and Pro, kept for 30 days.
- Callers always hear an AI disclosure at the start. Ringsure never pretends to be a human.

PLANS AND PRICES (quote these exactly, never invent or discount)
- Free Pilot: £0 for 7 to 14 days, up to about 100 minutes or 50 calls, full service on their number or a test number. No card required.
- Starter: £49/month, 200 to 250 minutes, 24/7 answering, lead summaries by SMS and email, basic qualification, AI disclosure.
- Growth: £99/month, 600 to 800 minutes, calendar booking, emergency escalation, call recordings and transcripts, priority support.
- Pro: £149/month, higher minute allowance or fair-use unlimited, custom voice options, CRM and job-management integrations, multi-user.

THE VALUE STORY
- Many small UK trade businesses miss 30 to 60 percent of calls, and most callers do not leave voicemail. They call the next business on Google.
- Typical jobs are £150 to £800 or more. One recovered job usually pays for weeks of the service.
- Keep your existing number: we can divert calls to Ringsure. Porting can come later.

HOW THE PILOT WORKS
1. A ten minute onboarding call collects the business name, services, service area, opening hours, emergency rules and the greeting.
2. We give them a Ringsure number or divert their existing one.
3. They make a test call and review the transcript together with us.
4. They go live, and the first 50 calls are reviewed by our team.

WHAT WE NEED FROM A NEW CUSTOMER
Business name, trade, services, service area/postcodes, opening hours, how urgent jobs are defined, the name and mobile of the decision maker, and a phone number to divert.

COMMON OBJECTIONS
- "I already have voicemail": most callers never leave voicemail; they call the next business.
- "It'll sound like a robot": the voice is natural UK English, brief and calm, and callers are told it is AI.
- "My customers are old fashioned": they care that someone answers, and the disclosure is handled politely.
- "I'm too busy to set it up": onboarding takes ten minutes and we do the configuration for them.
- "What if it's an emergency?": urgent words are flagged immediately; dangerous situations get a 999 instruction.`;

/** Discovery questions per trade — the assistant must ask the problem BEFORE collecting details. */
export const TRADE_DISCOVERY: Record<Trade, string> = {
  ringsure:
    "Ask what they do, how many vans or engineers they run, and whether they currently miss calls while on jobs. Then ask what a typical job is worth and how they would like leads sent. Explain the pilot and offer to set it up.",
  "heating-gas":
    "First ask what is happening with the heating or boiler. Then ask: is there any smell of gas, is anyone unwell, do they have heating, do they have hot water, how long has it been like this, what make and model is the boiler, is it a home or rental property, and what postcode. Stop and escalate immediately if gas, carbon monoxide or safety is mentioned.",
  plumbing:
    "First ask what is happening. Then ask: where is the leak or blockage, is water still escaping or rising, can they turn off the stopcock, is there any electrics near the water, is it a home or business, how long has it been happening, and what postcode. Flooding or sewage is urgent.",
  cleaning:
    "First ask what kind of clean they need. Then ask: property type, number of bedrooms and bathrooms, is it end of tenancy or a regular clean, are carpets or ovens included, preferred date and time, postcode, and whether the property is furnished. No emergency escalation unless something is unsafe.",
};

/** Built-in knowledge that can be synced into a tenant's knowledge store by title. */
export const BUILT_IN_KNOWLEDGE: {
  tenant: Trade;
  kind: "website" | "pricing" | "faq" | "rule" | "note";
  title: string;
  content: string;
}[] = [
  { tenant: "ringsure", kind: "website", title: "What Ringsure does", content: RINGSURE_FACT_SHEET },
  {
    tenant: "ringsure",
    kind: "faq",
    title: "Is it really AI?",
    content:
      "Yes. It introduces itself as an AI assistant on every call. It is not a person in the office. It can still take messages, qualify jobs and send summaries.",
  },
  {
    tenant: "ringsure",
    kind: "faq",
    title: "Can I keep my existing number?",
    content:
      "Yes. Calls can be diverted from their existing business number to Ringsure. Porting the number can be arranged later if they want it.",
  },
  {
    tenant: "ringsure",
    kind: "faq",
    title: "What if it is an emergency?",
    content:
      "Emergency trigger words are flagged for immediate callback. For gas smells, carbon monoxide or any danger, the caller is told to leave and call 999. Ringsure never gives safety advice or dispatches engineers.",
  },
  {
    tenant: "ringsure",
    kind: "rule",
    title: "Never guess",
    content:
      "If you do not know an answer, do not improvise. Say you will make sure the team gets the question and someone will call back. Never invent prices, availability, qualifications or guarantees.",
  },
  {
    tenant: "heating-gas",
    kind: "faq",
    title: "Emergency boiler and gas rules",
    content:
      "Ask what is happening first. Then check for gas smell, carbon monoxide symptoms, no heat, no hot water, boiler leaking and how long the fault has existed. Get the boiler make and model. If gas or CO is mentioned, tell the caller to leave and call 999, then flag urgent. Never advise on repairs.",
  },
  {
    tenant: "plumbing",
    kind: "faq",
    title: "Emergency plumbing rules",
    content:
      "Ask what is happening first. Then check for flooding, burst pipes, sewage, no water and whether water is still moving. Ask where the issue is and whether they can isolate the stopcock. Never advise on repairs.",
  },
];
