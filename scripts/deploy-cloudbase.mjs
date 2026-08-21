import { readFileSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { resolve } from "node:path";

const ROOT = resolve(import.meta.dirname, "..");
const ENV_FILE = resolve(ROOT, ".env.local");

const REQUIRED_KEYS = [
  "DEEPSEEK_API_KEY",
  "DEEPSEEK_MODEL",
  "NEXT_PUBLIC_SUPABASE_URL",
  "SUPABASE_SERVICE_ROLE_KEY",
];

function parseEnvFile(filePath) {
  const content = readFileSync(filePath, "utf8");
  const values = {};

  for (const line of content.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) {
      continue;
    }

    const separatorIndex = trimmed.indexOf("=");
    if (separatorIndex === -1) {
      continue;
    }

    const key = trimmed.slice(0, separatorIndex).trim();
    const value = trimmed.slice(separatorIndex + 1).trim();
    values[key] = value;
  }

  return values;
}

function buildEnvParams(env) {
  return REQUIRED_KEYS.map((key) => {
    const value = env[key]?.trim();
    if (!value) {
      throw new Error(`缺少环境变量：${key}，请先写入 .env.local`);
    }
    return `${encodeURIComponent(key)}=${encodeURIComponent(value)}`;
  }).join("&");
}

const env = parseEnvFile(ENV_FILE);
const envParams = buildEnvParams(env);

console.log("将使用 .env.local 中的以下变量部署到 CloudBase：");
for (const key of REQUIRED_KEYS) {
  console.log(`- ${key}`);
}

const result = spawnSync(
  "npx",
  [
    "tcb",
    "cloudrun",
    "deploy",
    "-s",
    "ai-catering-assistant",
    "--port",
    "3000",
    "--force",
    "--envParams",
    envParams,
  ],
  {
    cwd: ROOT,
    stdio: "inherit",
    env: process.env,
  }
);

process.exit(result.status ?? 1);
