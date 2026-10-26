import fs from "fs";
import path from "path";
import { Pool } from "pg";

async function main() {
  const connectionString =
    process.env.DATABASE_URL ||
    "postgresql://postgres:postgres@localhost:5432/highveld_herbal?schema=public";

  const pool = new Pool({ connectionString });
  const migrationPath = path.join(
    process.cwd(),
    "prisma/migrations/20261026000000_init/migration.sql"
  );

  const sql = fs.readFileSync(migrationPath, "utf-8");
  console.log("Applying migration 20261026000000_init to PostgreSQL...");
  await pool.query(sql);
  console.log("Database schema migration applied successfully.");
  await pool.end();
}

main().catch((err) => {
  console.error("Migration error:", err);
  process.exit(1);
});
