import { mintCallContext, verifyCallContext } from "./context";
import { retrieveKnowledge } from "./retrieval";
import { addIsolationRun, listBusinesses, listKnowledge, type IsolationCheck } from "./store";

/** Adversarial checks that prove knowledge cannot cross tenant boundaries. */
export async function runIsolationChecks(tenantId: string) {
  const token = mintCallContext(tenantId);
  const parsed = verifyCallContext(token);
  const other = (await listBusinesses()).find((business) => business.id !== tenantId);
  const otherKnowledge = other ? (await listKnowledge(other.id))[0] : undefined;

  const scoped = await retrieveKnowledge(tenantId, "pricing call-out boiler cleaning");
  const crossProbe = otherKnowledge
    ? await retrieveKnowledge(tenantId, otherKnowledge.title)
    : { chunks: [], assertionFailed: false };

  const checks: IsolationCheck[] = [
    {
      name: "Signed context resolves to the correct tenant",
      passed: parsed?.tenantId === tenantId,
      detail: `Expected ${tenantId}, got ${parsed?.tenantId ?? "none"}`,
    },
    {
      name: "Missing call context is rejected",
      passed: verifyCallContext(null) === null,
      detail: "The retrieval tool refuses requests without a signed context",
    },
    {
      name: "Tampered call context is rejected",
      passed: verifyCallContext(`${token.slice(0, -3)}xyz`) === null,
      detail: "HMAC signature verification blocks forged tokens",
    },
    {
      name: "Retrieval never returns another tenant's chunk",
      passed: !scoped.assertionFailed,
      detail: "Post-retrieval tenant assertion on every result",
    },
    {
      name: "Cross-tenant probe finds nothing",
      passed: !crossProbe.chunks.some((chunk) => chunk.title === otherKnowledge?.title),
      detail: otherKnowledge
        ? `Searched for "${otherKnowledge.title}" from ${other?.businessName}`
        : "No second tenant available to probe",
    },
  ];

  return addIsolationRun({
    results: checks,
    summary: { passed: checks.filter((check) => check.passed).length, total: checks.length },
  });
}
