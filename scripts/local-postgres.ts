import EmbeddedPostgres from "embedded-postgres";
import path from "path";

async function main() {
  const dataDir = path.join(process.cwd(), ".pgdata");
  const pg = new EmbeddedPostgres({
    databaseDir: dataDir,
    user: "postgres",
    password: "postgres",
    port: 5432,
    persistent: true,
    initdbFlags: ["--encoding=UTF8", "--locale=C"],
    onLog: (msg) => console.log("[postgres]", msg),
    onError: (err) => console.error("[postgres-error]", err),
  });

  console.log("Initializing embedded PostgreSQL in", dataDir);
  try {
    await pg.initialise();
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    if (!message.includes("already") && !message.includes("exists")) {
      console.log("Database directory may already be initialized:", message);
    }
  }

  await pg.start();
  console.log("PostgreSQL started on port 5432.");

  try {
    await pg.createDatabase("highveld_herbal");
    console.log("Created database 'highveld_herbal' (UTF8).");
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    if (!message.includes("already exists")) {
      console.log("Note on createDatabase:", message);
    }
  }

  console.log("PostgreSQL ready at postgresql://postgres:postgres@localhost:5432/highveld_herbal?schema=public");

  const shutdown = async () => {
    console.log("Stopping PostgreSQL...");
    await pg.stop();
    process.exit(0);
  };

  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);

  // Keep process alive
  setInterval(() => {}, 60_000);
}

main().catch((err) => {
  console.error("Failed to start embedded PostgreSQL:", err);
  process.exit(1);
});
