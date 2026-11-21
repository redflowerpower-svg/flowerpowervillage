import { describe, it } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

import {
  VILLAGE_WEBSITE_TRAJECTORIES,
  getVillageAccommodationTrajectory,
} from "../../src/social/services/visualMotionEngine.js";
import {
  ELIGIBLE_FOOD_CATEGORIES,
  ELIGIBLE_RESTAURANT_CATEGORIES,
  EXCLUDED_BEVERAGE_CATEGORY_IDS,
  VILLAGE_LODGINGS,
  computePreFadeThumbnailTimestamp,
  formatSemanticEnglishDishTitle,
  formatSemanticThaiDishTitle,
  generateP1Test,
  generateP2Test,
  generateP3Test,
  generateV2Test,
  getCleanDishTitles,
  isBathroomPhoto,
  isDishAvailableInKitchen,
  isExcludedBeverageCategory,
  isExcludedSaladCategory,
  resolveInitialAutoCutMode,
  shouldRegenerateModeAfterKitchenLoad,
} from "../../src/social/services/autoCutLabEngine.js";
import type { MenuItem } from "../../src/pizza/data/menuData.js";

describe("Reparto /social — Regola 7: Traiettorie Pan & Scan Villaggio", () => {
  it("ammette esclusivamente le 4 traiettorie Pan & Scan senza tilt verticali né zoom centrali", () => {
    assert.deepEqual(VILLAGE_WEBSITE_TRAJECTORIES, [
      "pan_left_to_right",
      "pan_right_to_left",
      "diagonal_up_right",
      "diagonal_up_left",
    ]);
    assert.equal(VILLAGE_WEBSITE_TRAJECTORIES.includes("tilt_top_to_bottom"), false);
    assert.equal(VILLAGE_WEBSITE_TRAJECTORIES.includes("tilt_bottom_to_top"), false);
    assert.equal(VILLAGE_WEBSITE_TRAJECTORIES.includes("push_in_focal"), false);
  });

  it("assegna partenze differenziate per alloggio e ruota ciclicamente sulle 4 traiettorie ammesse", () => {
    assert.equal(getVillageAccommodationTrajectory("villa-penthouse-panoramic", 0), "pan_left_to_right");
    assert.equal(getVillageAccommodationTrajectory("red-bungalow-tropical", 0), "pan_right_to_left");
    assert.equal(getVillageAccommodationTrajectory("yellow-bungalow-oasis", 0), "diagonal_up_right");
    assert.equal(getVillageAccommodationTrajectory("bamboo-bungalow-nature", 0), "diagonal_up_left");

    const allowed = new Set(VILLAGE_WEBSITE_TRAJECTORIES);
    for (const id of ["villa-penthouse-panoramic", "red-bungalow-tropical", "green-bungalow", "camel-tent"]) {
      for (let step = 0; step < 6; step++) {
        assert.equal(allowed.has(getVillageAccommodationTrajectory(id, step)), true);
      }
    }
  });
});

describe("Reparto /social — Regole 8 & 12: Zero Bevande e Zero Piatti Sold Out", () => {
  it("esclude categoricamente tutte le categorie bevande da P1/P2/P3/R1 e anche le insalate da R1", () => {
    for (const bevId of ["soft-drinks", "beers", "wines", "coffee-shop", "fruit-drinks"]) {
      assert.equal(EXCLUDED_BEVERAGE_CATEGORY_IDS.has(bevId), true);
      assert.equal(isExcludedBeverageCategory(bevId, bevId), true);
      assert.equal(
        ELIGIBLE_FOOD_CATEGORIES.some((cat) => cat.id === bevId),
        false
      );
      assert.equal(
        ELIGIBLE_RESTAURANT_CATEGORIES.some((cat) => cat.id === bevId),
        false
      );
    }

    assert.equal(isExcludedSaladCategory("italian-salads", "Italian Salads"), true);
    assert.equal(
      ELIGIBLE_RESTAURANT_CATEGORIES.some((cat) => isExcludedSaladCategory(cat.id, cat.name)),
      false
    );
  });

  it("blocca piatti senza immagine, con is_available=false o in Sold Out su localStorage", () => {
    const validDish = {
      id: "margherita",
      name: "Margherita",
      nameTh: "พิซซ่ามาร์เกอริต้า",
      description: "",
      descriptionTh: "",
      price: 240,
      image: "/margherita.webp",
    } as MenuItem;

    assert.equal(isDishAvailableInKitchen(validDish), true);
    assert.equal(isDishAvailableInKitchen({ ...validDish, image: "" }), false);
    assert.equal(isDishAvailableInKitchen({ ...validDish, is_available: false } as MenuItem), false);

    // Simula un override Sold Out in localStorage senza alterare lo stato globale a fine test
    const prevLocalStorage = (globalThis as any).localStorage;
    try {
      const store = new Map<string, string>([
        ["fp_pizza_availability_overrides", JSON.stringify({ "test-soldout-dish": false })],
      ]);
      (globalThis as any).localStorage = {
        getItem: (k: string) => store.get(k) ?? null,
        setItem: (k: string, v: string) => store.set(k, v),
      };
      assert.equal(
        isDishAvailableInKitchen({ ...validDish, id: "test-soldout-dish", name: "Test Soldout Dish" }),
        false
      );
    } finally {
      (globalThis as any).localStorage = prevLocalStorage;
    }

    for (const run of [generateP1Test(), generateP2Test(), generateP3Test()]) {
      assert.ok(run.scenes.length >= 1);
      for (const scene of run.scenes) {
        assert.equal(isExcludedBeverageCategory("", scene.badgeCategory), false);
      }
    }
  });
});

describe("Reparto /social — Regola 9: Zero Bagni / Toilet & Integrità Stesso Alloggio V2", () => {
  it("rileva foto di bagni/toilet e garantisce che tutti i 18 alloggi in VILLAGE_LODGINGS siano privi di bagni", () => {
    for (const badName of ["Toilet.jpg", "09-Toilet2.jpg", "Bathroom.png", "washroom_1.jpg", "wc.jpg", "bagno.jpg"]) {
      assert.equal(isBathroomPhoto(badName), true);
    }
    assert.equal(isBathroomPhoto("01-Main.jpg"), false);
    assert.equal(isBathroomPhoto("06-Bed1.jpg"), false);

    assert.equal(VILLAGE_LODGINGS.length, 18);
    for (const lodging of VILLAGE_LODGINGS) {
      assert.equal(isBathroomPhoto(lodging.mainImage), false, `Bagno trovato in mainImage di ${lodging.id}`);
      for (const photo of lodging.gallery) {
        assert.equal(isBathroomPhoto(photo.file), false, `Bagno trovato in gallery di ${lodging.id}: ${photo.file}`);
      }
    }
  });

  it("garantisce che generateV2Test() selezioni foto dello stesso identico alloggio senza bagni", () => {
    for (let i = 0; i < 5; i++) {
      const v2 = generateV2Test();
      assert.ok(v2.scenes.length >= 4 && v2.scenes.length <= 5);
      const uniqueLodgings = new Set(v2.scenes.map((s) => s.lodgingTitle));
      assert.equal(uniqueLodgings.size, 1, "V2 ha mescolato alloggi diversi");
      for (const scene of v2.scenes) {
        assert.equal(isBathroomPhoto(scene.imageUrl), false);
        assert.equal(scene.priceLabel, "");
      }
    }
  });
});

describe("Reparto /social — Regole 13 & 14: Titoli Bilingue Semantici & Thumbnail Pre-Dissolvenza", () => {
  it("applica gerarchia Thai sopra / Inglese sotto con a capo semantico naturale senza tagli arbitrari", () => {
    assert.equal(
      formatSemanticEnglishDishTitle("HOMEMADE RAVIOLI WITH LIGURIAN WALNUT SAUCE"),
      "HOMEMADE RAVIOLI\nWITH LIGURIAN WALNUT SAUCE"
    );
    assert.equal(
      formatSemanticThaiDishTitle("ราวิโอลีโฮมเมดซอสครีมวอลนัทสไตล์ลิกูเรีย"),
      "ราวิโอลีโฮมเมด\nซอสครีมวอลนัทสไตล์ลิกูเรีย"
    );

    const titles = getCleanDishTitles({
      id: "ravioli-noci",
      name: "HOMEMADE RAVIOLI WITH LIGURIAN WALNUT SAUCE",
      nameTh: "ราวิโอลีโฮมเมดซอสครีมวอลนัทสไตล์ลิกูเรีย",
      description: "",
      descriptionTh: "",
      price: 290,
      image: "/ravioli.webp",
    } as MenuItem);

    assert.equal(titles.titlePrimary, "ราวิโอลีโฮมเมด\nซอสครีมวอลนัทสไตล์ลิกูเรีย");
    assert.equal(titles.titleSecondary, "HOMEMADE RAVIOLI\nWITH LIGURIAN WALNUT SAUCE");
  });

  it("calcola thumbnailTimestamp rigorosamente pre-dissolvenza (zero ghosting seconda scena)", () => {
    for (const sceneDur of [4.0, 5.5, 6.0, 8.85]) {
      const { effectiveDissolve, transitionThreshold, thumbnailTimestamp } =
        computePreFadeThumbnailTimestamp(sceneDur);
      assert.ok(effectiveDissolve > 0 && effectiveDissolve <= 0.65);
      assert.ok(thumbnailTimestamp >= 0.1);
      assert.ok(
        thumbnailTimestamp < transitionThreshold,
        `thumbnailTimestamp (${thumbnailTimestamp}) deve precedere transitionThreshold (${transitionThreshold})`
      );
    }
  });
});

describe("Reparto /social — Protezione Anti-Contaminazione Format/Brand al Mount", () => {
  it("resolveInitialAutoCutMode dà priorità assoluta a ?mode= rispetto a localStorage e fallback P1", () => {
    assert.equal(resolveInitialAutoCutMode("?mode=V1", "P1"), "V1");
    assert.equal(resolveInitialAutoCutMode("?mode=v2", null), "V2");
    assert.equal(resolveInitialAutoCutMode("?mode=R1", "P1"), "R1");
    assert.equal(resolveInitialAutoCutMode("?mode=lm1", "V3"), "LM1");
    assert.equal(resolveInitialAutoCutMode("", "V3"), "V3");
    assert.equal(resolveInitialAutoCutMode("?mode=INVALID", null), "P1");
    assert.equal(resolveInitialAutoCutMode("", null), "P1");
  });

  it("shouldRegenerateModeAfterKitchenLoad blocca qualsiasi rigenerazione su V1/V2/V3/LM1 e preserva Regola 21", () => {
    for (const villageMode of ["V1", "V2", "V3", "LM1"] as const) {
      assert.equal(shouldRegenerateModeAfterKitchenLoad(villageMode, false), false);
      assert.equal(shouldRegenerateModeAfterKitchenLoad(villageMode, true), false);
    }
    for (const foodMode of ["P1", "P2", "P3", "R1", "DS"] as const) {
      assert.equal(shouldRegenerateModeAfterKitchenLoad(foodMode, false), true);
      assert.equal(shouldRegenerateModeAfterKitchenLoad(foodMode, true), false);
    }
  });

  it("AutoCutLabView.tsx non contiene più il fallback hardcoded generateAutoCutTestByMode('P1') dopo il caricamento cucina", () => {
    const viewSrc = fs.readFileSync(
      path.resolve("src/social/components/AutoCutLabView.tsx"),
      "utf8"
    );
    assert.equal(viewSrc.includes("const initialP1 = generateAutoCutTestByMode('P1')"), false);
    assert.equal(viewSrc.includes("resolveInitialAutoCutMode"), true);
    assert.equal(viewSrc.includes("shouldRegenerateModeAfterKitchenLoad"), true);
    assert.equal(viewSrc.includes("__autoCutReady"), true);
  });
});
