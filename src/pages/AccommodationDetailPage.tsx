import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Check, Users, BedDouble, Bath, ArrowLeft, Home, Loader2 } from 'lucide-react';
import { fetchAccommodationBySlug, type Accommodation, typeLabels } from '../data/accommodationsData';

const typeTagColor: Record<string, string> = {
  villa: 'bg-amber-600',
  bungalow: 'bg-emerald-700',
  room: 'bg-stone-600',
  lodge: 'bg-stone-700',
  tent: 'bg-teal-700',
};

export default function AccommodationDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const [accommodation, setAccommodation] = useState<Accommodation | null | undefined>(undefined);

  useEffect(() => {
    if (!slug) { setAccommodation(null); return; }
    fetchAccommodationBySlug(slug)
      .then(setAccommodation)
      .catch(() => setAccommodation(null));
  }, [slug]);

  if (accommodation === undefined) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <Loader2 size={28} className="text-amber-500 animate-spin" />
      </div>
    );
  }

  if (accommodation === null) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center px-6 text-center">
        <p
          className="text-stone-300 mb-4 select-none"
          style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', fontSize: 'clamp(4rem, 12vw, 8rem)', fontWeight: 300 }}
        >
          404
        </p>
        <h1
          className="text-stone-800 mb-3"
          style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', fontSize: 'clamp(1.5rem, 4vw, 2.5rem)', fontWeight: 300 }}
        >
          Room not found
        </h1>
        <p className="text-stone-500 text-sm mb-8 max-w-sm">
          This accommodation doesn't exist or may have been renamed. Browse all available rooms below.
        </p>
        <Link
          to="/village"
          className="inline-flex items-center gap-2 px-6 py-3 bg-amber-600 text-white text-xs tracking-[0.15em] uppercase hover:bg-amber-700 transition-colors"
          style={{ fontFamily: 'Inter, sans-serif' }}
        >
          Tutti gli Alloggi
        </Link>
      </div>
    );
  }

  const tagColor = typeTagColor[accommodation.type] ?? 'bg-stone-600';

  return (
    <div className="min-h-screen bg-white">
      {/* Top nav bar */}
      <nav className="sticky top-0 z-50 bg-white border-b border-stone-100 px-6 py-4 flex items-center justify-between">
        <Link
          to="/village"
          className="inline-flex items-center gap-2 text-stone-500 hover:text-stone-800 transition-colors text-sm"
          style={{ fontFamily: 'Inter, sans-serif' }}
        >
          <ArrowLeft size={16} />
          Tutti gli Alloggi
        </Link>
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-stone-400 hover:text-stone-700 transition-colors text-xs tracking-widest uppercase"
          style={{ fontFamily: 'Inter, sans-serif' }}
        >
          <Home size={14} />
          Home
        </Link>
      </nav>

      <main className="max-w-5xl mx-auto px-6 py-12 md:py-16">
        {/* Header */}
        <div className="mb-10">
          <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
            <div>
              <span
                className={`inline-block ${tagColor} text-white text-xs px-3 py-1 tracking-wide uppercase mb-3`}
                style={{ fontFamily: 'Inter, sans-serif' }}
              >
                {typeLabels[accommodation.type]}
              </span>
              <h1
                className="text-stone-800"
                style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', fontSize: 'clamp(2rem, 5vw, 3.5rem)', fontWeight: 300, lineHeight: 1.1 }}
              >
                {accommodation.name}
              </h1>
            </div>
            {accommodation.price_per_night > 0 && (
              <div className="text-right">
                <p className="text-xs text-stone-400 uppercase tracking-wide mb-1" style={{ fontFamily: 'Inter, sans-serif' }}>
                  From
                </p>
                <p
                  className="text-stone-800"
                  style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', fontSize: '2rem', fontWeight: 400 }}
                >
                  ฿{accommodation.price_per_night.toLocaleString()}
                </p>
                <p className="text-xs text-stone-400" style={{ fontFamily: 'Inter, sans-serif' }}>per night</p>
              </div>
            )}
          </div>
          <div className="w-12 h-px bg-amber-500" />
        </div>

        {/* Image gallery */}
        {accommodation.images.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-12">
            {accommodation.images.map((src, i) => (
              <div
                key={i}
                className={`overflow-hidden ${i === 0 ? 'md:col-span-2 aspect-[16/7]' : 'aspect-[4/3]'}`}
              >
                <img
                  src={src}
                  alt={`${accommodation.name} — photo ${i + 1}`}
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="aspect-[16/7] bg-stone-50 border border-stone-100 flex items-center justify-center mb-12">
            <p className="text-stone-300 text-sm" style={{ fontFamily: 'Inter, sans-serif' }}>
              Photos coming soon
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {/* Left: description + features */}
          <div className="md:col-span-2 space-y-8">
            <p className="text-stone-500 leading-relaxed" style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.9375rem' }}>
              {accommodation.description}
            </p>

            {/* Quick stats */}
            <div className="grid grid-cols-3 gap-4">
              {[
                { icon: <Users size={18} className="text-amber-600" />, label: 'Guests', value: `Up to ${accommodation.capacity}` },
                { icon: <BedDouble size={18} className="text-amber-600" />, label: 'Rooms', value: accommodation.rooms },
                { icon: <Bath size={18} className="text-amber-600" />, label: 'Bathrooms', value: accommodation.bathrooms },
              ].map(({ icon, label, value }) => (
                <div key={label} className="p-4 bg-stone-50 border border-stone-100 text-center">
                  <div className="flex justify-center mb-2">{icon}</div>
                  <p className="text-stone-800 font-medium text-sm mb-0.5" style={{ fontFamily: 'Inter, sans-serif' }}>{value}</p>
                  <p className="text-stone-400 text-xs uppercase tracking-wide" style={{ fontFamily: 'Inter, sans-serif' }}>{label}</p>
                </div>
              ))}
            </div>

            {/* Bed configuration */}
            <div>
              <p className="text-xs text-stone-400 uppercase tracking-[0.2em] mb-2" style={{ fontFamily: 'Inter, sans-serif' }}>
                Bed Configuration
              </p>
              <p className="text-stone-600 text-sm" style={{ fontFamily: 'Inter, sans-serif' }}>
                {accommodation.beds}
              </p>
            </div>

            {/* Features */}
            <div>
              <p className="text-xs text-stone-400 uppercase tracking-[0.2em] mb-4" style={{ fontFamily: 'Inter, sans-serif' }}>
                What's Included
              </p>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {accommodation.features.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm text-stone-500" style={{ fontFamily: 'Inter, sans-serif' }}>
                    <Check size={13} className="text-amber-500 shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Right: booking panel */}
          <div className="md:col-span-1">
            <div className="sticky top-24 p-6 border border-stone-200 bg-stone-50 space-y-5">
              <div>
                <p
                  className="text-stone-800 mb-1"
                  style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', fontSize: '1.25rem', fontWeight: 400 }}
                >
                  Reserve this room
                </p>
                <div className="w-8 h-px bg-amber-500" />
              </div>

              <div className="space-y-2 text-xs text-stone-500" style={{ fontFamily: 'Inter, sans-serif' }}>
                <div className="flex justify-between py-2 border-b border-stone-200">
                  <span>Check-in</span><span className="text-stone-700 font-medium">13:00 – 21:30</span>
                </div>
                <div className="flex justify-between py-2 border-b border-stone-200">
                  <span>Check-out</span><span className="text-stone-700 font-medium">By 11:00</span>
                </div>
                <div className="flex justify-between py-2">
                  <span>Direct booking</span><span className="text-amber-600 font-medium">10% off OTAs</span>
                </div>
              </div>

              <Link
                to="/village/contact"
                className="block w-full py-3 bg-amber-600 text-white text-xs tracking-[0.15em] uppercase text-center hover:bg-amber-700 transition-colors"
                style={{ fontFamily: 'Inter, sans-serif' }}
              >
                Book Now
              </Link>

              <p className="text-xs text-stone-400 text-center leading-relaxed" style={{ fontFamily: 'Inter, sans-serif' }}>
                We reply within a few hours via WhatsApp or email.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
