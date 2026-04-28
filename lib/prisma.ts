import { PrismaClient } from "@/app/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const globalForPrisma = globalThis as unknown as {
  prismaAdapter: PrismaPg | undefined;
  prisma: PrismaClient | undefined;
};

function buildPgConfig() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error("DATABASE_URL is not set");
  }

  const parsed = new URL(url);
  const sslMode = parsed.searchParams.get("sslmode");
  const maxPoolSize = Number(process.env.DB_POOL_MAX ?? "1");

  return {
    host: parsed.hostname,
    port: parsed.port ? Number(parsed.port) : 5432,
    user: decodeURIComponent(parsed.username),
    password: decodeURIComponent(parsed.password || ""),
    database: decodeURIComponent(parsed.pathname.replace(/^\//, "") || "postgres"),
    max: Number.isFinite(maxPoolSize) && maxPoolSize > 0 ? maxPoolSize : 1,
    idleTimeoutMillis: 30_000,
    connectionTimeoutMillis: 10_000,
    ssl:
      sslMode === "disable"
        ? undefined
        : { rejectUnauthorized: false as const },
  };
}

function getPrismaAdapter() {
  if (globalForPrisma.prismaAdapter) {
    return globalForPrisma.prismaAdapter;
  }
  const adapter = new PrismaPg(buildPgConfig());
  globalForPrisma.prismaAdapter = adapter;
  return adapter;
}

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({ adapter: getPrismaAdapter() });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
