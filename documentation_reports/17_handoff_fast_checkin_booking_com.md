# HANDOFF: Fast Web Check-in & Aggiramento Blocco Telefoni Booking.com (Post-Dominio)

Questo documento traccia l'architettura tecnica e la procedura operativa per ripristinare e gestire la raccolta automatica dei numeri di telefono/WhatsApp degli ospiti provenienti da **Booking.com** (in vigore dal 28 Settembre 2026, data in cui Booking.com cesserà di inviare i recapiti telefonici via API).

---

## 🎯 Obiettivo
Ottenere istantaneamente il numero WhatsApp e l'orario di arrivo dell'ospite di Booking.com per:
1. Coordinare il pick-up bagagli e accoglienza al molo di Koh Phayam (pier transfer).
2. Fornire assistenza prima dell'arrivo sull'isola.
3. Raccogliere dati facoltativi per la registrazione TM30 della polizia thailandese.

---

## 📋 Prerequisito per l'Attivazione
- [ ] Collegamento e propagazione del dominio definitivo (es. `flowerpower-phayam.com` o dominio custom designato).

---

## 🛠️ Procedura Operativa da Eseguire

### FASE 1: Autorizzazione Dominio su Booking.com Extranet (Anti-Oscuramento Link)
Booking.com oscura i link non verificati (`[Link rimosso]`). Per renderlo **100% cliccabile e visibile**:
1. Accedere all'**Extranet di Booking.com** con le credenziali della struttura.
2. Andare su: **Struttura (Property)** ➔ **Preferenze per i messaggi (Messaging preferences)**.
3. Cliccare sulla scheda: **Impostazioni di sicurezza (Security settings)**.
4. Trovare la sezione: **I tuoi link approvati (Your approved links / Allowlist)**.
5. Cliccare su **"Aggiungi un link"** e inserire il dominio definitivo:  
   👉 `https://flowerpower-phayam.com`
6. Salvare le modifiche.

---

### FASE 2: Messaggio Automatico di Benvenuto su Octorate / Booking.com
Impostare il template di risposta automatica che parte all'istante appena viene creata una prenotazione da Booking.com:

**Testo del messaggio consigliato (Multilingua IT / EN):**
> **Italiano:**  
> *"Ciao {GuestName}! Grazie per aver scelto Flower Power Farm Village a Koh Phayam. 🏝️*  
> *Per consentirci di organizzare il tuo arrivo al molo e assisterti al meglio, puoi:*  
> *1️⃣ Rispondere direttamente a questo messaggio indicando il tuo numero WhatsApp e l'orario del traghetto.*  
> *2️⃣ Oppure confermare i dettagli sul nostro check-in rapido: https://flowerpower-phayam.com/checkin?res={ReservationId}*  
> *A presto a Phayam!"*  
>  
> **English:**  
> *"Hello {GuestName}! Thank you for choosing Flower Power Farm Village in Koh Phayam. 🏝️*  
> *To help us arrange your pier pick-up and assist you with your arrival, please:*  
> *1️⃣ Reply directly to this message with your WhatsApp number and ferry arrival time.*  
> *2️⃣ Or confirm your details via our fast check-in: https://flowerpower-phayam.com/checkin?res={ReservationId}*  
> *See you soon on the island!"*

*(Nota: Booking.com non blocca i numeri telefonici quando sono inviati dall'ospite verso la struttura).*

---

### FASE 3: Implementazione Tecnica sul Sito Web (Antigravity Codebase)
Quando il dominio sarà operativo, implementeremo:

1. **Pagina Frontend `/checkin` ([src/pages/FastCheckinPage.tsx](file:///d:/01%20ANTIGRAVITY/flower-power-village-com/flowerpowervillage/src/pages/FastCheckinPage.tsx)):**
   - Modulo minimale ottimizzato per smartphone:
     - Nome e Cognome (auto-popolato se passato `?res=ID`).
     - Prefisso internazionale + Numero WhatsApp.
     - Data e orario stimato del traghetto da Ranong a Koh Phayam.
     - Eventuali richieste speciali (es. noleggio scooter, transfer).
2. **Endpoint Backend API ([api/_handlers/fast-checkin.ts](file:///d:/01%20ANTIGRAVITY/flower-power-village-com/flowerpowervillage/api/_handlers/fast-checkin.ts)):**
   - Riceve i dati inviati dal modulo.
   - Salva i recapiti nel database Supabase.
   - Invia notifica istantanea sul gruppo **Telegram di Flower Power** con link rapido `https://wa.me/{numero}` per avviare la chat con 1 clic.
