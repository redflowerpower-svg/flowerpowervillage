import { Phone, Mail, Instagram, Facebook, MapPin } from 'lucide-react';

const TiktokIcon = ({ className, size = 16 }: { className?: string; size?: number }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5" />
  </svg>
);

interface Props {
  onNavigate: (page: string) => void;
}

export default function VillageFooter({ onNavigate }: Props) {
  return (
    <footer className="bg-stone-900 text-stone-300">
      <div className="max-w-7xl mx-auto px-6 py-16 grid grid-cols-1 md:grid-cols-3 gap-12">
        {/* Brand */}
        <div>
          <div
            className="text-white text-lg font-light tracking-wider italic mb-3"
            style={{ fontFamily: 'Cormorant Garamond, Georgia, serif' }}
          >
            Flower Power Farm Village & Spa
          </div>
          <p className="text-sm text-stone-400 leading-relaxed mb-4">
            One of Thailand's last unspoiled islands. A sanctuary of nature, comfort, and authentic Italian flavour.
          </p>
          <div className="flex items-start gap-3 text-sm text-stone-400">
            <MapPin size={16} className="text-emerald-700 mt-1 shrink-0" />
            <span className="leading-relaxed">
              14/32 Moo 1, Than Boun,<br />Koh Phayam, Ranong, Thailand
            </span>
          </div>
        </div>

        {/* Links */}
        <div>
          <div className="text-white text-xs font-semibold uppercase tracking-wider mb-5">
            Navigazione
          </div>
          <ul className="space-y-3.5 text-sm">
            {[
              { label: 'Alloggi', id: 'accommodations' },
              { label: 'Ristorante', id: 'restaurant' },
              { label: 'Spa & Benessere', id: 'spa' },
              { label: 'Galleria', id: 'gallery' },
              { label: 'Come Raggiungerci', id: 'directions' },
              { label: 'Contatti', id: 'contact' },
            ].map((link) => (
              <li key={link.id}>
                <button
                  onClick={() => onNavigate(link.id)}
                  className="text-stone-400 hover:text-emerald-500 transition-colors uppercase text-xs font-semibold tracking-wider text-left border-0 cursor-pointer"
                >
                  {link.label}
                </button>
              </li>
            ))}
          </ul>
        </div>

        {/* Contacts & Social */}
        <div>
          <div className="text-white text-xs font-semibold uppercase tracking-wider mb-5">
            Contatti & Social
          </div>
          <div className="space-y-4 mb-6">
            <div className="flex flex-col gap-1.5">
              <a
                href="tel:+66958825573"
                className="text-sm text-stone-400 hover:text-emerald-500 transition-colors"
              >
                +66 95 882 5573 <span className="text-stone-500 text-xs">(EN/IT)</span>
              </a>
              <a
                href="tel:+66834512741"
                className="text-sm text-stone-400 hover:text-emerald-500 transition-colors"
              >
                +66 83 451 2741 <span className="text-stone-500 text-xs">(TH)</span>
              </a>
            </div>
            <a
              href="mailto:flowerpowerphayam@gmail.com"
              className="flex items-center gap-3 text-sm text-stone-400 hover:text-emerald-500 transition-colors"
            >
              <Mail size={14} className="text-emerald-700" />
              flowerpowerphayam@gmail.com
            </a>
          </div>
          {/* Social icons */}
          <div className="flex gap-4">
            <a
              href="https://www.tiktok.com/@flowerpowerphayam"
              target="_blank"
              rel="noopener noreferrer"
              className="w-11 h-11 border border-stone-700 flex items-center justify-center hover:border-emerald-700 hover:text-emerald-500 transition-all duration-200 text-stone-400"
            >
              <TiktokIcon size={16} />
            </a>
            <a
              href="https://www.instagram.com/flowerpowerphayam"
              target="_blank"
              rel="noopener noreferrer"
              className="w-11 h-11 border border-stone-700 flex items-center justify-center hover:border-emerald-700 hover:text-emerald-500 transition-all duration-200 text-stone-400"
            >
              <Instagram size={16} />
            </a>
            <a
              href="https://www.facebook.com/flowerpowerphayam"
              target="_blank"
              rel="noopener noreferrer"
              className="w-11 h-11 border border-stone-700 flex items-center justify-center hover:border-emerald-700 hover:text-emerald-500 transition-all duration-200 text-stone-400"
            >
              <Facebook size={16} />
            </a>
          </div>

          <div className="mt-6 p-4 border border-emerald-800 bg-emerald-950 bg-opacity-30 rounded">
            <p className="text-xs text-emerald-500 tracking-wide font-medium mb-1">Direct Booking Offer</p>
            <p className="text-xs text-stone-400">Book directly and save 10% vs. all online travel agencies.</p>
          </div>
        </div>
      </div>

      <div className="border-t border-stone-800 px-6 py-5">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-stone-600">
            © {new Date().getFullYear()} Flower Power Farm Village & Spa · Koh Phayam, Thailand
          </p>
          <div className="flex items-center gap-1 text-xs text-stone-600">
            <span className="text-emerald-750">EN</span>
            <span>·</span>
            <span>IT</span>
            <span>·</span>
            <span>TH</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
