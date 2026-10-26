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
      max: 10,
      ssl: isLocal ? false : { rejectUnauthorized: false },
    });

  if (process.env.NODE_ENV !== "production") {
    globalForPrisma.pgPool = pool;
  }

  const adapter = new PrismaPg(pool);
  return new PrismaClient({ adapter });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
