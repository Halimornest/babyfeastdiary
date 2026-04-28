#!/usr/bin/env node
const { spawnSync } = require("node:child_process");

const command = process.argv.slice(2);
if (command.length === 0) {
  console.error("Usage: node scripts/safe-db-command.js <command> [args...]");
  process.exit(1);
}

const env = process.env.VERCEL_ENV || process.env.NODE_ENV || "development";
const isProdLike = env === "production" || env === "preview";
const allow = process.env.ALLOW_PROD_DB_CHANGE === "true";

if (isProdLike && !allow) {
  console.error(
    "Blocked DB command on production-like environment. Set ALLOW_PROD_DB_CHANGE=true after backup verification."
  );
  process.exit(1);
}

const child = spawnSync(command[0], command.slice(1), {
  stdio: "inherit",
  shell: process.platform === "win32",
});

if (child.error) {
  console.error(child.error);
  process.exit(1);
}

process.exit(child.status ?? 1);
