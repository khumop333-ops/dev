import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

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
