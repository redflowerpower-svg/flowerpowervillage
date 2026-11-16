import { build } from "esbuild";
import { spawnSync } from "node:child_process";
import { mkdtempSync, readdirSync, rmSync } from "node:fs";
import { join, resolve } from "node:path";

const testsDir = resolve("tests/booking");
const testFiles = readdirSync(testsDir)
  .filter((name) => name.endsWith(".test.ts"))
  .sort()
  .map((name) => join(testsDir, name));

if (testFiles.length === 0) {
  console.error("Nessun file *.test.ts trovato in tests/booking");
  process.exit(1);
}

const outDir = mkdtempSync(resolve(".tmp-booking-tests-"));

try {
  await build({
    entryPoints: testFiles,
    outdir: outDir,
    bundle: true,
    platform: "node",
    format: "esm",
    packages: "external",
    outExtension: { ".js": ".mjs" },
    logLevel: "silent",
  });

  const compiledFiles = readdirSync(outDir)
    .filter((name) => name.endsWith(".mjs"))
    .sort()
    .map((name) => join(outDir, name));

  const res = spawnSync(process.execPath, ["--test", ...compiledFiles], {
    stdio: "inherit",
  });

  process.exitCode = res.status ?? 1;
} finally {
  rmSync(outDir, { recursive: true, force: true });
}
