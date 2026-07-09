import React from 'react';
import { Globe } from 'lucide-react';

export default function PageLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen text-foreground font-sans antialiased selection:bg-accent pb-1" style={{ backgroundColor: '#e7e5e4' }}>
      <div className="max-w-6xl mx-auto px-4 mt-20 md:mt-24">
        {/* Header Card */}
        <header className="relative text-stone-100 py-5 lg:py-12 px-4 md:px-8 overflow-hidden rounded-2xl shadow-lg" style={{ backgroundColor: '#3b3530' }}>
          <div
            className="absolute inset-0 opacity-45 bg-cover bg-center"
            style={{
              backgroundImage:
                "url('https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1600&q=80')",
            }}
          />
          <div className="absolute inset-0 bg-stone-950/30 backdrop-blur-[0.5px]" />

          {/* Static IT flag for visual consistency */}
          <div className="absolute top-3 right-3 md:top-4 md:right-4 z-20">
            <div className="flex items-center gap-1 bg-black/45 backdrop-blur-md px-2.5 py-1 rounded-xl border border-white/10 shadow-sm text-stone-300 font-bold text-[10px] uppercase">
              <Globe className="w-3.5 h-3.5" />
              <span>IT</span>
            </div>
          </div>

          <div className="relative z-10">
            <div className="flex flex-col lg:flex-row items-center justify-between gap-4 lg:gap-8">
              {/* Left Side: Logo + Title */}
              <div className="flex flex-col lg:flex-row items-center gap-3.5 lg:gap-6 text-center lg:text-left w-full lg:w-auto">
                <img
                  src="https://htmnjjzxpybpbumtbqic.supabase.co/storage/v1/object/public/assets/logo_flower_power_village.png"
                  alt="Logo Flower Power Village"
                  width={200}
                  height={200}
                  className="h-16 lg:h-48 w-auto drop-shadow-md mx-auto lg:mx-0 flex-shrink-0"
                />
                <div className="flex flex-col items-center lg:items-start lg:pl-8 lg:translate-y-4">
                  <h1 className="text-xl sm:text-2xl md:text-4xl lg:text-5xl font-sans font-black tracking-tight text-stone-100 leading-tight text-center lg:text-left">
                    Flower Power Village
                  </h1>
                  <span className="text-[#a2b997] font-bold tracking-widest text-[9px] md:text-xs uppercase mt-1 lg:mt-2.5 text-center lg:text-left">
                    Koh Phayam, Thailandia
                  </span>
                </div>
              </div>

              {/* Right Side: Tagline block */}
              <div className="flex flex-col items-center lg:items-end gap-1.5 text-center lg:text-right max-w-md w-full lg:w-auto mt-2 lg:mt-0">
                <span className="text-xs sm:text-sm md:text-xl lg:text-2xl font-extrabold text-stone-100 tracking-tight block uppercase bg-white/10 lg:bg-transparent px-3 py-0.5 rounded-full lg:p-0">
                  Oasi Tropicale
                </span>
                <span className="text-[8px] md:text-xs lg:text-sm font-bold text-[#a2b997] tracking-widest block uppercase">
                  Natura • Benessere • Lavoro
                </span>
                <div className="flex flex-row flex-wrap justify-center lg:justify-end gap-x-2 gap-y-0.5 text-[8px] md:text-xs font-light text-stone-200 mt-0.5">
                  <span>Piscina • Palestra • Yoga</span>
                  <span className="text-stone-400">•</span>
                  <span>Massaggi Thai & Coworking</span>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Content wrapper */}
        <div className="mt-6 bg-white rounded-2xl shadow-lg overflow-hidden border border-stone-300">
          {children}
        </div>
      </div>
    </div>
  );
}
