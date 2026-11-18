import { describe, it } from "node:test";
import assert from "node:assert/strict";

import { calculatePaymentTotal } from "../../src/lib/paymentCalculations.js";
import {
  ensureLangFlag,
  generatePostCopy,
  sanitizeSocialBullets,
} from "../../src/social/services/autoCutCopywriterEngine.js";
import type { AutoCutTestRun } from "../../src/social/services/autoCutLabEngine.js";

describe("Reparto /pagamenti — Motore Calcolo Totale & Commissioni (paymentCalculations.ts)", () => {
  it("applica solo VAT 7% e 0% commissioni su bank_transfer e cash", () => {
    const bank = calculatePaymentTotal(1000, "bank_transfer", "en");
    assert.equal(bank.basePrice, 1000);
    assert.equal(bank.vatAmount, 70);
    assert.equal(bank.subtotalWithVat, 1070);
    assert.equal(bank.processingRate, 0);
    assert.equal(bank.processingCost, 0);
    assert.equal(bank.finalTotal, 1070);

    const cash = calculatePaymentTotal(1000, "cash", "th");
    assert.equal(cash.finalTotal, 1070);
    assert.equal(cash.processingCost, 0);
  });

  it("applica +4% su ksher, ksher_card, ksher_promptpay e stripe sopra il subtotale ivato", () => {
    for (const method of ["ksher", "ksher_card", "ksher_promptpay", "stripe"] as const) {
      const breakdown = calculatePaymentTotal(1000, method, "it");
      assert.equal(breakdown.subtotalWithVat, 1070);
      assert.equal(breakdown.processingRate, 0.04);
      assert.equal(breakdown.finalTotal, 1113); // Math.round(1070 * 1.04)
      assert.equal(breakdown.processingCost, 43);
    }
  });

  it("applica +10% su paypal sopra il subtotale ivato", () => {
    const paypal = calculatePaymentTotal(1000, "paypal", "de");
    assert.equal(paypal.subtotalWithVat, 1070);
    assert.equal(paypal.processingRate, 0.1);
    assert.equal(paypal.finalTotal, 1177); // Math.round(1070 * 1.10)
    assert.equal(paypal.processingCost, 107);
  });

  it("protegge importi negativi/NaN e fornisce disclaimer multilingua", () => {
    const invalid = calculatePaymentTotal(-500, "stripe", "it");
    assert.equal(invalid.basePrice, 0);
    assert.equal(invalid.finalTotal, 0);
    assert.ok(invalid.disclaimer.includes("VAT 7%"));

    const nanVal = calculatePaymentTotal(Number.NaN, "cash", "th");
    assert.equal(nanVal.finalTotal, 0);
    assert.ok(nanVal.disclaimer.includes("VAT 7%"));
  });
});

describe("Reparto /social — Regole Inviolabili Copywriter & Bandiere Bilingue", () => {
  it("antepone una sola bandiera per lingua senza duplicazioni (Regola 17)", () => {
    assert.equal(ensureLangFlag("พิซซ่าอิตาเลียนแท้", "th"), "🇹🇭 พิซซ่าอิตาเลียนแท้");
    assert.equal(ensureLangFlag("🇹🇭 🇹🇭 พิซซ่าอิตาเลียนแท้", "th"), "🇹🇭 พิซซ่าอิตาเลียนแท้");
    assert.equal(ensureLangFlag("Authentic Italian Pizza", "en"), "🇬🇧 Authentic Italian Pizza");
    assert.equal(ensureLangFlag("🇬🇧 Authentic Italian Pizza", "en"), "🇬🇧 Authentic Italian Pizza");
  });

  it("normalizza correttamente i bullet point social (sanitizeSocialBullets)", () => {
    const normalized = sanitizeSocialBullets("• Pizza Margherita\n- Pasta alla Carbonara");
    assert.equal(normalized, "▫️ Pizza Margherita\n▫️ Pasta alla Carbonara");
  });

  it("genera copy bilingue Pizzeria con hashtag solo in coda e zero termini vietati (Regole 10, 16, 18)", () => {
    const sampleRun: AutoCutTestRun = {
      mode: "P1",
      modeTitle: "Single Hero Dish",
      modeDescription: "Test run P1",
      brand: "pizza",
      audioTrack: {
        id: "pizza_02",
        title: "So Good",
        src: "/audio/02-flower-power-so-good.mp3",
        duration: 12.9,
        effectiveDuration: 8.55,
      },
      totalDuration: 8.55,
      sceneDuration: 8.55,
      scenes: [
        {
          imageUrl: "/pizza.jpg",
          titlePrimary: "พิซซ่ามาร์เกอริต้า",
          titleSecondary: "MARGHERITA TRADITIONAL ITALIAN PIZZA",
          sourceName: "Margherita",
          priceLabel: "240 THB",
          badgeCategory: "Pizza",
          trajectory: "food_macro_focus_lr",
        },
      ],
    };

    const copy = generatePostCopy(sampleRun, 0);
    assert.ok(copy.thaiContent.startsWith("🇹🇭 "));
    assert.ok(copy.englishContent.startsWith("🇬🇧 "));
    assert.equal(copy.thaiContent.includes("#"), false);
    assert.equal(copy.englishContent.includes("#"), false);
    assert.ok(copy.thaiHashtags.length > 0 && copy.englishHashtags.length > 0);
    assert.ok(copy.fullCaptionInstagram.endsWith([...copy.thaiHashtags, ...copy.englishHashtags].join(" ")));

    const combined = `${copy.thaiContent}\n${copy.englishContent}\n${copy.fullCaptionInstagram}\n${copy.fullCaptionTikTok}`.toLowerCase();
    for (const forbidden of ["napoletana", "wood-fired", "forno a legna", "เตาฟืน"]) {
      assert.equal(combined.includes(forbidden), false, `Trovato termine vietato: ${forbidden}`);
    }
  });
});
