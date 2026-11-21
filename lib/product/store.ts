import { randomUUID } from "node:crypto";
import { promises as fs } from "node:fs";
import os from "node:os";
import path from "node:path";
import { tradePresets, type Brief, type BriefData } from "./brief";
import { BUILT_IN_KNOWLEDGE } from "./knowledge";
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
  contactName?: string;
  targetRole?: string;
  trade: string;
  status: "new" | "contacted" | "interested" | "pilot" | "do-not-call";
  notes: string;
  createdAt: string;
};

export type OutreachCall = {
  id: string;
  prospectId: string;
  providerCallId?: string;
  recordingUrl?: string;
  mode: "mock" | "live";
  status: "dialling" | "completed" | "failed";
  scenario: string;
  transcript: Utterance[];
  outcome: string;
  summary?: string;
  disclosureSpoken: boolean;
  createdAt: string;
};

export type BatchState = {
  running: boolean;
  queue: string[];
  cursor: number;
  startedAt?: string;
  lastProspect?: string;
  lastError?: string;
};

export type IsolationCheck = { name: string; passed: boolean; detail: string };

export type CallWindow = {
  id: string;
  label: string;
  days: number[];
  start: string;
  end: string;
  timezone: string;
  notBefore?: string;
  enabled: boolean;
};

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
  callWindows: CallWindow[];
  batch: BatchState;
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

async function blobStore() {
  const { getStore } = await import("@netlify/blobs");
  return getStore("ringsure-product", { consistency: "strong" });
}

function withTimeout<T>(promise: Promise<T>, ms = 4000): Promise<T> {
  return Promise.race([
    promise,
    new Promise<never>((_, reject) => setTimeout(() => reject(new Error("store timeout")), ms)),
  ]);
}

function defaultCallWindow(): CallWindow {
  const date = new Date();
  date.setDate(date.getDate() + 1);
  date.setHours(8, 30, 0, 0);
  return {
    id: "w_outreach",
    label: "Outreach — weekday mornings",
    days: [1, 2, 3, 4, 5],
    start: "08:30",
    end: "17:00",
    timezone: "Europe/London",
    notBefore: date.toISOString(),
    enabled: true,
  };
}

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
      make("ringsure", "Ringsure", "ringsure"),
      make("heatwise", "Heatwise Heating & Gas", "heating-gas"),
      make("apex-plumbing", "Apex Plumbing", "plumbing"),
      make("bright-clean", "Bright & Clean", "cleaning"),
    ],
    calls: [],
    evalRuns: [],
    integration: null,
    knowledge: [
      ...BUILT_IN_KNOWLEDGE.map((item, index) => ({
        id: `builtin_${index}`,
        tenantId: item.tenant,
        kind: item.kind,
        title: item.title,
        content: item.content,
        createdAt: now,
      })),
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
    callWindows: [defaultCallWindow()],
    batch: { running: false, queue: [], cursor: 0 },
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
    callWindows: parsed.callWindows ?? [],
    batch: parsed.batch ?? { running: false, queue: [], cursor: 0 },
  };
}

async function readStore(): Promise<StoreShape> {
  if (onServerless) {
    try {
      const blobs = await withTimeout(blobStore());
      const stored = (await withTimeout(blobs.get("product", { type: "json" }))) as StoreShape | null;
      if (stored) return normalise(stored);
      const fresh = seed();
      await withTimeout(blobs.setJSON("product", fresh));
      return fresh;
    } catch (error) {
      console.error("Netlify Blobs read failed:", error);
      throw new Error("Shared store unavailable — refusing to serve stale data");
    }
  }

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

  if (onServerless) {
    try {
      const blobs = await withTimeout(blobStore());
      await withTimeout(blobs.setJSON("product", store));
    } catch (error) {
      console.error("Netlify Blobs write failed:", error);
      throw new Error("Shared store write failed — refusing to report success");
    }
    return;
  }

  try {
    await fs.mkdir(dataDir, { recursive: true });
    await fs.writeFile(storePath, JSON.stringify(store, null, 2), "utf8");
  } catch {
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
  // Environment variables survive redeploys; the shared store may not.
  const envAgent = process.env.RETELL_AGENT_ID?.trim();
  const envLlm = process.env.RETELL_LLM_ID?.trim();
  if (envAgent && envLlm) {
    return {
      provider: "retell" as const,
      llmId: envLlm,
      agentId: envAgent,
      voiceId: process.env.RETELL_VOICE_ID?.trim() || undefined,
      provisionedAt: "from environment",
    };
  }
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

export async function syncBuiltInKnowledge() {
  const store = await readStore();
  let updated = 0;
  let added = 0;

  for (const item of BUILT_IN_KNOWLEDGE) {
    const existing = store.knowledge.find(
      (chunk) => chunk.tenantId === item.tenant && chunk.title === item.title,
    );
    if (existing) {
      existing.content = item.content;
      existing.kind = item.kind;
      updated += 1;
    } else {
      store.knowledge.unshift({
        id: randomUUID().slice(0, 8),
        tenantId: item.tenant,
        kind: item.kind,
        title: item.title,
        content: item.content,
        createdAt: new Date().toISOString(),
      });
      added += 1;
    }
  }

  await writeStore(store);
  return { updated, added };
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

export async function updateProspect(
  id: string,
  patch: Partial<Omit<Prospect, "id" | "createdAt">>,
) {
  const store = await readStore();
  const prospect = store.prospects.find((p) => p.id === id);
  if (!prospect) return null;
  Object.assign(prospect, Object.fromEntries(
    Object.entries(patch).filter(([, value]) => value !== undefined),
  ));
  await writeStore(store);
  return prospect;
}

export async function updateProspectStatus(id: string, status: Prospect["status"]) {
  return updateProspect(id, { status });
}

export async function dedupeProspects() {
  const store = await readStore();
  const seen = new Set<string>();
  const kept: Prospect[] = [];

  for (const prospect of store.prospects) {
    const key = prospect.businessName.trim().toLowerCase().replace(/[^a-z0-9]/g, "");
    if (seen.has(key)) continue;
    seen.add(key);
    kept.push(prospect);
  }

  const removed = store.prospects.length - kept.length;
  store.prospects = kept;
  if (removed > 0) await writeStore(store);
  return { removed, remaining: kept.length };
}

export async function deleteProspect(id: string) {
  const store = await readStore();
  store.prospects = store.prospects.filter((p) => p.id !== id);
  await writeStore(store);
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

export async function findOutreachCallByProviderId(providerCallId: string) {
  return (await readStore()).outreachCalls.find((call) => call.providerCallId === providerCallId) ?? null;
}

export async function updateOutreachCall(
  id: string,
  patch: Partial<Omit<OutreachCall, "id" | "createdAt">>,
) {
  const store = await readStore();
  const call = store.outreachCalls.find((item) => item.id === id);
  if (!call) return null;
  Object.assign(call, Object.fromEntries(Object.entries(patch).filter(([, value]) => value !== undefined)));
  await writeStore(store);
  return call;
}

export async function getBatchState() {
  return (await readStore()).batch;
}

export async function saveBatchState(batch: BatchState) {
  const store = await readStore();
  store.batch = batch;
  await writeStore(store);
  return batch;
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

export async function listCallWindows() {
  const store = await readStore();
  if (!store.callWindows.length) {
    const fallback = defaultCallWindow();
    store.callWindows = [fallback];
    await writeStore(store);
    return [fallback];
  }
  return store.callWindows;
}

export async function saveCallWindow(window: CallWindow) {
  const store = await readStore();
  const index = store.callWindows.findIndex((item) => item.id === window.id);
  if (index === -1) store.callWindows.push(window);
  else store.callWindows[index] = window;
  await writeStore(store);
  return window;
}

export async function addProspectsBulk(
  items: { businessName: string; phone: string; contactName?: string; targetRole?: string; trade: string }[],
) {
  const store = await readStore();
  const now = new Date().toISOString();
  const created: Prospect[] = items.map((item) => ({
    ...item,
    notes: "",
    status: "new",
    id: randomUUID().slice(0, 8),
    createdAt: now,
  }));
  store.prospects = [...created, ...store.prospects];
  await writeStore(store);
  return created;
}
