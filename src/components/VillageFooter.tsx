import { Mail, Instagram, Facebook, MapPin } from 'lucide-react';
import { Language } from '../booking/lib/translations';

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
  lang?: Language;
}

const footerTranslations = {
  IT: {
    brandDesc: "Una delle ultime isole incontaminate della Thailandia. Un santuario di natura, comfort e autentici sapori italiani.",
    navTitle: "Navigazione",
    contactsTitle: "Contatti & Social",
    directOfferTitle: "Offerta Prenotazione Diretta",
    directOfferDesc: "Prenota direttamente sul nostro sito per risparmiare il 10% rispetto a tutte le agenzie online.",
    accommodations: 'Alloggi',
    restaurant: 'Ristorante & Pizzeria',
    spa: 'Spa & Benessere',
    gallery: 'Galleria',
    directions: 'Come Raggiungerci',
    contact: 'Contatti',
  },
  EN: {
    brandDesc: "One of Thailand's last unspoiled islands. A sanctuary of nature, comfort, and authentic Italian flavour.",
    navTitle: "Navigation",
    contactsTitle: "Contacts & Social",
    directOfferTitle: "Direct Booking Offer",
    directOfferDesc: "Book directly on our website and save 10% compared to all online travel agencies.",
    accommodations: 'Accommodations',
    restaurant: 'Restaurant & Pizzeria',
    spa: 'Spa & Wellness',
    gallery: 'Gallery',
    directions: 'Directions',
    contact: 'Contact Us',
  },
  TH: {
    brandDesc: "หนึ่งในเกาะสุดท้ายที่ยังคงความบริสุทธิ์ในประเทศไทย โอเอซิสแห่งธรรมชาติ ความสะดวกสบาย และรสชาติอิตาเลียนแท้ๆ",
    navTitle: "นำทาง",
    contactsTitle: "ติดต่อเรา & โซเชียล",
    directOfferTitle: "ข้อเสนอการจองตรง",
    directOfferDesc: "จองตรงผ่านเว็บไซต์ของเราและประหยัด 10% เมื่อเทียบกับเอเจนซี่ท่องเที่ยวออนไลน์ทั้งหมด",
    accommodations: 'ที่พัก',
    restaurant: 'ร้านอาหาร & พิซซ่า',
    spa: 'สปา & เวลเนส',
    gallery: 'แกลเลอรี',
    directions: 'การเดินทาง',
    contact: 'ติดต่อเรา',
  },
  DE: {
    brandDesc: "Eine der letzten unberührten Inseln Thailands. Ein Zufluchtsort für Natur, Komfort und authentischen italienischen Geschmack.",
    navTitle: "Navigation",
    contactsTitle: "Kontakt & Social",
    directOfferTitle: "Direktbuchungsangebot",
    directOfferDesc: "Buchen Sie direkt auf unserer Website und sparen Sie 10% gegenüber allen Online-Reisebüros.",
    accommodations: 'Unterkünfte',
    restaurant: 'Restaurant & Pizzeria',
    spa: 'Spa & Wellness',
    gallery: 'Galerie',
    directions: 'Anreise',
    contact: 'Kontakt',
  }
};

export default function VillageFooter({ onNavigate, lang = 'IT' }: Props) {
  const t = footerTranslations[lang] || footerTranslations['IT'];

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
          <p 
            className="text-sm text-stone-400 leading-relaxed mb-4"
            style={{ fontFamily: 'Outfit, IBM Plex Sans Thai, sans-serif' }}
          >
            {t.brandDesc}
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
          <div 
            className="text-white text-xs font-semibold uppercase tracking-wider mb-5"
            style={{ fontFamily: 'Outfit, IBM Plex Sans Thai, sans-serif' }}
          >
            {t.navTitle}
          </div>
          <ul className="space-y-3.5 text-sm">
            {[
              { label: t.accommodations, id: 'accommodations' },
              { label: t.restaurant, id: 'restaurant' },
              { label: t.spa, id: 'spa' },
              { label: t.gallery, id: 'gallery' },
              { label: t.directions, id: 'directions' },
              { label: t.contact, id: 'contact' },
            ].map((link) => (
              <li key={link.id}>
                <button
                  onClick={() => onNavigate(link.id)}
                  className="text-stone-400 hover:text-emerald-500 transition-colors uppercase text-xs font-semibold tracking-wider text-left border-0 cursor-pointer"
                  style={{ fontFamily: 'Outfit, IBM Plex Sans Thai, sans-serif' }}
                >
                  {link.label}
                </button>
              </li>
            ))}
          </ul>
        </div>

        {/* Contacts & Social */}
        <div>
          <div 
            className="text-white text-xs font-semibold uppercase tracking-wider mb-5"
            style={{ fontFamily: 'Outfit, IBM Plex Sans Thai, sans-serif' }}
          >
            {t.contactsTitle}
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

          <div 
            className="mt-6 p-4 border border-emerald-800 bg-emerald-950 bg-opacity-30 rounded"
            style={{ fontFamily: 'Outfit, IBM Plex Sans Thai, sans-serif' }}
          >
            <p className="text-xs text-emerald-500 tracking-wide font-medium mb-1">{t.directOfferTitle}</p>
            <p className="text-xs text-stone-400">{t.directOfferDesc}</p>
          </div>
        </div>
      </div>

      <div className="border-t border-stone-800 px-6 py-5">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-stone-600">
            © {new Date().getFullYear()} Flower Power Farm Village & Spa · Koh Phayam, Thailand
          </p>
          <div className="flex items-center gap-1 text-xs text-stone-600">
            <span className="text-stone-400">EN</span>
            <span>·</span>
            <span className="text-stone-400">IT</span>
            <span>·</span>
            <span className="text-stone-400">TH</span>
            <span>·</span>
            <span className="text-stone-400">DE</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
