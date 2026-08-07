import React, { useState } from 'react';
import {
  Wifi,
  Snowflake,
  Lock,
  Droplets,
  Wind,
  Utensils,
  Coffee,
  Laptop,
  Sofa,
  Sprout,
  Sun,
  Maximize,
  Armchair,
  Waves,
  Dumbbell,
  Sparkles,
  Briefcase,
  Save,
  CheckCircle,
  AlertCircle,
  Loader2,
  Info
} from 'lucide-react';
import { supabase } from '../../../lib/supabase';

export interface AccommodationFeaturesEditorProps {
  accommodation: any;
  onSaveSuccess?: (updatedFeatures: any) => void;
}

interface FeatureDef {
  key: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

interface CategoryGroup {
  id: string;
  title: string;
  features: FeatureDef[];
}

const editorCategories: CategoryGroup[] = [
  {
    id: 'space_connectivity',
    title: '1. Spazio & Connettività',
    features: [
      { key: 'wifi', label: 'Wi-Fi', icon: Wifi },
      { key: 'hubit_coworking', label: 'Accesso HUBit@ CoWorking (100Mbps)', icon: Briefcase }
    ]
  },
  {
    id: 'climate_safety',
    title: '2. Clima & Sicurezza',
    features: [
      { key: 'air_conditioning', label: 'Aria Condizionata', icon: Snowflake },
      { key: 'ceiling_fan', label: 'Ventilatore a soffitto', icon: Wind },
      { key: 'safe', label: 'Cassaforte', icon: Lock }
    ]
  },
  {
    id: 'interior_comfort',
    title: '3. Interni & Comfort',
    features: [
      { key: 'desk', label: 'Scrivania / Area lavoro', icon: Laptop },
      { key: 'sofa_bed', label: 'Divano Letto', icon: Sofa }
    ]
  },
  {
    id: 'kitchen_amenities',
    title: '4. Cucina & Servizi',
    features: [
      { key: 'hot_water', label: 'Acqua Calda', icon: Droplets },
      { key: 'kitchen', label: 'Cucina privata', icon: Utensils },
      { key: 'refrigerator', label: 'Frigorifero', icon: Coffee }
    ]
  },
  {
    id: 'private_outdoor',
    title: '5. Aree Esterne Private',
    features: [
      { key: 'outdoor_lounge', label: "Salotto all'aperto", icon: Armchair },
      { key: 'terrace_balcony', label: 'Terrazzo o Balcone', icon: Sun },
      { key: 'private_garden', label: 'Giardino privato', icon: Sprout }
    ]
  },
  {
    id: 'resort_facilities',
    title: '6. Servizi Comuni del Resort',
    features: [
      { key: 'swimming_pool', label: 'Piscina', icon: Waves },
      { key: 'gym', label: 'Palestra / Fitness', icon: Dumbbell },
      { key: 'yoga_temple', label: 'Tempio Yoga', icon: Sparkles }
    ]
  }
];

export const AccommodationFeaturesEditor: React.FC<AccommodationFeaturesEditorProps> = ({
  accommodation,
  onSaveSuccess
}) => {
  // Parse initial details / features safely
  const initialDetails = typeof accommodation?.details === 'object' && accommodation?.details !== null
    ? accommodation.details
    : (typeof accommodation?.details === 'string' ? (() => { try { return JSON.parse(accommodation.details); } catch { return {}; } })() : {});

  const initialFeatures = accommodation?.features || initialDetails?.features || {};

  const [roomSize, setRoomSize] = useState<number>(() => {
    return accommodation?.squareMeters || initialDetails?.squareMeters || initialFeatures?.room_size || 0;
  });

  const [features, setFeatures] = useState<Record<string, boolean>>(() => ({
    wifi: Boolean(initialFeatures?.wifi),
    hubit_coworking: Boolean(initialFeatures?.hubit_coworking),
    air_conditioning: Boolean(initialFeatures?.air_conditioning),
    ceiling_fan: Boolean(initialFeatures?.ceiling_fan),
    safe: Boolean(initialFeatures?.safe),
    desk: Boolean(initialFeatures?.desk),
    sofa_bed: Boolean(initialFeatures?.sofa_bed),
    hot_water: Boolean(initialFeatures?.hot_water),
    kitchen: Boolean(initialFeatures?.kitchen),
    refrigerator: Boolean(initialFeatures?.refrigerator),
    outdoor_lounge: Boolean(initialFeatures?.outdoor_lounge),
    terrace_balcony: Boolean(initialFeatures?.terrace_balcony),
    private_garden: Boolean(initialFeatures?.private_garden),
    swimming_pool: Boolean(initialFeatures?.swimming_pool),
    gym: Boolean(initialFeatures?.gym),
    yoga_temple: Boolean(initialFeatures?.yoga_temple)
  }));

  const [acNote, setAcNote] = useState<string>(() => {
    if (typeof initialFeatures?.ac_consumption_note === 'string') {
      return initialFeatures.ac_consumption_note;
    }
    if (typeof initialFeatures?.ac_consumption_note === 'object' && initialFeatures?.ac_consumption_note !== null) {
      return initialFeatures.ac_consumption_note.it || initialFeatures.ac_consumption_note.en || '';
    }
    return "Aria Condizionata disponibile in ogni camera. Se non è inclusa o prepagata nella tua prenotazione, è utilizzabile a consumo al costo di 40 THB per kWh (pari a circa 20 THB all'ora). Si consiglia di tenere porte e finestre chiuse mentre è in funzione.";
  });

  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<{ success: boolean; message: string } | null>(null);

  const toggleFeature = (key: string) => {
    setFeatures((prev) => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    setSaveStatus(null);

    try {
      const updatedFeatures = {
        room_size: Number(roomSize) || 0,
        wifi: Boolean(features.wifi),
        hubit_coworking: Boolean(features.hubit_coworking),
        air_conditioning: Boolean(features.air_conditioning),
        ceiling_fan: Boolean(features.ceiling_fan),
        safe: Boolean(features.safe),
        desk: Boolean(features.desk),
        sofa_bed: Boolean(features.sofa_bed),
        hot_water: Boolean(features.hot_water),
        kitchen: Boolean(features.kitchen),
        refrigerator: Boolean(features.refrigerator),
        outdoor_lounge: Boolean(features.outdoor_lounge),
        terrace_balcony: Boolean(features.terrace_balcony),
        private_garden: Boolean(features.private_garden),
        swimming_pool: Boolean(features.swimming_pool),
        gym: Boolean(features.gym),
        yoga_temple: Boolean(features.yoga_temple),
        ac_consumption_note: acNote
      };

      const updatedDetails = {
        ...initialDetails,
        squareMeters: Number(roomSize) || 0,
        features: updatedFeatures
      };

      // Perform update query on Supabase table 'accommodations' by id
      const { error } = await supabase
        .from('accommodations')
        .update({
          details: updatedDetails,
          features: updatedFeatures
        })
        .eq('id', accommodation.id);

      if (error) {
        // Fallback update if features column is missing
        const { error: fallbackErr } = await supabase
          .from('accommodations')
          .update({
            details: updatedDetails
          })
          .eq('id', accommodation.id);

        if (fallbackErr) throw fallbackErr;
      }

      setSaveStatus({
        success: true,
        message: 'Caratteristiche aggiornate con successo su Supabase!'
      });

      if (onSaveSuccess) {
        onSaveSuccess(updatedFeatures);
      }
    } catch (err: any) {
      console.error('Errore durante il salvataggio delle caratteristiche:', err);
      setSaveStatus({
        success: false,
        message: err?.message || 'Errore durante il salvataggio delle caratteristiche.'
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-stone-900/30 border border-stone-800/80 rounded-2xl p-6 space-y-6 text-stone-200">
      <div className="flex items-center justify-between border-b border-stone-800 pb-3">
        <div className="flex items-center gap-2.5 text-emerald-400 font-black text-sm uppercase tracking-wider">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
          <span>GESTORI CARATTERISTICHE ALLOGGIO ({accommodation?.name})</span>
        </div>
      </div>

      {/* METRATURA ROOM SIZE INPUT */}
      <div className="space-y-2 bg-stone-950/40 p-4 rounded-xl border border-stone-800/80">
        <label className="text-xs font-bold text-stone-300 uppercase tracking-wider flex items-center gap-2">
          <span>METRATURA CAMERA (MQ)</span>
        </label>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-stone-900 border border-stone-800 text-emerald-400 flex-shrink-0 shadow-inner">
            <Maximize className="w-5 h-5" />
          </div>
          <div className="relative flex-1 max-w-xs">
            <input
              type="number"
              min="0"
              value={roomSize}
              onChange={(e) => setRoomSize(Number(e.target.value))}
              className="w-full bg-stone-950 border border-stone-800 rounded-xl px-4 py-2 text-sm text-white font-mono font-bold focus:outline-none focus:border-emerald-500 transition-colors"
              placeholder="es. 35"
            />
            <span className="absolute right-3 top-2.5 text-xs text-stone-400 font-bold">mq</span>
          </div>
        </div>
      </div>

      {/* 6 CATEGORIZED SECTIONS */}
      <div className="space-y-6">
        {editorCategories.map((group) => (
          <div key={group.id} className="space-y-3 bg-stone-950/30 p-4 rounded-xl border border-stone-800/60">
            <h5 className="text-xs font-black text-emerald-400 uppercase tracking-wider border-b border-stone-800/80 pb-2">
              {group.title}
            </h5>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {group.features.map((def) => {
                const IconComp = def.icon;
                const isChecked = Boolean(features[def.key]);
                return (
                  <div
                    key={def.key}
                    onClick={() => toggleFeature(def.key)}
                    className={`border rounded-xl p-3 flex items-center justify-between gap-3 cursor-pointer select-none transition-all ${
                      isChecked
                        ? 'border-emerald-500/60 bg-stone-900/80 shadow-md'
                        : 'border-stone-800/80 bg-stone-950/40 opacity-60 hover:opacity-100'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={`w-9 h-9 rounded-lg flex items-center justify-center border flex-shrink-0 transition-all ${
                        isChecked
                          ? 'bg-stone-900 border-stone-800 text-emerald-400'
                          : 'bg-stone-950 border-stone-800 text-stone-500'
                      }`}>
                        <IconComp className="w-4 h-4" />
                      </div>
                      <span className="text-xs font-bold text-stone-200 truncate">
                        {def.label}
                      </span>
                    </div>

                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => {}}
                      className="w-4 h-4 accent-emerald-500 cursor-pointer flex-shrink-0"
                    />
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* AIR CONDITIONING CONSUMPTION NOTE TEXTAREA */}
      {features.air_conditioning && (
        <div className="space-y-2 pt-2 border-t border-stone-800">
          <label className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-2">
            <Info className="w-4 h-4" />
            <span>NOTA ARIA CONDIZIONATA A CONSUMO (TESTO INFORMATIVO)</span>
          </label>
          <textarea
            rows={3}
            value={acNote}
            onChange={(e) => setAcNote(e.target.value)}
            className="w-full bg-stone-950 border border-stone-800 rounded-xl p-3 text-xs text-stone-200 leading-relaxed font-sans focus:outline-none focus:border-emerald-500 transition-colors"
          />
        </div>
      )}

      {/* SAVE STATUS MESSAGE */}
      {saveStatus && (
        <div className={`p-3 rounded-xl border text-xs font-bold flex items-center gap-2 ${
          saveStatus.success
            ? 'bg-emerald-950/50 border-emerald-500/50 text-emerald-300'
            : 'bg-red-950/50 border-red-500/50 text-red-300'
        }`}>
          {saveStatus.success ? <CheckCircle className="w-4 h-4 flex-shrink-0 text-emerald-400" /> : <AlertCircle className="w-4 h-4 flex-shrink-0 text-red-400" />}
          <span>{saveStatus.message}</span>
        </div>
      )}

      {/* SAVE BUTTON */}
      <div className="flex justify-end pt-2">
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-extrabold text-xs px-6 py-3 rounded-xl shadow-lg transition-all cursor-pointer disabled:opacity-50"
        >
          {saving ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>SALVATAGGIO...</span>
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              <span>SALVA CARATTERISTICHE</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default AccommodationFeaturesEditor;
