import { describe, it } from "node:test";
import assert from "node:assert/strict";

import {
  DINING_TABLES,
  extractTableFromAddress,
  formatTableStationName,
  getCanonicalTableKey,
} from "../../src/pizza/utils/tableUtils.js";
import {
  isPlausibleEmail,
  isPlausibleName,
  isPlausiblePhone,
} from "../../src/pizza/utils/validation.js";
import { calculateDistance } from "../../src/pizza/utils/distance.js";
import { getDietaryType } from "../../src/pizza/utils/dietary.js";
import { extractOrderMetadata } from "../../src/pizza/utils/orderMetadata.js";
import {
  parseKdsItemDetails,
  resolveExtraDisplayName,
  resolveVariantDisplayName,
} from "../../src/admin/pizza/utils/kdsExtraDictionary.js";
import type { MenuItem } from "../../src/pizza/data/menuData.js";

describe("Reparto /pizze — Postazioni Tavoli QR (/dining, tableUtils.ts)", () => {
  it("espone le 16 postazioni canoniche (Tavolo 1..12 e Cliente 1..4)", () => {
    assert.equal(DINING_TABLES.length, 16);
    assert.equal(DINING_TABLES[0], "Tavolo 1");
    assert.equal(DINING_TABLES[11], "Tavolo 12");
    assert.equal(DINING_TABLES[12], "Cliente 1");
    assert.equal(DINING_TABLES[15], "Cliente 4");
  });

  it("normalizza getCanonicalTableKey dai formati multilingua e abbreviati", () => {
    assert.equal(getCanonicalTableKey("Table 3"), "Tavolo 3");
    assert.equal(getCanonicalTableKey("T-3"), "Tavolo 3");
    assert.equal(getCanonicalTableKey("โต๊ะ 3"), "Tavolo 3");
    assert.equal(getCanonicalTableKey("3"), "Tavolo 3");
    assert.equal(getCanonicalTableKey("Guest 2"), "Cliente 2");
    assert.equal(getCanonicalTableKey("ลูกค้า 2"), "Cliente 2");
    assert.equal(getCanonicalTableKey("C2"), "Cliente 2");
    assert.equal(getCanonicalTableKey(""), "");
  });

  it("formatta le postazioni in IT, EN, TH, DE e MM", () => {
    assert.equal(formatTableStationName("Tavolo 4", "IT"), "Tavolo 4");
    assert.equal(formatTableStationName("Tavolo 4", "EN"), "Table 4");
    assert.equal(formatTableStationName("Tavolo 4", "TH"), "โต๊ะ 4");
    assert.equal(formatTableStationName("Tavolo 4", "DE"), "Tisch 4");
    assert.equal(formatTableStationName("Tavolo 4", "MM"), "စားပွဲ 4");

    assert.equal(formatTableStationName("Cliente 2", "EN"), "Guest 2");
    assert.equal(formatTableStationName("Terrazza 1", "EN"), "Terrace 1");
    assert.equal(formatTableStationName("Giardino 2", "TH"), "โซนสวน 2");
    assert.equal(formatTableStationName("Bancone", "EN"), "Bar Counter");
  });

  it("estrae correttamente la postazione da indirizzi serializzati con tag o prefisso", () => {
    assert.equal(extractTableFromAddress("Dining [DINE-IN: Tavolo 5] [LANG: IT]"), "Tavolo 5");
    assert.equal(extractTableFromAddress("[TABLE: Table 8] [NOTE: Ice]"), "Table 8");
    assert.equal(extractTableFromAddress("Table 12 [EMAIL: guest@example.com]"), "Table 12");
    assert.equal(extractTableFromAddress("Ranong 85000 [COORD: 9.96,98.63]"), "");
  });
});

describe("Reparto /pizze — Validazione Ordini & Distanza Delivery (validation.ts, distance.ts)", () => {
  it("valida nomi reali multilingua e blocca keyboard mash o nomi singoli", () => {
    assert.equal(isPlausibleName("Marco Rossi"), true);
    assert.equal(isPlausibleName("สมชาย ใจดี"), true);
    assert.equal(isPlausibleName("Marco"), false);
    assert.equal(isPlausibleName("asdf qwer"), false);
    assert.equal(isPlausibleName("test user"), false);
    assert.equal(isPlausibleName("aaaa bbbb"), false);
  });

  it("valida telefoni Thai/internazionali ed esclude sequenze fittizie", () => {
    assert.equal(isPlausiblePhone("0819283746"), true);
    assert.equal(isPlausiblePhone("+66958825573"), true);
    assert.equal(isPlausiblePhone("0000000000"), false);
    assert.equal(isPlausiblePhone("0123456789"), false);
    assert.equal(isPlausiblePhone("0812345"), false);
    assert.equal(isPlausiblePhone("abc"), false);
  });

  it("valida email reali ed esclude domini usa-e-getta o keyboard mash", () => {
    assert.equal(isPlausibleEmail("marco.rossi@gmail.com"), true);
    assert.equal(isPlausibleEmail("user@tempmail.com"), false);
    assert.equal(isPlausibleEmail("user@example.com"), false);
    assert.equal(isPlausibleEmail("qwerty@gmail.com"), false);
    assert.equal(isPlausibleEmail("invalid-email"), false);
  });

  it("calcola correttamente la distanza Haversine (0 km su punto identico e ~2.1 km verso centro Ranong)", () => {
    assert.equal(calculateDistance(9.9619, 98.6524, 9.9619, 98.6524), 0);
    const kmToCenter = calculateDistance(9.9619, 98.6524, 9.9658, 98.6348);
    assert.ok(kmToCenter > 1.5 && kmToCenter < 2.8, `Distanza attesa ~2.0 km, ottenuta ${kmToCenter}`);
  });
});

describe("Reparto /pizze — Classificazione Dietetica & Metadati Ordine (dietary.ts, orderMetadata.ts)", () => {
  const mkItem = (partial: Partial<MenuItem> & { category?: string }): MenuItem =>
    ({
      id: partial.id || "item",
      name: partial.name || "Item",
      nameTh: partial.nameTh || "รายการ",
      description: partial.description || "",
      descriptionTh: partial.descriptionTh || "",
      price: partial.price ?? 200,
      image: partial.image || "/img.webp",
      ...partial,
    }) as MenuItem;

  it("classifica correttamente vegan, veggie, onnivoro e bevande escluse", () => {
    assert.equal(getDietaryType(mkItem({ id: "wine-chianti", name: "Chianti" }), "wines"), null);
    assert.equal(getDietaryType(mkItem({ id: "pizza-prosciutto", name: "Prosciutto e Funghi" }), "traditional-italian-pizza"), null);
    assert.equal(getDietaryType(mkItem({ id: "pizza-tonno", name: "Pizza al Tonno" }), "traditional-italian-pizza"), null);
    assert.equal(getDietaryType(mkItem({ id: "pizza-marinara", name: "Marinara" }), "traditional-italian-pizza"), "vegan");
    assert.equal(getDietaryType(mkItem({ id: "spaghetti-aglio-e-olio", name: "Spaghetti Aglio e Olio" }), "pasta"), "vegan");
    assert.equal(getDietaryType(mkItem({ id: "french-fries", name: "French Fries" }), "breakfast-and-snacks"), "vegan");
    assert.equal(getDietaryType(mkItem({ id: "caffe-espresso", name: "Espresso" }), "coffee-shop"), "vegan");
    assert.equal(getDietaryType(mkItem({ id: "pizza-margherita", name: "Margherita" }), "traditional-italian-pizza"), "veggie");
    assert.equal(getDietaryType(mkItem({ id: "tiramisu", name: "Tiramisu" }), "desserts"), "veggie");
    assert.equal(getDietaryType(mkItem({ id: "baked-pesto-lasagna", name: "Baked Pesto Lasagna" }), "pasta"), "veggie");
  });

  it("estrae e ripulisce tutti i metadati dall'indirizzo serializzato dell'ordine", () => {
    const raw =
      "Phetkasem Road 42, Ranong [ADDR_TH: ถนนเพชรเกษม 42] [COORD: 9.965,98.634] [EMAIL: guest@gmail.com] [NOTE: Ring the bell] [LANG: TH] [PROMO: pizza2026] [DISCOUNT: 45] [DINING_VOUCHER: dine10-abc12] [DINE-IN: Tavolo 5]";
    const meta = extractOrderMetadata(raw);

    assert.equal(meta.cleanAddress, "Phetkasem Road 42, Ranong");
    assert.equal(meta.customerEmail, "guest@gmail.com");
    assert.equal(meta.deliveryNotes, "Ring the bell");
    assert.equal(meta.orderLang, "TH");
    assert.equal(meta.promoCode, "PIZZA2026");
    assert.equal(meta.discountAmount, 45);
    assert.equal(meta.diningVoucher, "DINE10-ABC12");
    assert.equal(meta.tableStation, "Tavolo 5");

    const fallback = extractOrderMetadata("");
    assert.equal(fallback.cleanAddress, "Ranong");
    assert.equal(fallback.orderLang, "EN");
  });
});

describe("Reparto /kitchen — Dizionario Extra & Parser Comande KDS (kdsExtraDictionary.ts)", () => {
  it("risolve extra e varianti nelle lingue supportate dal monitor cucina", () => {
    assert.equal(resolveExtraDisplayName("mozzarella", "en"), "Mozzarella Cheese");
    assert.equal(resolveExtraDisplayName("mozzarella", "th"), "มอสซาเรลล่าชีส");
    assert.equal(resolveExtraDisplayName("mozzarella", "it"), "Mozzarella");
    assert.equal(resolveExtraDisplayName("mozzarella", "de"), "Mozzarella-Käse");
    assert.equal(resolveExtraDisplayName("mozzarella", "mm"), "မော့ဇာရဲလား ချိစ်");

    assert.equal(
      resolveVariantDisplayName({ id: "ext", name: "Large 12\"", nameTh: "ถาดใหญ่ 12 นิ้ว" }, "th"),
      "ถาดใหญ่ 12 นิ้ว"
    );
  });

  it("separa correttamente varianti, Half & Half, Halal, data lasagna, piccantezza, zucchero, salse ed extra", () => {
    const details = parseKdsItemDetails(
      {
        name: "Half & Half 100% Chicken Pizza",
        selectedVariant: { id: "variant-half-half", name: "Half & Half" },
        isHalalChicken: true,
        lasagnaDate: "2026-11-20",
        selectedExtras: [
          { id: "spicy-medium", name: "Medium Spicy", nameTh: "เผ็ดกลาง" },
          { id: "sugar-no", name: "No Sugar", nameTh: "ไม่ใส่น้ำตาล" },
          { id: "sauce-mayo", name: "Mayonnaise", nameTh: "มายองเนส" },
          "mozzarella",
        ],
      },
      "th"
    );

    assert.equal(details.isHalfHalf, true);
    assert.equal(details.isHalal, true);
    assert.equal(details.halalBadge, "🍗 เนื้อไก่ 100% (ฮาลาล)");
    assert.equal(details.lasagnaDate, "2026-11-20");
    assert.equal(details.spicyBadge, "เผ็ดกลาง");
    assert.equal(details.sugarBadge, "ไม่ใส่น้ำตาล");
    assert.deepEqual(details.sauces, ["มายองเนส"]);
    assert.deepEqual(details.regularExtras, ["มอสซาเรลล่าชีส"]);
  });
});
