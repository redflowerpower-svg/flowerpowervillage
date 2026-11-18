import { describe, it } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

function collectSourceFiles(dirRel: string): string[] {
  const root = path.resolve(dirRel);
  if (!fs.existsSync(root)) return [];
  const results: string[] = [];

  function walk(current: string) {
    for (const entry of fs.readdirSync(current, { withFileTypes: true })) {
      const full = path.join(current, entry.name);
      if (entry.isDirectory()) {
        walk(full);
      } else if (/\.(ts|tsx|mts|cts)$/.test(entry.name)) {
        results.push(path.relative(process.cwd(), full).replace(/\\/g, "/"));
      }
    }
  }

  walk(root);
  return results.sort();
}

function extractLocalImports(fileRel: string): string[] {
  const abs = path.resolve(fileRel);
  const content = fs.readFileSync(abs, "utf8");
  const dir = path.posix.dirname(fileRel);
  const rawTargets: string[] = [];

  const staticPattern = /(?:from|import)\s+['"](\.[^'"]+)['"]/g;
  for (const m of content.matchAll(staticPattern)) {
    rawTargets.push(m[1]);
  }

  const dynamicPattern = /import\(\s*['"](\.[^'"]+)['"]\s*\)/g;
  for (const m of content.matchAll(dynamicPattern)) {
    rawTargets.push(m[1]);
  }

  return Array.from(
    new Set(
      rawTargets.map((spec) =>
        path.posix.normalize(path.posix.join(dir, spec)).replace(/\.(js|jsx|ts|tsx|mjs|mts|cjs|cts)$/, "")
      )
    )
  );
}

function stripExt(fileRel: string): string {
  return fileRel.replace(/\.(js|jsx|ts|tsx|mts|cts)$/, "");
}

describe("Firewall Architetturale & Compartimenti Stagni", () => {
  const apiFiles = collectSourceFiles("api");
  const srcFiles = collectSourceFiles("src");

  it("Purezza Layer Base Octorate & Indipendenza Sotto-Reparti", () => {
    const baseLayerFiles = [
      "api/_helpers/octorate-client.ts",
      "api/_helpers/octorate-structures.ts",
      "api/_helpers/octorate-catalog.ts",
    ];
    const forbiddenBusinessModules = [
      "api/_helpers/octorate-jungle-mirror",
      "api/_helpers/octorate-cascade-sync",
      "api/_helpers/octorate-minstay",
      "api/_helpers/octorate-closed-room-lock",
      "api/_helpers/octorate-auto-shield",
      "api/_helpers/octorate-move",
    ];

    const violations: string[] = [];

    for (const baseFile of baseLayerFiles) {
      for (const imp of extractLocalImports(baseFile)) {
        if (forbiddenBusinessModules.includes(imp)) {
          violations.push(`${baseFile} -> ${imp} (Layer Base non può dipendere dai motori di business)`);
        }
      }
    }

    const independentModules = [
      "api/_helpers/octorate-minstay.ts",
      "api/_helpers/octorate-closed-room-lock.ts",
      "api/_helpers/overbooking-detector.ts",
    ];
    for (const mod of independentModules) {
      for (const imp of extractLocalImports(mod)) {
        if (imp === "api/_helpers/octorate-jungle-mirror") {
          violations.push(`${mod} -> ${imp} (Modulo indipendente non può importare dal mirror)`);
        }
      }
    }

    for (const imp of extractLocalImports("api/_handlers/resort-sentinel.ts")) {
      if (imp === "api/_handlers/octorate-webhook" || imp === "api/_handlers/update-restriction") {
        violations.push(`api/_handlers/resort-sentinel.ts -> ${imp} (Handler non deve importare altro handler di restrizioni/webhook)`);
      }
    }

    for (const imp of extractLocalImports("api/_handlers/octorate-webhook.ts")) {
      if (imp === "api/_handlers/resort-sentinel" || imp === "api/_handlers/update-restriction") {
        violations.push(`api/_handlers/octorate-webhook.ts -> ${imp} (Handler webhook non può importare da sentinel/update-restriction)`);
      }
    }

    for (const file of apiFiles.filter((f) => f.startsWith("api/_helpers/"))) {
      for (const imp of extractLocalImports(file)) {
        if (imp.startsWith("api/_handlers/")) {
          violations.push(`${file} -> ${imp} (Helper non può importare Handler HTTP)`);
        }
      }
    }

    assert.deepEqual(violations, []);
  });

  it("Isolamento Stagno Macro-Reparti Backend (api/)", () => {
    const isVillageApi = (f: string) =>
      f.startsWith("api/_helpers/octorate-") ||
      f.startsWith("api/_handlers/octorate") ||
      [
        "api/_handlers/resort-sentinel.ts",
        "api/_handlers/update-restriction.ts",
        "api/_handlers/update-rateplan-restrictions-bulk.ts",
        "api/_handlers/api-update-prices-stagionale.ts",
      ].includes(f);

    const isPizzaTarget = (imp: string) =>
      /^api\/_(handlers|helpers)\/(pizza-|dining-|table-reservation)/.test(imp);
    const isSocialTarget = (imp: string) =>
      /^api\/_(handlers|helpers)\/social/.test(imp);
    const isDocsTarget = (imp: string) =>
      imp === "api/_handlers/documents-api" || imp === "api/_handlers/reader";
    const isVillageTarget = (imp: string) =>
      /^api\/_(handlers|helpers)\/(octorate|resort-sentinel)/.test(imp);

    const isPizzaApi = (f: string) =>
      /^api\/_(handlers|helpers)\/(pizza-|dining-|table-reservation)/.test(f);
    const isDocsApi = (f: string) =>
      f === "api/_handlers/documents-api.ts" || f === "api/_handlers/reader.ts";
    const isSocialApi = (f: string) =>
      ["api/_handlers/social-publisher.ts", "api/_handlers/social-callback.ts", "api/_handlers/socialDb.ts"].includes(f);

    const violations: string[] = [];

    for (const f of apiFiles) {
      const imports = extractLocalImports(f);

      if (isVillageApi(f)) {
        for (const imp of imports) {
          if (isPizzaTarget(imp) || isSocialTarget(imp) || isDocsTarget(imp)) {
            violations.push(`${f} (Villaggio) -> ${imp}`);
          }
        }
      }

      if (isPizzaApi(f)) {
        for (const imp of imports) {
          if (isVillageTarget(imp) || isSocialTarget(imp) || isDocsTarget(imp)) {
            violations.push(`${f} (Pizzeria) -> ${imp}`);
          }
        }
      }

      if (isDocsApi(f)) {
        for (const imp of imports) {
          if (isVillageTarget(imp) || isPizzaTarget(imp) || isSocialTarget(imp)) {
            violations.push(`${f} (Docs) -> ${imp}`);
          }
        }
      }

      if (isSocialApi(f)) {
        for (const imp of imports) {
          if (isVillageTarget(imp) || isPizzaTarget(imp) || isDocsTarget(imp)) {
            violations.push(`${f} (Social) -> ${imp}`);
          }
        }
      }
    }

    assert.deepEqual(violations, []);
  });

  it("Isolamento Stagno Macro-Reparti Frontend (src/)", () => {
    const isVillageSrc = (f: string) =>
      f.startsWith("src/booking/") || f.startsWith("src/admin/resort/");
    const isPizzaSrc = (f: string) =>
      f.startsWith("src/pizza/") || f.startsWith("src/admin/pizza/");
    const isDocsSrc = (f: string) =>
      [
        "src/lib/documentExtractor.ts",
        "src/lib/documentStore.ts",
        "src/admin/components/DocumentReaderStudio.tsx",
        "src/pages/DocumentReaderPage.tsx",
      ].includes(f);

    const isVillageTarget = (imp: string) =>
      imp.startsWith("src/booking/") || imp.startsWith("src/admin/resort/");
    const isPizzaTarget = (imp: string) =>
      imp.startsWith("src/pizza/") || imp.startsWith("src/admin/pizza/");
    const isSocialTarget = (imp: string) => imp.startsWith("src/social/");
    const isDocsTarget = (imp: string) =>
      imp.startsWith("src/lib/document") ||
      imp === "src/admin/components/DocumentReaderStudio" ||
      imp === "src/pages/DocumentReaderPage";

    const ALLOWED_READONLY_CATALOG_BRIDGES = new Set([
      "src/admin/resort/components/VillageWineManager.tsx -> src/pizza/data/wineData",
      "src/admin/resort/components/VillageWineManager.tsx -> src/pizza/data/wineCloudService",
    ]);

    const violations: string[] = [];

    for (const f of srcFiles) {
      const imports = extractLocalImports(f);

      if (isVillageSrc(f)) {
        for (const imp of imports) {
          if (ALLOWED_READONLY_CATALOG_BRIDGES.has(`${f} -> ${imp}`)) continue;
          if (isPizzaTarget(imp) || isSocialTarget(imp) || isDocsTarget(imp)) {
            violations.push(`${f} (Villaggio) -> ${imp}`);
          }
        }
      }

      if (isPizzaSrc(f)) {
        for (const imp of imports) {
          if (isVillageTarget(imp) || isSocialTarget(imp) || isDocsTarget(imp)) {
            violations.push(`${f} (Pizzeria) -> ${imp}`);
          }
        }
      }

      if (isDocsSrc(f)) {
        for (const imp of imports) {
          if (isVillageTarget(imp) || isPizzaTarget(imp) || isSocialTarget(imp)) {
            violations.push(`${f} (Docs) -> ${imp}`);
          }
        }
      }
    }

    // Anche il resto dei target su src/non-social verifica zero import verso social fuori dal router principale
    assert.deepEqual(violations, []);
  });

  it("Isolamento Sotto-Reparti Interni Pizzeria (Delivery vs Sala /dining vs Cucina /kitchen & Purezza Layer Base)", () => {
    const deliveryFiles = [
      "src/pizza/pages/DeliveryMenu.tsx",
      "src/pizza/components/CheckoutFlow.tsx",
      "src/pizza/store/locationStore.ts",
      "src/pizza/utils/validation.ts",
      "src/pizza/utils/distance.ts",
      "src/pizza/utils/geofence.ts",
      "src/pizza/services/firstOrderService.ts",
      "src/pizza/services/omiseClient.ts",
    ];
    const diningFiles = [
      "src/pizza/pages/DiningTabletSite.tsx",
      "src/pizza/components/DiningCheckoutModal.tsx",
      "src/pizza/components/DiningQrModal.tsx",
      "src/pizza/components/TableSettlementModal.tsx",
      "src/pizza/components/DiningAdminAuth.tsx",
      "src/pizza/utils/tableUtils.ts",
      "src/pizza/services/diningSessionService.ts",
      "src/pizza/services/diningLiveCartService.ts",
      "src/pizza/services/diningTablePresenceService.ts",
    ];
    const kitchenFiles = [
      "src/admin/pizza/components/KitchenTabletKDS.tsx",
      "src/admin/pizza/components/KitchenAdminAuth.tsx",
      "src/admin/pizza/components/KitchenDishAvailabilityModal.tsx",
      "src/admin/pizza/utils/kdsExtraDictionary.ts",
      "src/admin/pizza/utils/kdsCatalogService.ts",
      "src/admin/pizza/utils/kdsI18n.ts",
      "src/admin/pizza/utils/kitchenAudioWakeLock.ts",
    ];
    const pizzaBaseLayerFiles = [
      "src/pizza/utils/distance.ts",
      "src/pizza/utils/geofence.ts",
      "src/pizza/utils/validation.ts",
      "src/pizza/utils/tableUtils.ts",
      "src/pizza/utils/orderMetadata.ts",
      "src/pizza/utils/dietary.ts",
      "src/pizza/config/languages.ts",
      "src/pizza/data/menuData.ts",
      "src/pizza/data/wineData.tsx",
    ];

    const deliveryOnlyTargets = new Set([
      "src/pizza/pages/DeliveryMenu",
      "src/pizza/components/CheckoutFlow",
      "src/pizza/store/locationStore",
      "src/pizza/utils/validation",
      "src/pizza/utils/distance",
      "src/pizza/utils/geofence",
      "src/pizza/services/firstOrderService",
      "src/pizza/services/omiseClient",
    ]);
    const diningOnlyTargets = new Set([
      "src/pizza/pages/DiningTabletSite",
      "src/pizza/components/DiningCheckoutModal",
      "src/pizza/components/DiningQrModal",
      "src/pizza/components/TableSettlementModal",
      "src/pizza/components/DiningAdminAuth",
      "src/pizza/utils/tableUtils",
      "src/pizza/services/diningSessionService",
      "src/pizza/services/diningLiveCartService",
      "src/pizza/services/diningTablePresenceService",
      "src/admin/pizza/components/DiningTableQrStudio",
    ]);
    const diningUiTargets = new Set([
      "src/pizza/pages/DiningTabletSite",
      "src/pizza/components/DiningCheckoutModal",
      "src/pizza/components/TableSettlementModal",
    ]);
    const kitchenOnlyTargets = new Set([
      "src/admin/pizza/components/KitchenTabletKDS",
      "src/admin/pizza/components/KitchenAdminAuth",
      "src/admin/pizza/components/KitchenDishAvailabilityModal",
      "src/admin/pizza/utils/kdsExtraDictionary",
      "src/admin/pizza/utils/kdsCatalogService",
      "src/admin/pizza/utils/kdsI18n",
      "src/admin/pizza/utils/kitchenAudioWakeLock",
    ]);

    const violations: string[] = [];

    for (const file of deliveryFiles) {
      for (const imp of extractLocalImports(file)) {
        if (diningOnlyTargets.has(imp) || kitchenOnlyTargets.has(imp)) {
          violations.push(`${file} (Delivery) -> ${imp}`);
        }
      }
    }

    for (const file of diningFiles) {
      for (const imp of extractLocalImports(file)) {
        if (deliveryOnlyTargets.has(imp) || kitchenOnlyTargets.has(imp)) {
          violations.push(`${file} (Dining) -> ${imp}`);
        }
      }
    }

    for (const file of kitchenFiles) {
      for (const imp of extractLocalImports(file)) {
        if (deliveryOnlyTargets.has(imp) || diningUiTargets.has(imp)) {
          violations.push(`${file} (Kitchen) -> ${imp}`);
        }
      }
    }

    for (const file of pizzaBaseLayerFiles) {
      for (const imp of extractLocalImports(file)) {
        if (
          imp.startsWith("src/pizza/pages/") ||
          imp.startsWith("src/pizza/components/") ||
          imp.startsWith("src/admin/") ||
          imp.startsWith("src/pizza/store/")
        ) {
          violations.push(`${file} (Layer Base Pizzeria) -> ${imp}`);
        }
      }
    }

    assert.deepEqual(violations, []);
  });

  it("Isolamento Stagno TikTokAuditStudioPage.tsx (Regola 5 Social Studio)", () => {
    const localImports = extractLocalImports("src/social/pages/TikTokAuditStudioPage.tsx");
    assert.deepEqual(localImports, []);
  });
});
