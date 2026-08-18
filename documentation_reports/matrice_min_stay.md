# 📏 Matrice Canonica Soggiorno Minimo Dinamico (Min Stay)

*File di Configurazione di Riferimento: `src/admin/resort/config/min_stay_canonical_timeline.json`*  
*Ultimo Aggiornamento:* 18 Agosto 2026

---

## 1. Timeline Ufficiale Soggiorni Minimi

La tabella sottostante definisce in modo immutabile e vincolante le notti minime di partenza per ciascun periodo stagionale da **Oggi fino al 31 Ottobre 2027**:

| ID Blocco | Denominazione Periodo | Data Inizio (`dateFrom`) | Data Fine (`dateTo`) | Min Stay Base |
| :--- | :--- | :---: | :---: | :---: |
| `ms_p1` | **Inizio Stagione (2 Notti)** | `2026-08-01` | `2026-12-15` | **2 notti** |
| `ms_p2` | **Natale & Capodanno Peak (5 Notti)** | `2026-12-16` | `2027-01-15` | **5 notti** |
| `ms_p3` | **Alta Stagione Invernale (3 Notti)** | `2027-01-16` | `2027-03-31` | **3 notti** |
| `ms_p4` | **Primavera & Green Season (2 Notti)** | `2027-04-01` | `2027-10-31` | **2 notti** |

---

## 2. Regole Matematiche del Motore Gap-Filling

Per qualsiasi intervallo temporale libero (buco) di capienza $G$ notti tra due prenotazioni:
1. Il sistema scorre giorno per giorno $d$ all'interno del buco.
2. Per ogni giorno $d$, legge il valore base $\text{Baseline}(d)$ dalla Timeline Canonica.
3. Il valore target assegnato a Octorate è:
   $$\text{TargetMinStay}(d) = \min(G, \text{Baseline}(d))$$
4. I giorni consecutivi aventi lo stesso valore vengono raggruppati in un unico blocco bulk `[dateFrom, dateTo, minStay]` con `dateTo` inclusivo.

---

## 3. Garanzie di Sistema & Prevenzione Regressioni

* **Nessuna contaminazione tra stagioni**: Un buco di 100 giorni che attraversa Natale applicherà 5 notti a Natale e 2/3 notti nei restanti periodi.
* **Allargamento prenotazioni (Widening)**: Se una cancellazione allarga un buco, il sistema invia a Octorate il ripristino al valore stagionale base (cancellando vecchi 1 rimasti sul PMS).
* **Unica Sorgente di Verità**: Tutti i componenti del resort (`Gestione Tariffe Derivate`, `ResortVisualCalendar`, `octorateAdmin.ts`, `octorate-webhook.ts`) attingono direttamente dal file `min_stay_canonical_timeline.json`.
