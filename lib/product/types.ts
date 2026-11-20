export type Utterance = {
  speaker: "ai" | "caller";
  text: string;
};

export type Lead = {
  name: string;
  phone: string;
  postcode: string;
  jobType: string;
  urgency: "urgent" | "standard";
  notes: string;
  capturedAt: string;
};

export type Call = {
  id: string;
  providerCallId?: string;
  businessId: string;
  fromNumber: string;
  scenario: string;
  startedAt: string;
  endedAt: string;
  durationSeconds: number;
  transcript: Utterance[];
  lead: Lead | null;
  disclosureSpoken: boolean;
  emergencyFlagged: boolean;
  transferred: boolean;
  booked: boolean;
};

export type EvalCheck = {
  key: string;
  passed: boolean;
  detail: string;
};

export type EvalResult = {
  scenario: string;
  passed: boolean;
  checks: EvalCheck[];
};

export type EvalRun = {
  id: string;
  ranAt: string;
  results: EvalResult[];
  summary: { passed: number; total: number };
};
