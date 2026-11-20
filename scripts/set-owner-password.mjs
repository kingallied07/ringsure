import { randomBytes, scryptSync } from "node:crypto";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

const password = process.argv[2];

if (!password || password.length < 12) {
  console.error("Usage: npm run owner:password -- 'your-strong-password' (minimum 12 characters)");
  process.exit(1);
}

const salt = randomBytes(16);
const hash = scryptSync(password, salt, 64);
const envFile = path.join(process.cwd(), ".env.local");
const existing = existsSync(envFile) ? readFileSync(envFile, "utf8").split(/\r?\n/) : [];

const lines = existing.filter(
  (line) => !line.startsWith("OWNER_PASSWORD_HASH=") && !line.startsWith("OWNER_SESSION_SECRET="),
);

lines.push(`OWNER_PASSWORD_HASH=${salt.toString("hex")}:${hash.toString("hex")}`);
if (!existing.some((line) => line.startsWith("OWNER_SESSION_SECRET="))) {
  lines.push(`OWNER_SESSION_SECRET=${randomBytes(32).toString("hex")}`);
}

writeFileSync(envFile, `${lines.filter(Boolean).join("\n")}\n`, "utf8");
console.log("Owner password updated in .env.local");
