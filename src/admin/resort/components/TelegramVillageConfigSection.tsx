import React, { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';
import { 
  Send, 
  CheckCircle, 
  AlertCircle, 
  Eye, 
  EyeOff, 
  RefreshCw, 
  HelpCircle,
  ExternalLink,
  Bot,
  MessageSquare
} from 'lucide-react';

export function TelegramVillageConfigSection() {
  const [botToken, setBotToken] = useState('');
  const [chatId, setChatId] = useState('');
  const [showToken, setShowToken] = useState(false);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [botInfo, setBotInfo] = useState<{ id: number; first_name: string; username: string } | null>(null);
  const [statusMessage, setStatusMessage] = useState<{ text: string; isError: boolean } | null>(null);
  const [showInstructions, setShowInstructions] = useState(false);

  const fetchCurrentConfig = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;
      
      const res = await fetch('/api/admin/sync-telegram-webhook?department=village', {
        headers: {
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        }
      });
      const data = await res.json();
      if (res.ok) {
        if (data.botToken) setBotToken(data.botToken);
        if (data.chatId) setChatId(data.chatId);
        if (data.botInfo) setBotInfo(data.botInfo);
      }
    } catch (err: any) {
      console.warn('Errore lettura config Telegram villaggio:', err);
    } finally {
      setInitialLoading(false);
    }
  };

  useEffect(() => {
    fetchCurrentConfig();
  }, []);

  const handleSaveAndTest = async (testMessage: boolean = true) => {
    if (!botToken.trim()) {
      setStatusMessage({ text: 'Inserisci il Token del Bot Telegram prima di continuare.', isError: true });
      return;
    }
    if (testMessage && !chatId.trim()) {
      setStatusMessage({ text: 'Inserisci il Chat ID del gruppo per inviare il messaggio di prova.', isError: true });
      return;
    }

    setLoading(true);
    setStatusMessage(null);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;

      const res = await fetch('/api/admin/sync-telegram-webhook', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          department: 'village',
          botToken: botToken.trim(),
          chatId: chatId.trim(),
          testMessage
        })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setBotInfo(data.botInfo);
        if (testMessage) {
          if (data.testMessageSent) {
            setStatusMessage({ 
              text: `✅ Configurazione salvata e messaggio inviato con successo nel gruppo Telegram! (Bot: @${data.botInfo?.username || 'Attivo'})`, 
              isError: false 
            });
          } else {
            setStatusMessage({ 
              text: `⚠️ Configurazione salvata, ma Telegram non ha inviato il messaggio: ${data.testMessageError || 'Verifica che il Bot sia amministratore del gruppo.'}`, 
              isError: true 
            });
          }
        } else {
          setStatusMessage({ 
            text: `✅ Credenziali salvate con successo nel database! (Bot: @${data.botInfo?.username || 'Attivo'})`, 
            isError: false 
          });
        }
      } else {
        setStatusMessage({ text: `❌ Errore: ${data.error || 'Impossibile salvare la configurazione.'}`, isError: true });
      }
    } catch (err: any) {
      setStatusMessage({ text: `❌ Errore di connessione: ${err.message}`, isError: true });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-stone-900/90 border border-emerald-950/60 rounded-3xl p-5 sm:p-6 shadow-xl space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-stone-800/80 pb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-emerald-400">
              <Bot className="w-4 h-4" />
            </div>
            <h3 className="text-base sm:text-lg font-black text-white tracking-tight uppercase">
              Bot Telegram Indipendente Villaggio
            </h3>
            <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 rounded-full text-[10px] font-extrabold uppercase tracking-wider">
              Reparto Stagno Koh Phayam
            </span>
          </div>
          <p className="text-stone-400 text-xs font-medium">
            Ricevi le notifiche delle nuove prenotazioni, alert overbooking (Auto-Shielding) e sync Octorate nel gruppo dedicato al Villaggio, separato al 100% dalla Pizzeria di Ranong.
          </p>
        </div>

        {/* Live Status Badge */}
        <div className="flex items-center gap-2">
          {botInfo ? (
            <div className="flex items-center gap-2 bg-emerald-950/60 border border-emerald-800/80 px-3 py-1.5 rounded-2xl text-xs font-bold text-emerald-300">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>@{botInfo.username}</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 bg-amber-950/50 border border-amber-800/60 px-3 py-1.5 rounded-2xl text-xs font-bold text-amber-300">
              <span className="w-2 h-2 rounded-full bg-amber-400" />
              <span>Non Connesso</span>
            </div>
          )}
          <button
            type="button"
            onClick={fetchCurrentConfig}
            disabled={initialLoading || loading}
            className="p-2 bg-stone-800 hover:bg-stone-750 text-stone-300 border border-stone-700 rounded-xl transition-all cursor-pointer"
            title="Ricarica stato Telegram"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${initialLoading ? 'animate-spin text-emerald-400' : ''}`} />
          </button>
        </div>
      </div>

      {/* Form Inputs */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Bot Token */}
        <div className="space-y-1.5">
          <label className="text-[11px] font-bold uppercase tracking-wider text-stone-300 flex items-center justify-between">
            <span>TELEGRAM_BOT_TOKEN (Villaggio)</span>
            <span className="text-[10px] text-stone-500 font-normal">Da @BotFather</span>
          </label>
          <div className="relative">
            <input
              type={showToken ? "text" : "password"}
              value={botToken}
              onChange={(e) => setBotToken(e.target.value)}
              placeholder="es. 8192345678:AAH..."
              className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3.5 py-2.5 pr-10 text-xs text-white placeholder:text-stone-600 focus:outline-none focus:border-emerald-500/60 font-mono"
            />
            <button
              type="button"
              onClick={() => setShowToken(!showToken)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-500 hover:text-stone-300 transition-colors"
            >
              {showToken ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Chat ID */}
        <div className="space-y-1.5">
          <label className="text-[11px] font-bold uppercase tracking-wider text-stone-300 flex items-center justify-between">
            <span>TELEGRAM_CHAT_ID (Gruppo Villaggio)</span>
            <span className="text-[10px] text-stone-500 font-normal">es. -100... o -...</span>
          </label>
          <div className="relative">
            <input
              type="text"
              value={chatId}
              onChange={(e) => setChatId(e.target.value)}
              placeholder="es. -1002345678901 o -987654321"
              className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder:text-stone-600 focus:outline-none focus:border-emerald-500/60 font-mono"
            />
          </div>
        </div>
      </div>

      {/* Status Alert */}
      {statusMessage && (
        <div className={`p-3.5 rounded-2xl border text-xs flex items-center gap-2.5 ${
          statusMessage.isError 
            ? 'bg-red-950/60 border-red-800/80 text-red-200' 
            : 'bg-emerald-950/60 border-emerald-800/80 text-emerald-200'
        }`}>
          {statusMessage.isError ? (
            <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
          ) : (
            <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0" />
          )}
          <span className="font-medium leading-relaxed">{statusMessage.text}</span>
        </div>
      )}

      {/* Buttons */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2">
        <button
          type="button"
          onClick={() => setShowInstructions(!showInstructions)}
          className="text-stone-400 hover:text-stone-200 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
        >
          <HelpCircle className="w-3.5 h-3.5 text-emerald-400" />
          <span>{showInstructions ? 'Nascondi Istruzioni Creazione Bot' : 'Come creare Bot e Gruppo Telegram?'}</span>
        </button>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => handleSaveAndTest(false)}
            disabled={loading}
            className="px-4 py-2.5 bg-stone-800 hover:bg-stone-750 text-stone-200 border border-stone-700 text-xs font-bold rounded-xl transition-all cursor-pointer disabled:opacity-50"
          >
            Salva Solo Credenziali
          </button>

          <button
            type="button"
            onClick={() => handleSaveAndTest(true)}
            disabled={loading}
            className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black uppercase tracking-wider rounded-xl shadow-lg shadow-emerald-950/50 transition-all cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
            <span>Invia Messaggio di Prova & Salva</span>
          </button>
        </div>
      </div>

      {/* Step by step Instructions Card */}
      {showInstructions && (
        <div className="bg-stone-950/90 border border-stone-800/80 rounded-2xl p-4 sm:p-5 space-y-3.5 text-xs text-stone-300">
          <div className="flex items-center gap-2 text-emerald-400 font-extrabold uppercase tracking-wider text-[11px]">
            <MessageSquare className="w-4 h-4" />
            <span>Guida Rapida: Creazione Bot e Gruppo Telegram Villaggio</span>
          </div>

          <ol className="list-decimal list-inside space-y-2 text-stone-400 leading-relaxed font-normal">
            <li>
              <strong className="text-white">Crea il Bot:</strong> Apri Telegram e cerca <code className="bg-stone-800 text-emerald-300 px-1 py-0.5 rounded">@BotFather</code>. Invia il comando <code className="bg-stone-800 text-emerald-300 px-1 py-0.5 rounded">/newbot</code>.
            </li>
            <li>
              <strong className="text-white">Assegna un Nome e Username:</strong> Ad esempio nome: <em>Flower Power Village Staff</em> e username: <em>flower_power_village_bot</em>.
            </li>
            <li>
              <strong className="text-white">Copia il Token:</strong> BotFather ti fornirà una stringa (es. <code>123456789:ABCDefgh...</code>). Incollala nel campo <strong>TELEGRAM_BOT_TOKEN</strong> sopra.
            </li>
            <li>
              <strong className="text-white">Crea il Gruppo Telegram:</strong> Crea un nuovo gruppo su Telegram (es. <em>Staff Flower Power Village</em>) e <strong>aggiungi il nuovo bot</strong> come membro.
            </li>
            <li>
              <strong className="text-white">Rendi il Bot Amministratore:</strong> Nelle impostazioni del gruppo Telegram, promuovi il bot ad <strong>Amministratore</strong> (con permessi di invio messaggi).
            </li>
            <li>
              <strong className="text-white">Trova il Chat ID del Gruppo:</strong> Aggiungi temporaneamente il bot <code className="bg-stone-800 text-emerald-300 px-1 py-0.5 rounded">@RawDataBot</code> al tuo gruppo; esso risponderà stampando il Chat ID (è un numero negativo, spesso inizia per <code className="bg-stone-800 text-emerald-300 px-1 py-0.5 rounded">-100...</code>). Rimuovi poi RawDataBot e incolla l'ID nel campo <strong>TELEGRAM_CHAT_ID</strong>.
            </li>
            <li>
              <strong className="text-white">Verifica:</strong> Clicca sul pulsante <strong>"Invia Messaggio di Prova & Salva"</strong>: riceverai subito la conferma nel nuovo gruppo Telegram del Villaggio!
            </li>
          </ol>
        </div>
      )}
    </div>
  );
}
