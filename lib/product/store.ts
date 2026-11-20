import { randomUUID } from "node:crypto";
import { promises as fs } from "node:fs";
import os from "node:os";
import path from "node:path";
import { tradePresets, type Brief, type BriefData } from "./brief";
import type { Call, EvalRun, Utterance } from "./types";

export type KnowledgeKind = "faq" | "website" | "pricing" | "rule" | "note";

export type KnowledgeChunk = {
  id: string;
  tenantId: string;
  kind: KnowledgeKind;
  title: string;
  content: string;
  createdAt: string;
};

export type UnansweredQuestion = {
  id: string;
  tenantId: string;
  callId: string;
  question: string;
  createdAt: string;
  status: "open" | "resolved";
};

export type QaReview = {
  id: string;
  tenantId: string;
  callId: string;
  score: number;
  notes: string;
  createdAt: string;
};

export type Prospect = {
  id: string;
  businessName: string;
  phone: string;
  trade: string;
  status: "new" | "contacted" | "interested" | "pilot" | "do-not-call";
  notes: string;
  createdAt: string;
};

export type OutreachCall = {
  id: string;
  prospectId: string;
  scenario: string;
  transcript: Utterance[];
  outcome: string;
  disclosureSpoken: boolean;
  createdAt: string;
};

export type IsolationCheck = { name: string; passed: boolean; detail: string };

export type IsolationRun = {
  id: string;
  ranAt: string;
  results: IsolationCheck[];
  summary: { passed: number; total: number };
};

export type IntegrationState = {
  provider: "mock" | "retell";
  llmId?: string;
  agentId?: string;
  twilioNumberSid?: string;
  provisionedAt?: string;
  voiceId?: string;
};

type StoreShape = {
  businesses: Brief[];
  calls: Call[];
  evalRuns: EvalRun[];
  integration: IntegrationState | null;
  knowledge: KnowledgeChunk[];
  unanswered: UnansweredQuestion[];
  qaReviews: QaReview[];
  prospects: Prospect[];
  outreachCalls: OutreachCall[];
  isolationRuns: IsolationRun[];
};

const onServerless = Boolean(
  process.env.NETLIFY || process.env.AWS_LAMBDA_FUNCTION_NAME || process.env.VERCEL,
);
const dataDir = onServerless
  ? path.join(os.tmpdir(), "ringsure-product")
  : path.join(process.cwd(), ".data");
const storePath = path.join(dataDir, "product.json");

// Serverless filesystems are read-only and ephemeral. Keep a memory copy as a
// fallback so a failed write never takes down a page or API route.
let memory: StoreShape | null = null;
let memoryOnly = false;

function seed(): StoreShape {
  const now = new Date().toISOString();
  const make = (id: string, businessName: string, trade: keyof typeof tradePresets): Brief => ({
    id,
    businessName,
    ...tradePresets[trade],
    updatedAt: now,
  });

  return {
    businesses: [
      make("heatwise", "Heatwise Heating & Gas", "heating-gas"),
      make("apex-plumbing", "Apex Plumbing", "plumbing"),
      make("bright-clean", "Bright & Clean", "cleaning"),
    ],
    calls: [],
    evalRuns: [],
    integration: null,
    knowledge: [
      {
        id: "k_heat_1",
        tenantId: "heatwise",
        kind: "pricing",
        title: "Heating call-out and service prices",
        content:
          "Heatwise Heating & Gas: no call-out charge within 10 miles of Leeds. Boiler service £89. Landlord gas safety certificate £75. Emergency boiler repair quoted after assessment — never quote a final price on the phone.",
        createdAt: now,
      },
      {
        id: "k_heat_2",
        tenantId: "heatwise",
        kind: "faq",
        title: "Do you work weekends?",
        content:
          "Yes. Heatwise covers Leeds, Bradford and Wakefield seven days a week, 7am to 8pm. Emergency boiler callouts are prioritised over routine servicing.",
        createdAt: now,
      },
      {
        id: "k_apex_1",
        tenantId: "apex-plumbing",
        kind: "pricing",
        title: "Apex Plumbing pricing",
        content:
          "Apex Plumbing charges a £45 call-out fee, refunded if you go ahead. Blocked drains start at £120. Apex does not fit complete bathrooms — refer those to a partner.",
        createdAt: now,
      },
      {
        id: "k_bright_1",
        tenantId: "bright-clean",
        kind: "pricing",
        title: "Bright & Clean pricing",
        content:
          "Bright & Clean: end of tenancy cleans from £180 for a two-bed flat. Regular weekly cleaning from £16 per hour. Carpets and ovens are charged separately.",
        createdAt: now,
      },
    ],
    unanswered: [],
    qaReviews: [],
    prospects: [
      {
        id: "p_1",
        businessName: "Northside Gas & Heating",
        phone: "+44 161 555 0101",
        trade: "Heating & Gas",
        status: "new",
        notes: "Found via Google Maps — misses calls while engineers are out.",
        createdAt: now,
      },
      {
        id: "p_2",
        businessName: "Rapid Rooter Plumbing",
        phone: "+44 161 555 0102",
        trade: "Plumbing",
        status: "new",
        notes: "Two vans, no receptionist. Good pilot candidate.",
        createdAt: now,
      },
      {
        id: "p_3",
        businessName: "Clean Sweep Ltd",
        phone: "+44 117 555 0103",
        trade: "Cleaning",
        status: "contacted",
        notes: "Sent pilot email — follow up next week.",
        createdAt: now,
      },
    ],
    outreachCalls: [],
    isolationRuns: [],
  };
}

function normalise(parsed: Partial<StoreShape>): StoreShape {
  return {
    businesses: parsed.businesses ?? [],
    calls: parsed.calls ?? [],
    evalRuns: parsed.evalRuns ?? [],
    integration: parsed.integration ?? null,
    knowledge: parsed.knowledge ?? [],
    unanswered: parsed.unanswered ?? [],
    qaReviews: parsed.qaReviews ?? [],
    prospects: parsed.prospects ?? [],
    outreachCalls: parsed.outreachCalls ?? [],
    isolationRuns: parsed.isolationRuns ?? [],
  };
}

async function readStore(): Promise<StoreShape> {
  if (memoryOnly && memory) return memory;

  try {
    const raw = await fs.readFile(storePath, "utf8");
    return normalise(JSON.parse(raw) as Partial<StoreShape>);
  } catch {
    if (!memory) memory = seed();
    return memory;
  }
}

async function writeStore(store: StoreShape) {
  memory = store;
  try {
    await fs.mkdir(dataDir, { recursive: true });
    await fs.writeFile(storePath, JSON.stringify(store, null, 2), "utf8");
  } catch {
    // Read-only or ephemeral filesystem — keep serving from memory.
    memoryOnly = true;
  }
}

export async function listBusinesses() {
  return (await readStore()).businesses;
}

export async function getBusiness(id: string) {
  return (await readStore()).businesses.find((b) => b.id === id) ?? null;
}

export async function saveBrief(id: string, data: BriefData) {
  const store = await readStore();
  const index = store.businesses.findIndex((b) => b.id === id);
  const updated: Brief = { ...data, id, updatedAt: new Date().toISOString() };

  if (index === -1) {
    store.businesses.push(updated);
  } else {
    store.businesses[index] = updated;
  }
  await writeStore(store);
  return updated;
}

export async function createBusiness(data: BriefData) {
  const store = await readStore();
  const brief: Brief = {
    ...data,
    id: randomUUID().slice(0, 8),
    updatedAt: new Date().toISOString(),
  };
  store.businesses.push(brief);
  await writeStore(store);
  return brief;
}

export async function listCalls(businessId?: string) {
  const calls = (await readStore()).calls;
  return businessId ? calls.filter((c) => c.businessId === businessId) : calls;
}

export async function saveCall(call: Omit<Call, "id">) {
  const store = await readStore();
  const saved: Call = { ...call, id: randomUUID().slice(0, 8) };
  store.calls.unshift(saved);
  await writeStore(store);
  return saved;
}

export async function listEvalRuns() {
  return (await readStore()).evalRuns;
}

export async function saveEvalRun(run: Omit<EvalRun, "id" | "ranAt">) {
  const store = await readStore();
  const saved: EvalRun = {
    ...run,
    id: randomUUID().slice(0, 8),
    ranAt: new Date().toISOString(),
  };
  store.evalRuns.unshift(saved);
  await writeStore(store);
  return saved;
}

export async function getIntegration() {
  return (await readStore()).integration;
}

export async function saveIntegration(integration: IntegrationState) {
  const store = await readStore();
  store.integration = integration;
  await writeStore(store);
  return integration;
}

export async function findBusinessByNumber(phoneNumber: string) {
  const businesses = (await readStore()).businesses;
  const normalise = (value: string) => value.replace(/[^\d+]/g, "");
  const target = normalise(phoneNumber);
  return businesses.find((b) => normalise(b.phoneNumber) === target) ?? null;
}

export async function tenantExists(tenantId: string) {
  return Boolean((await readStore()).businesses.some((b) => b.id === tenantId));
}

export async function listKnowledge(tenantId?: string) {
  const all = (await readStore()).knowledge;
  return tenantId ? all.filter((item) => item.tenantId === tenantId) : all;
}

export async function addKnowledge(item: Omit<KnowledgeChunk, "id" | "createdAt">) {
  const store = await readStore();
  const chunk: KnowledgeChunk = { ...item, id: randomUUID().slice(0, 8), createdAt: new Date().toISOString() };
  store.knowledge.unshift(chunk);
  await writeStore(store);
  return chunk;
}

export async function deleteKnowledge(id: string, tenantId: string) {
  const store = await readStore();
  store.knowledge = store.knowledge.filter((item) => !(item.id === id && item.tenantId === tenantId));
  await writeStore(store);
}

export async function listUnanswered(tenantId?: string) {
  const all = (await readStore()).unanswered;
  return tenantId ? all.filter((item) => item.tenantId === tenantId) : all;
}

export async function addUnanswered(item: { tenantId: string; callId: string; question: string }) {
  const store = await readStore();
  const entry: UnansweredQuestion = {
    ...item,
    id: randomUUID().slice(0, 8),
    createdAt: new Date().toISOString(),
    status: "open",
  };
  store.unanswered.unshift(entry);
  await writeStore(store);
  return entry;
}

export async function resolveUnanswered(id: string) {
  const store = await readStore();
  const item = store.unanswered.find((q) => q.id === id);
  if (item) item.status = "resolved";
  await writeStore(store);
  return item ?? null;
}

export async function listQaReviews(tenantId?: string) {
  const all = (await readStore()).qaReviews;
  return tenantId ? all.filter((item) => item.tenantId === tenantId) : all;
}

export async function addQaReview(item: Omit<QaReview, "id" | "createdAt">) {
  const store = await readStore();
  const review: QaReview = { ...item, id: randomUUID().slice(0, 8), createdAt: new Date().toISOString() };
  store.qaReviews.unshift(review);
  await writeStore(store);
  return review;
}

export async function listProspects() {
  return (await readStore()).prospects;
}

export async function addProspect(item: Omit<Prospect, "id" | "createdAt" | "status"> & { status?: Prospect["status"] }) {
  const store = await readStore();
  const prospect: Prospect = {
    ...item,
    status: item.status ?? "new",
    id: randomUUID().slice(0, 8),
    createdAt: new Date().toISOString(),
  };
  store.prospects.unshift(prospect);
  await writeStore(store);
  return prospect;
}

export async function updateProspectStatus(id: string, status: Prospect["status"]) {
  const store = await readStore();
  const prospect = store.prospects.find((p) => p.id === id);
  if (prospect) prospect.status = status;
  await writeStore(store);
  return prospect ?? null;
}

export async function listOutreachCalls() {
  return (await readStore()).outreachCalls;
}

export async function addOutreachCall(call: Omit<OutreachCall, "id" | "createdAt">) {
  const store = await readStore();
  const saved: OutreachCall = { ...call, id: randomUUID().slice(0, 8), createdAt: new Date().toISOString() };
  store.outreachCalls.unshift(saved);
  await writeStore(store);
  return saved;
}

export async function listIsolationRuns() {
  return (await readStore()).isolationRuns;
}

export async function addIsolationRun(run: Omit<IsolationRun, "id" | "ranAt">) {
  const store = await readStore();
  const saved: IsolationRun = { ...run, id: randomUUID().slice(0, 8), ranAt: new Date().toISOString() };
  store.isolationRuns.unshift(saved);
  await writeStore(store);
  return saved;
}
