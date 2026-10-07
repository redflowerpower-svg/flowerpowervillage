import React, { useEffect, useState } from 'react';
import { 
  Wifi, 
  ShieldCheck, 
  RefreshCw, 
  Smartphone, 
  Laptop, 
  Plus, 
  Trash2, 
  ExternalLink, 
  Clock, 
  CheckCircle2, 
  AlertTriangle,
  Loader2
} from 'lucide-react';
import { 
  fetchNetworkWhitelist, 
  saveNetworkWhitelist, 
  type NetworkNode, 
  type PersistentDevice 
} from '../../../pizza/services/networkAuthService';

export const DiningNetworkSettingsCard: React.FC = () => {
  const [nodes, setNodes] = useState<NetworkNode[]>([]);
  const [devices, setDevices] = useState<PersistentDevice[]>([]);
  const [clientIp, setClientIp] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  // New IP form
  const [newIp, setNewIp] = useState('');
  const [newLabel, setNewLabel] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);

  const loadData = async () => {
    setLoading(true);
    const data = await fetchNetworkWhitelist();
    if (data.success) {
      setNodes(data.nodes || []);
      setDevices(data.persistentDevices || []);
      if (data.clientIp) setClientIp(data.clientIp);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleToggleNode = async (nodeId: string) => {
    const updated = nodes.map(n => n.id === nodeId ? { ...n, is_active: !n.is_active } : n);
    setNodes(updated);
    setSaving(true);
    await saveNetworkWhitelist(updated, devices);
    setSaving(false);
  };

  const handleDeleteNode = async (nodeId: string) => {
    if (!window.confirm('Rimuovere questo nodo IP dalla whitelist della pizzeria?')) return;
    const updated = nodes.filter(n => n.id !== nodeId);
    setNodes(updated);
    setSaving(true);
    await saveNetworkWhitelist(updated, devices);
    setSaving(false);
  };

  const handleRevokeDevice = async (deviceId: string) => {
    if (!window.confirm('Revocare l\'autorizzazione permanente per questo dispositivo?')) return;
    const updated = devices.filter(d => d.deviceId !== deviceId);
    setDevices(updated);
    setSaving(true);
    await saveNetworkWhitelist(nodes, updated);
    setSaving(false);
  };

  const handleAddManualNode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newIp.trim()) return;

    const newNode: NetworkNode = {
      id: 'node-manual-' + Date.now(),
      public_ip: newIp.trim(),
      location: 'ranong_pizzeria',
      label: newLabel.trim() || 'Router Secondario / Backup',
      last_heartbeat_at: new Date().toISOString(),
      is_active: true,
      created_at: new Date().toISOString()
    };

    const updated = [...nodes, newNode];
    setNodes(updated);
    setSaving(true);
    await saveNetworkWhitelist(updated, devices);
    setSaving(false);

    setNewIp('');
    setNewLabel('');
    setShowAddForm(false);
    setSuccessMsg('Nuovo IP autorizzato salvato con successo.');
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  return (
    <div className="p-6 bg-stone-950/70 rounded-2xl border border-stone-800 space-y-6">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-stone-800/80">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center">
              <Wifi className="w-4 h-4 text-amber-400" />
            </div>
            <div>
              <h3 className="text-sm font-black text-white uppercase tracking-wider">
                Protezione Rete & Accesso Dining Tablet (Wi-Fi 2.4G/5G)
              </h3>
              <p className="text-[11px] text-stone-400">
                I tablet di sala e i clienti al tavolo possono accedere solo se connessi alla rete del ristorante.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={loadData}
            disabled={loading}
            className="px-3 py-1.5 rounded-xl bg-stone-900 hover:bg-stone-800 border border-stone-700 text-stone-300 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-amber-400 ${loading ? 'animate-spin' : ''}`} />
            <span>Aggiorna</span>
          </button>

          <a
            href="/dining"
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-stone-950 text-xs font-black flex items-center gap-1.5 shadow-md transition-all cursor-pointer"
          >
            <span>Apri Dining Tablet</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>

      {/* Success notice */}
      {successMsg && (
        <div className="p-3 bg-emerald-950/70 border border-emerald-800 rounded-xl flex items-center gap-2 text-emerald-200 text-xs">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Client IP and Auto-Beacon Status */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="p-4 bg-stone-900/80 border border-stone-800 rounded-xl space-y-1">
          <div className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">
            Tuo Indirizzo IP Attuale
          </div>
          <div className="text-sm font-mono font-black text-amber-400">
            {clientIp || 'Rilevamento in corso...'}
          </div>
          <div className="text-[10px] text-stone-500">
            {nodes.some(n => n.is_active && n.public_ip === clientIp) ? (
              <span className="text-emerald-400 font-bold flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> Connesso alla rete autorizzata del ristorante
              </span>
            ) : (
              <span className="text-stone-400">Rete attuale diversa dai nodi registrati</span>
            )}
          </div>
        </div>

        <div className="p-4 bg-stone-900/80 border border-stone-800 rounded-xl space-y-1">
          <div className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">
            Auto-Allineamento IP Dinamico (Heartbeat)
          </div>
          <div className="text-sm font-bold text-emerald-400 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Attivo da Kitchen Tablet (KDS)</span>
          </div>
          <div className="text-[10px] text-stone-500">
            Se il modem si riavvia, il tablet cucina aggiorna l'IP su Supabase automaticamente.
          </div>
        </div>
      </div>

      {/* Nodes List */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-bold text-stone-300 uppercase tracking-wider flex items-center gap-1.5">
            <Wifi className="w-3.5 h-3.5 text-amber-400" />
            Nodi Wi-Fi & Router Autorizzati ({nodes.length})
          </h4>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="text-xs text-amber-400 hover:text-amber-300 font-bold flex items-center gap-1 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Aggiungi IP Manuale</span>
          </button>
        </div>

        {/* Add Form */}
        {showAddForm && (
          <form onSubmit={handleAddManualNode} className="p-4 bg-stone-900 border border-stone-800 rounded-xl space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] font-bold text-stone-400 uppercase block mb-1">
                  Indirizzo IP Pubblico (WAN)
                </label>
                <input
                  type="text"
                  required
                  value={newIp}
                  onChange={e => setNewIp(e.target.value)}
                  placeholder="es. 182.232.100.55"
                  className="w-full bg-stone-950 border border-stone-700 text-white rounded-lg px-3 py-2 text-xs font-mono focus:border-amber-400 outline-none"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-stone-400 uppercase block mb-1">
                  Etichetta / Descrizione
                </label>
                <input
                  type="text"
                  value={newLabel}
                  onChange={e => setNewLabel(e.target.value)}
                  placeholder="es. Router Pizzeria Fibra"
                  className="w-full bg-stone-950 border border-stone-700 text-white rounded-lg px-3 py-2 text-xs focus:border-amber-400 outline-none"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="px-3 py-1.5 rounded-lg bg-stone-800 text-stone-300 text-xs font-bold cursor-pointer"
              >
                Annulla
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-4 py-1.5 rounded-lg bg-amber-400 text-stone-950 text-xs font-black cursor-pointer disabled:opacity-50"
              >
                {saving ? 'Salvataggio...' : 'Salva IP'}
              </button>
            </div>
          </form>
        )}

        {nodes.length === 0 ? (
          <div className="p-4 bg-stone-900/50 border border-stone-800/80 rounded-xl text-center text-xs text-stone-400">
            Nessun router registrato. Apri il Kitchen Tablet nel ristorante o aggiungi un IP manuale per avviare il monitoraggio.
          </div>
        ) : (
          <div className="space-y-2">
            {nodes.map(node => (
              <div
                key={node.id}
                className={`p-3.5 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-all ${
                  node.is_active
                    ? 'bg-stone-900/90 border-stone-800 hover:border-stone-700'
                    : 'bg-stone-950/40 border-stone-900 opacity-60'
                }`}
              >
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-black text-amber-400">
                      {node.public_ip}
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-stone-800 text-stone-300 border border-stone-700">
                      {node.label || 'Router Ristorante'}
                    </span>
                    {node.is_active ? (
                      <span className="text-emerald-400 text-[10px] font-bold flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> Attivo
                      </span>
                    ) : (
                      <span className="text-stone-500 text-[10px] font-bold">
                        Disattivato
                      </span>
                    )}
                  </div>
                  <div className="text-[10px] text-stone-500 flex items-center gap-1">
                    <Clock className="w-2.5 h-2.5" />
                    <span>Ultimo segnale: {node.last_heartbeat_at ? new Date(node.last_heartbeat_at).toLocaleString() : 'N/D'}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-auto">
                  <button
                    onClick={() => handleToggleNode(node.id)}
                    className="px-2.5 py-1 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-300 text-[11px] font-bold cursor-pointer transition-all"
                  >
                    {node.is_active ? 'Disattiva' : 'Attiva'}
                  </button>
                  <button
                    onClick={() => handleDeleteNode(node.id)}
                    className="p-1.5 rounded-lg bg-red-950/50 hover:bg-red-900 border border-red-800/60 text-red-300 cursor-pointer transition-all"
                    title="Elimina"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Permanently Authorized Remote Devices */}
      <div className="space-y-3 pt-2 border-t border-stone-800/80">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-bold text-stone-300 uppercase tracking-wider flex items-center gap-1.5">
            <Laptop className="w-3.5 h-3.5 text-amber-400" />
            Dispositivi Remoti Sbloccati con Login Admin ({devices.length})
          </h4>
        </div>

        <p className="text-[11px] text-stone-400">
          Dispositivi personali o computer di sviluppo che hanno effettuato il login Master Admin e sono autorizzati a navigare fuori dalla rete Wi-Fi.
        </p>

        {devices.length === 0 ? (
          <div className="p-3 bg-stone-900/40 border border-stone-800/60 rounded-xl text-center text-xs text-stone-500">
            Nessun dispositivo remoto permanentemente autorizzato.
          </div>
        ) : (
          <div className="space-y-2">
            {devices.map(device => (
              <div
                key={device.deviceId}
                className="p-3 bg-stone-900/80 border border-stone-800 rounded-xl flex items-center justify-between gap-3 text-xs"
              >
                <div className="space-y-0.5">
                  <div className="font-bold text-white flex items-center gap-2">
                    <Laptop className="w-3.5 h-3.5 text-stone-400" />
                    <span>{device.deviceName}</span>
                  </div>
                  <div className="text-[10px] text-stone-500">
                    Autorizzato il: {new Date(device.authorizedAt).toLocaleString()} da <strong className="text-stone-400">{device.authorizedBy}</strong>
                  </div>
                </div>

                <button
                  onClick={() => handleRevokeDevice(device.deviceId)}
                  className="px-2.5 py-1 rounded-lg bg-red-950/60 hover:bg-red-900 border border-red-800 text-red-200 text-[11px] font-bold cursor-pointer transition-all flex items-center gap-1"
                >
                  <Trash2 className="w-3 h-3" />
                  <span>Revoca</span>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
};
