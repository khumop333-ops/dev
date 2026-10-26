import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import dbConfig from "./db-config.json";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
  pgPool: Pool | undefined;
};

function normalizeConnectionString(rawUrl: string): {
  connectionString: string;
  isLocal: boolean;
} {
  try {
    const parsed = new URL(rawUrl);
    const isLocal =
      parsed.hostname === "localhost" || parsed.hostname === "127.0.0.1";
    if (!isLocal) {
      parsed.searchParams.delete("sslmode");
      parsed.searchParams.delete("pgbouncer");
      // Always prefer Supavisor Transaction Mode (port 6543) in serverless environments
      // to avoid hitting the 15-connection ceiling of Session Mode (port 5432).
      if (
        parsed.hostname.endsWith(".pooler.supabase.com") &&
        parsed.port === "5432"
      ) {
        parsed.port = "6543";
      }
    }
    return { connectionString: parsed.toString(), isLocal };
  } catch {
    const isLocal =
      rawUrl.includes("localhost") || rawUrl.includes("127.0.0.1");
    return { connectionString: rawUrl, isLocal };
  }
}

function createPrismaClient(): PrismaClient {
  const rawUrl =
    dbConfig.connectionString ||
    process.env.DATABASE_URL ||
    "postgresql://postgres:postgres@localhost:5432/highveld_herbal?schema=public";

  const { connectionString, isLocal } = normalizeConnectionString(rawUrl);

  const pool =
    globalForPrisma.pgPool ??
    new Pool({
      connectionString,
      max: isLocal ? 10 : 2,
      idleTimeoutMillis: 5000,
      connectionTimeoutMillis: 15000,
      ssl: isLocal ? false : { rejectUnauthorized: false },
    });

  globalForPrisma.pgPool = pool;

  const adapter = new PrismaPg(pool);
  return new PrismaClient({ adapter });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();
globalForPrisma.prisma = prisma;
