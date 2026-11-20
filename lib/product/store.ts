import { randomUUID } from "node:crypto";
import { promises as fs } from "node:fs";
import path from "node:path";
import { tradePresets, type Brief, type BriefData } from "./brief";
import type { Call, EvalRun } from "./types";

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
};

const dataDir = path.join(process.cwd(), ".data");
const storePath = path.join(dataDir, "product.json");

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
  };
}

async function readStore(): Promise<StoreShape> {
  try {
    const raw = await fs.readFile(storePath, "utf8");
    const parsed = JSON.parse(raw) as StoreShape;
    return { ...parsed, integration: parsed.integration ?? null };
  } catch {
    const fresh = seed();
    await writeStore(fresh);
    return fresh;
  }
}

async function writeStore(store: StoreShape) {
  await fs.mkdir(dataDir, { recursive: true });
  await fs.writeFile(storePath, JSON.stringify(store, null, 2), "utf8");
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
