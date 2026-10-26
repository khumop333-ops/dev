import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import pg from "pg";

const isVercel = Boolean(process.env.VERCEL);

if (isVercel) {
  console.log("Running on Vercel: generating standard Prisma Client...");
  execSync("npx prisma generate", { stdio: "inherit" });
} else {
  const env = {
    ...process.env,
    PRISMA_QUERY_ENGINE_LIBRARY: "/bin/true",
    PRISMA_SCHEMA_ENGINE_BINARY: "/bin/true",
  };

  execSync("npx prisma generate", { stdio: "inherit", env });

  const clientDir = path.join(process.cwd(), "node_modules/.prisma/client");

  // Patch wasm-worker-loader.mjs for Node 22 WebAssembly.Module compatibility
  const loaderPath = path.join(clientDir, "wasm-worker-loader.mjs");
  fs.writeFileSync(
    loaderPath,
    `import fs from "node:fs";
import path from "node:path";
const wasmPath = path.join(process.cwd(), "node_modules/.prisma/client/query_engine_bg.wasm");
const bytes = fs.readFileSync(wasmPath);
const mod = new WebAssembly.Module(bytes);
export default Promise.resolve({ default: mod });
`
  );

  // Route default index.js to wasm.js so standard '@prisma/client' imports work seamlessly with @prisma/adapter-pg
  const wasmJsPath = path.join(clientDir, "wasm.js");
  const indexJsPath = path.join(clientDir, "index.js");
  if (fs.existsSync(wasmJsPath)) {
    fs.copyFileSync(wasmJsPath, indexJsPath);
  }

  console.log("Prisma Client configured for PostgreSQL WASM + Driver Adapter.");
}

async function resolveAndSeedOnVercel() {
  if (!isVercel) return;

  const ref = process.env.SUPABASE_PROJECT_REF || "irlybtlgjlfpqbvghlvh";
  const pass = process.env.SUPABASE_DB_PASSWORD || "HighveldHerbal2026DbPass!";
  const encodedPass = encodeURIComponent(pass);

  // Prefer Supavisor Transaction Mode (port 6543, 200 concurrent connections) first
  const candidates = [
    `postgresql://postgres.${ref}:${encodedPass}@aws-0-eu-west-1.pooler.supabase.com:6543/postgres`,
    `postgresql://postgres.${ref}:${encodedPass}@aws-1-eu-west-1.pooler.supabase.com:6543/postgres`,
  ];

  if (process.env.DATABASE_URL) {
    candidates.push(process.env.DATABASE_URL);
  }

  candidates.push(
    `postgresql://postgres.${ref}:${encodedPass}@aws-0-eu-west-1.pooler.supabase.com:5432/postgres`,
    `postgresql://postgres.${ref}:${encodedPass}@aws-1-eu-west-1.pooler.supabase.com:5432/postgres`,
    `postgresql://postgres:${encodedPass}@db.${ref}.supabase.co:5432/postgres`
  );

  const uniqueCandidates = [...new Set(candidates)];
  let workingUrl = null;
  let categoryCount = 0;

  for (const url of uniqueCandidates) {
    const client = new pg.Client({
      connectionString: url,
      ssl: { rejectUnauthorized: false },
      connectionTimeoutMillis: 6000,
    });
    try {
      await client.connect();
      const res = await client.query('SELECT COUNT(*)::int AS cnt FROM "Category"');
      categoryCount = res.rows[0]?.cnt ?? 0;
      workingUrl = url;
      await client.end();
      console.log("Verified database connection on Vercel.");
      break;
    } catch (err) {
      try {
        await client.end();
      } catch {}
      console.warn(`Candidate DB connection failed (${err.message}), trying next...`);
    }
  }

  if (workingUrl) {
    const configPath = path.join(process.cwd(), "src/lib/db-config.json");
    fs.writeFileSync(
      configPath,
      JSON.stringify({ connectionString: workingUrl }, null, 2)
    );

    if (categoryCount === 0) {
      console.log("Database is empty on Vercel; running initial seed...");
      execSync("npx tsx prisma/seed.ts", {
        stdio: "inherit",
        env: { ...process.env, DATABASE_URL: workingUrl },
      });
    } else {
      console.log(`Database already seeded (${categoryCount} categories found).`);
    }
  } else {
    console.warn("Could not verify a candidate DB URL during build.");
  }
}

await resolveAndSeedOnVercel();
