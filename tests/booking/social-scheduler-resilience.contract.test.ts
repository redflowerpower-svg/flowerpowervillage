import { describe, it } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

import {
  EXPECTED_BRAND_BY_MODE,
  MAX_SLOT_ATTEMPTS,
  MIN_SCENES_BY_MODE,
  OFFICIAL_SLOTS,
  RECOVERY_WINDOW_MINUTES,
  STALE_IN_PROGRESS_MINUTES,
  TOPIC_KOH_PHAYAM_GROUP,
  TOPIC_TIKTOK_STORIES,
  analyzeSlotHistory,
  buildDelayNoticeMessage,
  buildFiniteAudioMuxArgs,
  buildResolvedNoticeMessage,
  buildSubTopicNoticeMessage,
  computeNextRetryHint,
  isPermanentError,
  resolveFfmpegBinary,
  resolveScheduledSlot,
  selectSlotToExecute,
  serializeRetryMeta,
  timeToMinutes,
  validateRenderedModeContract,
} from "../../scripts/social-scheduler-core.mjs";

function priorCompletedRows(beforeSlot: string, nowMs: number) {
  return OFFICIAL_SLOTS
    .filter((s) => timeToMinutes(s) < timeToMinutes(beforeSlot))
    .map((s, idx) => ({
      id: 900 + idx,
      slot: s,
      status: "completed",
      copy_text: "ok",
      created_at: new Date(nowMs - 60 * 60_000).toISOString(),
    }));
}

describe("Reparto /social — Scheduler Slot Window & Anti-Drift", () => {
  it("identifica correttamente tutti gli 11 slot ufficiali e rispetta la finestra oraria", () => {
    assert.equal(OFFICIAL_SLOTS.length, 11);
    assert.equal(resolveScheduledSlot("", { hour: 17, min: 1 }), "17:00");
    assert.equal(resolveScheduledSlot("", { hour: 17, min: 31 }), "17:00");
    assert.equal(resolveScheduledSlot("", { hour: 17, min: 46 }), null);
    assert.equal(resolveScheduledSlot("19:30", { hour: 20, min: 10 }), "19:30");
    assert.equal(resolveScheduledSlot("99:99", { hour: 12, min: 0 }), null);
  });

  it("salta lo slot se già completato oggi e supporta dryRun / forceRun", () => {
    const nowMs = Date.now();
    const todayRows = [
      ...priorCompletedRows("17:00", nowMs),
      {
        id: 1,
        slot: "17:00",
        status: "completed",
        copy_text: "ok",
        created_at: new Date(nowMs - 10 * 60_000).toISOString(),
      },
    ];

    const autoDone = selectSlotToExecute({
      rawSlot: "",
      bkTime: { hour: 17, min: 30 },
      nowMs,
      todayRows,
    });
    assert.equal(autoDone.slot, null);
    assert.equal(autoDone.reason, "idle");

    const explicitDone = selectSlotToExecute({
      rawSlot: "17:00",
      bkTime: { hour: 17, min: 30 },
      nowMs,
      todayRows,
    });
    assert.equal(explicitDone.slot, null);
    assert.equal(explicitDone.reason, "already_completed");

    const forced = selectSlotToExecute({
      rawSlot: "17:00",
      bkTime: { hour: 17, min: 30 },
      nowMs,
      todayRows,
      forceRun: true,
    });
    assert.equal(forced.slot, "17:00");
    assert.equal(forced.reason, "explicit");
  });
});

describe("Reparto /social — Coda Auto-Recupero (3 Tentativi & Finestra 3 Ore)", () => {
  it("riprende automaticamente uno slot in retry_pending al giro successivo (tentativo 2/3 e 3/3)", () => {
    const nowMs = Date.now();
    const rows1 = [
      ...priorCompletedRows("17:00", nowMs),
      {
        id: 1,
        slot: "17:00",
        status: "retry_pending",
        copy_text: serializeRetryMeta({ attempt: 1, lastError: "HTTP 502" }),
        created_at: new Date(nowMs - 25 * 60_000).toISOString(),
      },
    ];

    // Alle 17:46 la finestra 17:00 è chiusa, quindi deve attivarsi la recovery_queue
    const dec2 = selectSlotToExecute({
      rawSlot: "",
      bkTime: { hour: 17, min: 46 },
      nowMs,
      todayRows: rows1,
    });
    assert.equal(dec2.slot, "17:00");
    assert.equal(dec2.reason, "recovery_queue");
    assert.equal(dec2.attempt, 2);
    assert.equal(dec2.isRecovery, true);

    const rows2 = [
      ...rows1,
      {
        id: 2,
        slot: "17:00",
        status: "retry_pending",
        copy_text: serializeRetryMeta({ attempt: 2, lastError: "HTTP 504" }),
        created_at: new Date(nowMs - 5 * 60_000).toISOString(),
      },
      {
        id: 20,
        slot: "18:00",
        status: "completed",
        copy_text: "ok",
        created_at: new Date(nowMs - 4 * 60_000).toISOString(),
      },
    ];

    const dec3 = selectSlotToExecute({
      rawSlot: "",
      bkTime: { hour: 18, min: 15 },
      nowMs,
      todayRows: rows2,
    });
    assert.equal(dec3.slot, "17:00");
    assert.equal(dec3.attempt, 3);
    assert.equal(dec3.isRecovery, true);

    // Dopo 3 tentativi falliti (o failed_final), NON deve più riprovare
    const rows3 = [
      ...rows2,
      {
        id: 3,
        slot: "17:00",
        status: "retry_pending",
        copy_text: serializeRetryMeta({ attempt: MAX_SLOT_ATTEMPTS }),
        created_at: new Date(nowMs - 2 * 60_000).toISOString(),
      },
      {
        id: 21,
        slot: "18:30",
        status: "completed",
        copy_text: "ok",
        created_at: new Date(nowMs - 1 * 60_000).toISOString(),
      },
    ];
    const decStop = selectSlotToExecute({
      rawSlot: "",
      bkTime: { hour: 18, min: 45 },
      nowMs,
      todayRows: rows3,
    });
    assert.equal(decStop.slot, null);
    assert.equal(decStop.reason, "idle");
  });

  it("considera fallito un in_progress scaduto (>18 min) ma blocca duplicati mentre in_progress è attivo (<18 min)", () => {
    const nowMs = Date.now();
    const activeRows = [
      ...priorCompletedRows("17:00", nowMs),
      {
        id: 1,
        slot: "17:00",
        status: "in_progress",
        copy_text: serializeRetryMeta({ attempt: 1 }),
        created_at: new Date(nowMs - (STALE_IN_PROGRESS_MINUTES - 5) * 60_000).toISOString(),
      },
    ];
    const duringActive = selectSlotToExecute({
      rawSlot: "",
      bkTime: { hour: 17, min: 30 },
      nowMs,
      todayRows: activeRows,
    });
    assert.equal(duringActive.slot, null);

    const staleRows = [
      ...priorCompletedRows("17:00", nowMs),
      {
        id: 1,
        slot: "17:00",
        status: "in_progress",
        copy_text: serializeRetryMeta({ attempt: 1 }),
        created_at: new Date(nowMs - (STALE_IN_PROGRESS_MINUTES + 2) * 60_000).toISOString(),
      },
    ];
    const afterCrash = selectSlotToExecute({
      rawSlot: "",
      bkTime: { hour: 17, min: 50 },
      nowMs,
      todayRows: staleRows,
    });
    assert.equal(afterCrash.slot, "17:00");
    assert.equal(afterCrash.reason, "recovery_queue");
    assert.equal(afterCrash.attempt, 2);
  });

  it("ignora slot non completati oltre la finestra di 180 minuti e dà priorità allo slot corrente", () => {
    const nowMs = Date.now();
    const rows = [
      ...priorCompletedRows("17:00", nowMs),
      {
        id: 1,
        slot: "17:00",
        status: "retry_pending",
        copy_text: serializeRetryMeta({ attempt: 1 }),
        created_at: new Date(nowMs - 30 * 60_000).toISOString(),
      },
    ];

    // Alle 18:00 esatte c'è lo slot corrente 18:00: ha la priorità su 17:00 in recovery
    const at1800 = selectSlotToExecute({
      rawSlot: "",
      bkTime: { hour: 18, min: 0 },
      nowMs,
      todayRows: rows,
    });
    assert.equal(at1800.slot, "18:00");
    assert.equal(at1800.reason, "scheduled");

    // Se 18:00 è completato, alle 18:05 riprende subito 17:00 dalla coda recovery
    const with1800Done = [
      ...rows,
      {
        id: 2,
        slot: "18:00",
        status: "completed",
        copy_text: "ok",
        created_at: new Date(nowMs - 2 * 60_000).toISOString(),
      },
    ];
    const at1805 = selectSlotToExecute({
      rawSlot: "",
      bkTime: { hour: 18, min: 5 },
      nowMs,
      todayRows: with1800Done,
    });
    assert.equal(at1805.slot, "17:00");
    assert.equal(at1805.reason, "recovery_queue");

    // Dopo >180 minuti da 17:00 (es. 20:05, +185 min), 17:00 non viene più ripreso
    const rowsBefore2000 = [
      ...with1800Done,
      { id: 30, slot: "18:30", status: "completed", copy_text: "ok", created_at: new Date(nowMs).toISOString() },
      { id: 31, slot: "19:30", status: "completed", copy_text: "ok", created_at: new Date(nowMs).toISOString() },
    ];
    const pastWindow = selectSlotToExecute({
      rawSlot: "",
      bkTime: { hour: 20, min: 5 },
      nowMs,
      todayRows: rowsBefore2000,
    });
    const elapsed1700 = 20 * 60 + 5 - 17 * 60;
    assert.ok(elapsed1700 > RECOVERY_WINDOW_MINUTES);
    assert.equal(pastWindow.slot, "20:00"); // slot corrente delle 20:00

    const pastWindowIdle = selectSlotToExecute({
      rawSlot: "",
      bkTime: { hour: 20, min: 35 },
      nowMs,
      todayRows: [
        ...rowsBefore2000,
        { id: 32, slot: "20:00", status: "completed", copy_text: "ok", created_at: new Date(nowMs).toISOString() },
      ],
    });
    assert.equal(pastWindowIdle.slot, null);
  });
});

describe("Reparto /social — Idempotenza Granulare per Singolo Contenuto (08:00 & 17:00)", () => {
  it("mantiene i sotto-elementi completati (P1, V3) ed evita duplicati quando riparte solo R1, preservando gli ID avvisi", () => {
    const nowMs = Date.now();
    const rows = [
      ...priorCompletedRows("17:00", nowMs),
      {
        id: 10,
        slot: "17:00::P1",
        status: "completed",
        copy_text: "ok",
        created_at: new Date(nowMs - 30 * 60_000).toISOString(),
      },
      {
        id: 11,
        slot: "17:00::V3",
        status: "completed",
        copy_text: "ok",
        created_at: new Date(nowMs - 29 * 60_000).toISOString(),
      },
      {
        id: 12,
        slot: "17:00",
        status: "retry_pending",
        copy_text: serializeRetryMeta({
          attempt: 1,
          pendingItems: ["R1"],
          topic301MsgId: 9001,
          extraNotices: [{ topicId: TOPIC_KOH_PHAYAM_GROUP, messageId: 4002 }],
        }),
        created_at: new Date(nowMs - 28 * 60_000).toISOString(),
      },
    ];

    const history = analyzeSlotHistory(rows, nowMs);
    const st = history["17:00"];
    assert.equal(st.completed, false);
    assert.equal(st.completedItems.has("P1"), true);
    assert.equal(st.completedItems.has("V3"), true);
    assert.equal(st.completedItems.has("R1"), false);
    assert.equal(st.lastNotice.topic301MsgId, 9001);
    assert.deepEqual(st.lastNotice.extraNotices, [{ topicId: TOPIC_KOH_PHAYAM_GROUP, messageId: 4002 }]);

    const decision = selectSlotToExecute({
      rawSlot: "",
      bkTime: { hour: 17, min: 45 },
      nowMs,
      todayRows: rows,
    });
    assert.equal(decision.slot, "17:00");
    assert.equal(decision.attempt, 2);
    assert.equal(decision.completedItems?.has("P1"), true);
    assert.equal(decision.completedItems?.has("V3"), true);
    assert.equal(decision.completedItems?.has("R1"), false);
    assert.equal(TOPIC_TIKTOK_STORIES, 3);
  });
});

describe("Reparto /social — Classificazione Errori, Messaggi Telegram & Risoluzione FFmpeg", () => {
  it("distingue correttamente errori permanenti (token scaduti) da errori transitori recuperabili", () => {
    assert.equal(isPermanentError(new Error('FB finish failed: {"code":190,"message":"Error validating access token"}')), true);
    assert.equal(isPermanentError(new Error("Meta Page Token mancante per pizza")), true);
    assert.equal(isPermanentError(new Error("Token Telegram non trovato!")), true);
    assert.equal(isPermanentError(new Error("Token TikTok non trovato per brand pizza")), true);

    assert.equal(isPermanentError(new Error("HTTP 502 Bad Gateway")), false);
    assert.equal(isPermanentError(new Error("429 Too Many Requests")), false);
    assert.equal(isPermanentError(new Error("IG Video processing timeout (superati i 200s di elaborazione Meta)")), false);
    assert.equal(isPermanentError(new Error("Rendering fallito per R1 (exit code 2)")), false);
    assert.equal(isPermanentError(new Error("Telegram sendVideo failed (Topic 3): ETIMEDOUT")), false);
  });

  it("genera correttamente orario prossimo retry e messaggi calmi di avviso ritardo / risoluzione", () => {
    assert.equal(computeNextRetryHint({ hour: 17, min: 5 }), "~17:30");
    assert.equal(computeNextRetryHint({ hour: 17, min: 32 }), "~18:00");
    assert.equal(computeNextRetryHint({ hour: 23, min: 40 }), "~00:00");

    const delayMsg = buildDelayNoticeMessage({
      slot: "17:00",
      attempt: 1,
      reasonSummary: "Timeout temporaneo server",
      nextRetryHint: "~17:30",
      pendingItems: ["R1"],
    });
    assert.ok(delayMsg.includes("RECUPERO AUTOMATICO IN CORSO"));
    assert.ok(delayMsg.includes("1/3"));
    assert.ok(delayMsg.includes("~17:30"));
    assert.ok(delayMsg.includes("R1"));

    const subMsg = buildSubTopicNoticeMessage({
      slot: "17:00",
      attempt: 1,
      nextRetryHint: "~17:30",
    });
    assert.ok(subMsg.includes("17:00"));
    assert.ok(subMsg.includes("~17:30"));

    const resolvedMsg = buildResolvedNoticeMessage({ slot: "17:00", attempt: 2 });
    assert.ok(resolvedMsg.includes("RISOLTO IN AUTOMATICO"));
    assert.ok(resolvedMsg.includes("2/3"));
  });

  it("risolve FFmpeg ignorando percorsi inesistenti e restituendo null se assente", () => {
    const existingSet = new Set(["/custom/cache/ffmpeg"]);
    const resolved = resolveFfmpegBinary({
      envPath: "/missing/usr/bin/ffmpeg",
      homeDir: "/home/runner",
      ffmpegStaticPath: "/missing/ffmpeg-static/ffmpeg",
      ffmpegInstallerPath: "/custom/cache/ffmpeg",
      existsSyncFn: (p) => existingSet.has(p),
    });
    assert.equal(resolved, "/custom/cache/ffmpeg");

    const none = resolveFfmpegBinary({
      envPath: "/missing/ffmpeg",
      ffmpegStaticPath: "/missing/static",
      existsSyncFn: () => false,
    });
    assert.equal(none, null);
  });
});

describe("Reparto /social — Integrità Static Workflow GitHub Actions", () => {
  it("garantisce ubuntu-24.04, passaggio target_slot, cache FFmpeg/Playwright e copertura cancelled()", () => {
    const yml = fs.readFileSync(
      path.resolve(".github/workflows/social-scheduler-cron.yml"),
      "utf8"
    );

    assert.equal(yml.includes("runs-on: ubuntu-24.04"), true);
    assert.equal(yml.includes("runs-on: ubuntu-latest"), false);
    assert.equal(yml.includes("steps.preflight.outputs.target_slot"), true);
    assert.equal(yml.includes("steps.preflight.outputs.attempt"), true);
    assert.equal(yml.includes("if: failure() || cancelled()"), true);
    assert.equal(yml.includes("~/.cache/fp-ffmpeg"), true);
    assert.equal(yml.includes("~/.cache/ms-playwright"), true);
    assert.equal(yml.includes("actions/cache@v4"), true);

    const ffmpegVersionLine = yml
      .split(/\r?\n/)
      .find((line) => line.includes("-version") && line.includes("fp-ffmpeg"));
    assert.ok(ffmpegVersionLine, "Manca la verifica obbligatoria ffmpeg -version");
    assert.equal(ffmpegVersionLine.includes("|| true"), false);

    const aptInstallFfmpegLine = yml
      .split(/\r?\n/)
      .find((line) => line.includes("apt-get install") && line.includes(" ffmpeg"));
    assert.ok(aptInstallFfmpegLine, "Manca il fallback apt-get install ffmpeg");
    assert.equal(aptInstallFfmpegLine.includes("|| true"), false);

    assert.equal(yml.includes("apad=whole_dur="), true);
    assert.equal(yml.includes("timeout-minutes: 12"), true);
  });

  it("genera argomenti FFmpeg finiti senza apad infinito/duration=longest e con timeout in render-parity-test.mjs", () => {
    const args = buildFiniteAudioMuxArgs({
      rawPath: "/tmp/in.mp4",
      bgPath: "/tmp/bg.mp3",
      sfxPath: "/tmp/sfx.wav",
      delayMs: 8200,
      durationSec: 12.2,
      outPath: "/tmp/out.mp4",
    });
    const joined = args.join(" ");
    assert.equal(args.includes("-nostdin"), true);
    assert.equal(args.includes("-t"), true);
    assert.equal(args.includes("12.200"), true);
    assert.equal(args.includes("-shortest"), false);
    assert.equal(joined.includes("apad=whole_dur=12.70"), true);
    assert.equal(joined.includes("atrim=0:12.200"), true);
    assert.equal(joined.includes("amix=inputs=2:duration=first"), true);
    assert.equal(joined.includes("apad[bg]"), false);
    assert.equal(joined.includes("duration=longest"), false);

    const paritySrc = fs.readFileSync(
      path.resolve("scripts/render-parity-test.mjs"),
      "utf8"
    );
    assert.equal(paritySrc.includes("apad[bg]"), false);
    assert.equal(paritySrc.includes("duration=longest"), false);
    assert.equal(paritySrc.includes("timeout: 90000"), true);
  });

  it("non conta due volte l'in_progress del run corrente quando esclude runId (1/3 -> 2/3 -> 3/3, mai 4/3)", () => {
    const nowMs = Date.now();
    // Run 1 andato in timeout dopo 24 minuti: in Neon c'e solo l'in_progress di run1 (vecchio > 18 min)
    const run1Rows = [
      ...priorCompletedRows("16:00", nowMs),
      {
        id: 1,
        slot: "16:00",
        status: "in_progress",
        copy_text: serializeRetryMeta({ attempt: 1, runId: "run-111", topic301MsgId: null }),
        created_at: new Date(nowMs - 24 * 60_000).toISOString(),
      },
    ];
    const h1 = analyzeSlotHistory(run1Rows, nowMs, { excludeRunId: "run-111" });
    assert.equal(h1["16:00"].failedAttempts, 0);
    const attemptAfterRun1 = Math.min(MAX_SLOT_ATTEMPTS, h1["16:00"].failedAttempts + 1);
    assert.equal(attemptAfterRun1, 1);

    // Run 2 andato anch'esso in timeout dopo 24 minuti
    const run2Rows = [
      ...run1Rows,
      {
        id: 2,
        slot: "16:00",
        status: "retry_pending",
        copy_text: serializeRetryMeta({ attempt: 1, runId: "run-111", topic301MsgId: 894 }),
        created_at: new Date(nowMs - 23 * 60_000).toISOString(),
      },
      {
        id: 3,
        slot: "16:00",
        status: "in_progress",
        copy_text: serializeRetryMeta({ attempt: 2, runId: "run-222", topic301MsgId: 894 }),
        created_at: new Date(nowMs - 22 * 60_000).toISOString(),
      },
    ];
    const h2 = analyzeSlotHistory(run2Rows, nowMs, { excludeRunId: "run-222" });
    assert.equal(h2["16:00"].failedAttempts, 1);
    assert.equal(h2["16:00"].lastNotice.topic301MsgId, 894);
    const attemptAfterRun2 = Math.min(MAX_SLOT_ATTEMPTS, Math.max(2, h2["16:00"].failedAttempts + 1));
    assert.equal(attemptAfterRun2, 2);

    // Run 3 fallito: deve risultare tentativo 3/3 (mai 4/3)
    const run3Rows = [
      ...run2Rows,
      {
        id: 4,
        slot: "16:00",
        status: "retry_pending",
        copy_text: serializeRetryMeta({ attempt: 2, runId: "run-222", topic301MsgId: 894 }),
        created_at: new Date(nowMs - 21 * 60_000).toISOString(),
      },
      {
        id: 5,
        slot: "16:00",
        status: "in_progress",
        copy_text: serializeRetryMeta({ attempt: 3, runId: "run-333", topic301MsgId: 894 }),
        created_at: new Date(nowMs - 20 * 60_000).toISOString(),
      },
    ];
    const h3 = analyzeSlotHistory(run3Rows, nowMs, { excludeRunId: "run-333" });
    assert.equal(h3["16:00"].failedAttempts, 2);
    const attemptAfterRun3 = Math.min(MAX_SLOT_ATTEMPTS, Math.max(3, h3["16:00"].failedAttempts + 1));
    assert.equal(attemptAfterRun3, 3);
  });
});

describe("Reparto /social — Firewall Anti-Contaminazione Format/Brand & Isolamento Topic 2", () => {
  it("accetta tutti i 9 formati quando mode, brand e numero scene rispettano il contratto", () => {
    for (const [mode, expectedBrand] of Object.entries(EXPECTED_BRAND_BY_MODE)) {
      const minScenes = MIN_SCENES_BY_MODE[mode];
      const check = validateRenderedModeContract({
        requestedMode: mode,
        actualMode: mode,
        actualBrand: expectedBrand,
        sceneCount: minScenes,
      });
      assert.equal(check.ok, true, `Contratto fallito inattesamente per ${mode}: ${check.reason}`);
    }
    const emptyDs = validateRenderedModeContract({
      requestedMode: "DS",
      actualMode: "DS",
      actualBrand: "pizza",
      sceneCount: 0,
      isEmptyShowcase: true,
    });
    assert.equal(emptyDs.ok, true);
  });

  it("blocca categoricamente ogni contaminazione food/bungalow e scene troncate", () => {
    const regressions = [
      { requestedMode: "V1", actualMode: "P1", actualBrand: "pizza", sceneCount: 1 },
      { requestedMode: "V2", actualMode: "P1", actualBrand: "pizza", sceneCount: 1 },
      { requestedMode: "V3", actualMode: "P1", actualBrand: "pizza", sceneCount: 1 },
      { requestedMode: "R1", actualMode: "P1", actualBrand: "pizza", sceneCount: 1 },
      { requestedMode: "P2", actualMode: "P1", actualBrand: "pizza", sceneCount: 1 },
      { requestedMode: "V2", actualMode: "V2", actualBrand: "village", sceneCount: 1 },
      { requestedMode: "LM1", actualMode: "LM1", actualBrand: "pizza", sceneCount: 3 },
    ];
    for (const bad of regressions) {
      const res = validateRenderedModeContract(bad);
      assert.equal(res.ok, false, `Doveva bloccare ${JSON.stringify(bad)}`);
    }
  });

  it("garantisce il gate anti-contaminazione in render-parity-test.mjs e l'isolamento Topic 2 in social-scheduler-dispatch.mjs", () => {
    const paritySrc = fs.readFileSync(path.resolve("scripts/render-parity-test.mjs"), "utf8");
    assert.equal(paritySrc.includes("__autoCutReady"), true);
    assert.equal(paritySrc.includes("validateRenderedModeContract"), true);

    const dispatchSrc = fs.readFileSync(path.resolve("scripts/social-scheduler-dispatch.mjs"), "utf8");
    assert.equal(dispatchSrc.includes("validateRenderedModeContract"), true);

    const block1130 = dispatchSrc.slice(dispatchSrc.indexOf("else if (is1130)"), dispatchSrc.indexOf("else if (is1230)"));
    const block1930 = dispatchSrc.slice(dispatchSrc.indexOf("else if (is1930)"), dispatchSrc.indexOf("else if (is2000)"));
    assert.equal(block1130.includes("TOPIC_KOH_PHAYAM_GROUP"), false);
    assert.equal(block1930.includes("TOPIC_KOH_PHAYAM_GROUP"), false);
    assert.equal(block1130.includes("TOPIC_TIKTOK_STORIES"), true);
    assert.equal(block1930.includes("TOPIC_TIKTOK_STORIES"), true);
  });
});
