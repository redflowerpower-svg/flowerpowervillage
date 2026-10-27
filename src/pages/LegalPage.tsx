import React, { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { 
  ShieldCheck, 
  FileText, 
  Lock, 
  Globe, 
  Building2, 
  Mail, 
  Phone, 
  MapPin, 
  CheckCircle2, 
  ExternalLink, 
  ArrowLeft,
  Share2,
  Trash2,
  RefreshCw,
  HelpCircle
} from 'lucide-react';

interface Props {
  initialTab?: 'terms' | 'privacy' | 'all';
}

export default function LegalPage({ initialTab }: Props) {
  const location = useLocation();
  const [lang, setLang] = useState<'EN' | 'IT'>('EN');

  // Determine active tab from URL path or props
  const [activeTab, setActiveTab] = useState<'terms' | 'privacy' | 'all'>(() => {
    if (initialTab) return initialTab;
    const path = location.pathname.toLowerCase();
    if (path.includes('privacy')) return 'privacy';
    if (path.includes('terms')) return 'terms';
    return 'all';
  });

  useEffect(() => {
    const path = location.pathname.toLowerCase();
    if (path.includes('privacy')) {
      setActiveTab('privacy');
    } else if (path.includes('terms')) {
      setActiveTab('terms');
    }
  }, [location.pathname]);

  const lastUpdated = "October 17, 2026";

  return (
    <div className="min-h-screen bg-stone-950 text-stone-100 font-sans antialiased selection:bg-amber-500 selection:text-stone-950">
      {/* Top Header */}
      <header className="border-b border-stone-800/80 bg-stone-900/80 backdrop-blur sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link 
              to="/" 
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-stone-800/80 hover:bg-stone-700 text-stone-300 hover:text-white transition text-xs font-medium border border-stone-700/60"
            >
              <ArrowLeft size={14} />
              <span>{lang === 'EN' ? 'Back to Site' : 'Torna al Sito'}</span>
            </Link>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <h1 className="text-base sm:text-lg font-bold tracking-tight text-white flex items-center gap-2">
                <span>Flower Power</span>
                <span className="text-xs px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 font-semibold uppercase tracking-wider">
                  Legal Center
                </span>
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Language Switcher */}
            <div className="inline-flex rounded-lg bg-stone-950 p-1 border border-stone-800 text-xs">
              <button
                type="button"
                onClick={() => setLang('EN')}
                className={`px-3 py-1 rounded-md font-semibold transition ${
                  lang === 'EN' ? 'bg-amber-500 text-stone-950 shadow' : 'text-stone-400 hover:text-stone-200'
                }`}
              >
                English (Official)
              </button>
              <button
                type="button"
                onClick={() => setLang('IT')}
                className={`px-3 py-1 rounded-md font-semibold transition ${
                  lang === 'IT' ? 'bg-amber-500 text-stone-950 shadow' : 'text-stone-400 hover:text-stone-200'
                }`}
              >
                Italiano
              </button>
            </div>
          </div>
        </div>

        {/* Tab Sub-Nav */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 pb-3 pt-1 flex items-center gap-2 overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveTab('all')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition flex items-center gap-1.5 ${
              activeTab === 'all' 
                ? 'bg-stone-800 text-white border border-stone-700 shadow-sm' 
                : 'text-stone-400 hover:text-stone-200 hover:bg-stone-900/60'
            }`}
          >
            <Globe size={13} />
            <span>{lang === 'EN' ? 'All Policies' : 'Tutte le Informative'}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('terms')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition flex items-center gap-1.5 ${
              activeTab === 'terms' 
                ? 'bg-amber-500 text-stone-950 font-bold shadow-sm' 
                : 'text-stone-400 hover:text-stone-200 hover:bg-stone-900/60'
            }`}
          >
            <FileText size={13} />
            <span>{lang === 'EN' ? 'Terms of Service' : 'Termini di Servizio'}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('privacy')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition flex items-center gap-1.5 ${
              activeTab === 'privacy' 
                ? 'bg-amber-500 text-stone-950 font-bold shadow-sm' 
                : 'text-stone-400 hover:text-stone-200 hover:bg-stone-900/60'
            }`}
          >
            <ShieldCheck size={13} />
            <span>{lang === 'EN' ? 'Privacy Policy & TikTok Compliance' : 'Informativa Privacy & TikTok API'}</span>
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        {/* Top Hero Card */}
        <div className="p-6 rounded-2xl bg-gradient-to-br from-stone-900 via-stone-900/90 to-stone-950 border border-stone-800 mb-8 shadow-xl">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-medium mb-3">
                <ShieldCheck size={13} />
                <span>PDPA Thailand & GDPR Compliant · TikTok API Verified</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                {lang === 'EN' 
                  ? 'Terms of Service & Privacy Policy' 
                  : 'Termini di Servizio & Informativa sulla Privacy'}
              </h2>
              <p className="text-stone-400 text-sm mt-1">
                {lang === 'EN'
                  ? `Official Legal Documentation for Flower Power Pizza (Ranong), Flower Power Farm Village (Koh Phayam), and Flower Power Social Studio.`
                  : `Documentazione Legale Ufficiale per Flower Power Pizza (Ranong), Flower Power Farm Village (Koh Phayam) e Flower Power Social Studio.`}
              </p>
            </div>
            <div className="text-xs text-stone-400 bg-stone-950/60 p-3 rounded-xl border border-stone-800 shrink-0">
              <div className="text-stone-500 font-medium">{lang === 'EN' ? 'Last Updated:' : 'Ultimo Aggiornamento:'}</div>
              <div className="text-amber-400 font-semibold mt-0.5">{lastUpdated}</div>
              <div className="text-stone-400 mt-1">Ranong & Koh Phayam, Thailand</div>
            </div>
          </div>
        </div>

        {/* ========================================================= */}
        {/* SECTION: TERMS OF SERVICE */}
        {/* ========================================================= */}
        {(activeTab === 'all' || activeTab === 'terms') && (
          <section id="terms" className="mb-12 scroll-mt-24">
            <div className="flex items-center gap-2.5 mb-4 border-b border-stone-800 pb-3">
              <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
                <FileText size={18} />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white tracking-tight">
                  {lang === 'EN' ? '1. Terms of Service' : '1. Termini di Servizio'}
                </h3>
                <p className="text-xs text-stone-400">
                  {lang === 'EN' 
                    ? 'General conditions for using our website, ordering services, and management software'
                    : 'Condizioni generali d\'uso per sito web, ordini online e applicativi gestionali'}
                </p>
              </div>
            </div>

            <div className="space-y-6 text-stone-300 text-sm leading-relaxed">
              {/* 1.1 Ownership */}
              <div className="p-5 rounded-xl bg-stone-900/60 border border-stone-800/80">
                <h4 className="text-base font-semibold text-white mb-2 flex items-center gap-2">
                  <Building2 size={16} className="text-amber-400" />
                  <span>{lang === 'EN' ? '1.1 Entity Identification & Operator' : '1.1 Identificazione del Titolare'}</span>
                </h4>
                <p className="mb-3">
                  {lang === 'EN'
                    ? 'This website, services, and associated web tools (including the Flower Power Social Studio application) are owned and operated by Flower Power, operating in the Kingdom of Thailand across two primary locations:'
                    : 'Questo sito web, i relativi servizi e gli applicativi web correlati (incluso l\'applicativo Flower Power Social Studio) sono di proprietà e gestiti da Flower Power, operante nel Regno di Thailandia nelle sedi di:'}
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs bg-stone-950/70 p-3.5 rounded-lg border border-stone-800">
                  <div>
                    <strong className="text-amber-400 block mb-1">🏢 Head Office / Registered Entity:</strong>
                    <div className="text-white font-bold">ONLY PON CO., LTD</div>
                    <div className="text-stone-400 font-thai text-[11px]">บริษัท โอนลี่พล จำกัด (สำนักงานใหญ่)</div>
                    <div className="text-stone-400 mt-1">14/32 M.1 Sub-district Koh Phayam, District Mueang Ranong, Province Ranong 85000</div>
                    <div className="text-stone-300 mt-1 font-mono">Taxpayer ID: <strong className="text-amber-400">0845562009083</strong></div>
                  </div>
                  <div>
                    <strong className="text-amber-400 block mb-1">🍕 Restaurant Branch & Delivery:</strong>
                    <div className="text-white font-bold">FLOWER POWER PIZZA RANONG</div>
                    <div className="text-stone-400">129/6 Mo 1, Tambon Bang Rin, Muang Ranong 85000, Thailand</div>
                    <div className="text-stone-400 mt-1">Tel: 085 884 4852 / 095 650 2969</div>
                    <div className="text-stone-400 mt-1">Email: flowerpowerpizzaranong.th@gmail.com</div>
                  </div>
                </div>
                <div className="mt-3 text-xs text-stone-400">
                  {lang === 'EN' ? 'Official Inquiries & Contact Email: ' : 'Email Ufficiale di Contatto: '}
                  <a href="mailto:redflowerpower@gmail.com" className="text-amber-400 underline font-medium">redflowerpower@gmail.com</a>
                </div>
              </div>

              {/* 1.2 Acceptable Use */}
              <div className="p-5 rounded-xl bg-stone-900/60 border border-stone-800/80">
                <h4 className="text-base font-semibold text-white mb-2">
                  {lang === 'EN' ? '1.2 Acceptance & Permitted Use' : '1.2 Accettazione e Utilizzo Consentito'}
                </h4>
                <p>
                  {lang === 'EN'
                    ? 'By accessing this platform, submitting online food orders, booking resort accommodations, or using our software applications and social publishing tools, you agree to comply with and be bound by these Terms. The platform must be used solely for lawful purposes. You must not attempt to compromise website security, introduce viruses or unauthorized bots, reverse engineer proprietary code, or interfere with other users\' access.'
                    : 'Accedendo a questa piattaforma, effettuando ordini alimentari online, prenotando alloggi nel villaggio o utilizzando le nostre piattaforme software e strumenti di pubblicazione social, l\'utente accetta di essere vincolato dai presenti Termini. La piattaforma deve essere utilizzata esclusivamente per scopi leciti. È vietato violare o tentare di violare la sicurezza del sistema, introdurre malware o bot non autorizzati, decompilare il codice proprietario o interferire con le normali operazioni.'}
                </p>
              </div>

              {/* 1.3 Online Ordering & Delivery */}
              <div className="p-5 rounded-xl bg-stone-900/60 border border-stone-800/80">
                <h4 className="text-base font-semibold text-white mb-2">
                  {lang === 'EN' ? '1.3 Food Delivery & Orders Policy' : '1.3 Ordini & Politica di Consegna'}
                </h4>
                <p className="mb-2">
                  {lang === 'EN'
                    ? 'Flower Power Pizza offers fast artisanal delivery within Ranong city (maximum radius 5.0 km from our kitchen in Bang Rin). Orders are subject to kitchen acceptance based on real-time availability.'
                    : 'Flower Power Pizza offre consegna a domicilio artigianale rapida nella città di Ranong (raggio massimo di 5,0 km dalla nostra cucina a Bang Rin). Gli ordini sono soggetti ad accettazione della cucina in base alle disponibilità.'}
                </p>
                <ul className="list-disc pl-5 space-y-1 text-xs text-stone-400">
                  <li>{lang === 'EN' ? 'Free Delivery threshold: Available for orders of 300 THB or more; otherwise a flat 30 THB fee applies.' : 'Consegna gratuita per ordini pari o superiori a 300 THB (altrimenti tariffa fissa di 30 THB).'}</li>
                  <li>{lang === 'EN' ? 'Cancellation: Allowed only prior to kitchen preparation. 100% full refund is issued automatically if an order is rejected or unavailable.' : 'Cancellazione consentita solo prima che la cucina avvii la cottura. Rimborso integrale al 100% immediato in caso di rifiuto o indisponibilità.'}</li>
                </ul>
              </div>

              {/* 1.4 Social Publisher Platform for Restaurants & Food Creators */}
              <div className="p-5 rounded-xl bg-stone-900/60 border border-stone-800/80">
                <h4 className="text-base font-semibold text-white mb-2 flex items-center gap-2">
                  <Share2 size={16} className="text-amber-400" />
                  <span>{lang === 'EN' ? '1.4 Social Media Publisher Platform for Restaurants & Food Creators' : '1.4 Piattaforma Social Publisher per Ristoranti e Food Creator'}</span>
                </h4>
                <p>
                  {lang === 'EN'
                    ? 'Flower Power Social Studio is a cloud-based social media management platform designed for restaurants, culinary creators, and hospitality businesses to schedule, format, and publish video content and stories across connected TikTok and Meta channels via official developer APIs. Authorized restaurant operators and content creators manage their connected social accounts in full compliance with TikTok and Meta Developer Policies and Community Guidelines.'
                    : 'Flower Power Social Studio è una piattaforma cloud di social media management progettata per ristoranti, creator culinari e brand del settore hospitality per comporre, pianificare e pubblicare contenuti video e stories sui propri canali TikTok e Meta collegati tramite API ufficiali. I ristoratori e i creator autorizzati gestiscono i propri account social collegati nel pieno rispetto delle policy e linee guida per sviluppatori di TikTok e Meta.'}
                </p>
              </div>

              {/* 1.5 Intellectual Property & Limitation */}
              <div className="p-5 rounded-xl bg-stone-900/60 border border-stone-800/80">
                <h4 className="text-base font-semibold text-white mb-2">
                  {lang === 'EN' ? '1.5 Intellectual Property & Applicable Law' : '1.5 Proprietà Intellettuale & Legge Applicabile'}
                </h4>
                <p>
                  {lang === 'EN'
                    ? 'All trademarks, logos, texts, photographs, custom recipes, and user interface designs are the intellectual property of Flower Power. These Terms are governed by and construed in accordance with the laws of the Kingdom of Thailand. Any disputes shall be submitted to the competent jurisdiction of Ranong, Thailand.'
                    : 'Tutti i marchi, loghi, testi, fotografie, ricette artigianali e design dell\'interfaccia sono di proprietà esclusiva di Flower Power. I presenti Termini sono regolati dalla legislazione del Regno di Thailandia. Per qualsiasi controversia sarà competente il foro di Ranong, Thailandia.'}
                </p>
              </div>
            </div>
          </section>
        )}

        {/* ========================================================= */}
        {/* SECTION: PRIVACY POLICY & TIKTOK COMPLIANCE */}
        {/* ========================================================= */}
        {(activeTab === 'all' || activeTab === 'privacy') && (
          <section id="privacy" className="mb-12 scroll-mt-24">
            <div className="flex items-center gap-2.5 mb-4 border-b border-stone-800 pb-3">
              <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <Lock size={18} />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white tracking-tight">
                  {lang === 'EN' ? '2. Privacy Policy & Third-Party Integrations' : '2. Informativa sulla Privacy & Integrazioni Terze Parti'}
                </h3>
                <p className="text-xs text-stone-400">
                  {lang === 'EN' 
                    ? 'Personal Data Protection Act (PDPA Thailand), GDPR compliance & TikTok API data safety'
                    : 'Conformità PDPA Thailandia, GDPR e trasparenza nell\'utilizzo delle API TikTok'}
                </p>
              </div>
            </div>

            <div className="space-y-6 text-stone-300 text-sm leading-relaxed">
              {/* 2.1 Data Controller */}
              <div className="p-5 rounded-xl bg-stone-900/60 border border-stone-800/80">
                <h4 className="text-base font-semibold text-white mb-2">
                  {lang === 'EN' ? '2.1 Data Controller & Commitment' : '2.1 Titolare del Trattamento'}
                </h4>
                <p>
                  {lang === 'EN'
                    ? 'Flower Power (Ranong and Koh Phayam, Thailand) is committed to safeguarding the privacy and security of all customers and platform users in full compliance with the Thailand Personal Data Protection Act B.E. 2562 (PDPA) and European General Data Protection Regulation (GDPR).'
                    : 'Flower Power (Ranong e Koh Phayam, Thailandia) si impegna a proteggere la privacy e la sicurezza di tutti i clienti e utenti della piattaforma nel pieno rispetto del Personal Data Protection Act B.E. 2562 (PDPA) thailandese e del GDPR europeo.'}
                </p>
              </div>

              {/* 2.2 Data Collected */}
              <div className="p-5 rounded-xl bg-stone-900/60 border border-stone-800/80">
                <h4 className="text-base font-semibold text-white mb-2">
                  {lang === 'EN' ? '2.2 Categories of Personal Data Collected' : '2.2 Dati Personali Raccolti'}
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs mt-3">
                  <div className="p-3 rounded-lg bg-stone-950/60 border border-stone-800">
                    <strong className="text-white block mb-1">📦 {lang === 'EN' ? 'Delivery & Orders' : 'Ordini e Consegne'}</strong>
                    <p className="text-stone-400">
                      {lang === 'EN'
                        ? 'Customer name, contact phone number, delivery address, and GPS coordinates solely to fulfill food delivery accurately.'
                        : 'Nome, numero telefonico, indirizzo di consegna e coordinate GPS utilizzati esclusivamente per la consegna a domicilio.'}
                    </p>
                  </div>
                  <div className="p-3 rounded-lg bg-stone-950/60 border border-stone-800">
                    <strong className="text-white block mb-1">💳 {lang === 'EN' ? 'Zero Payment Card Storage' : 'Zero Conservazione Carte'}</strong>
                    <p className="text-stone-400">
                      {lang === 'EN'
                        ? 'We never store credit card or CVV details. All transactions are processed by PCI-DSS Level 1 certified gateways (Omise / Opn Payments, Stripe, Kasikorn Bank).'
                        : 'I dati completi delle carte di pagamento non transitano né vengono mai memorizzati sui nostri server (gestiti da gateway certificati PCI-DSS Level 1 Omise, Stripe, K-Bank).'}
                    </p>
                  </div>
                </div>
              </div>

              {/* 2.3 TikTok API Integration Callout */}
              <div id="tiktok-compliance" className="p-6 rounded-2xl bg-gradient-to-br from-stone-900 via-stone-900 to-stone-950 border-2 border-emerald-500/40 shadow-lg relative overflow-hidden">
                <div className="absolute top-0 right-0 px-3 py-1 bg-emerald-500/20 text-emerald-400 text-[10px] font-bold uppercase tracking-wider rounded-bl-lg border-l border-b border-emerald-500/30">
                  TikTok Content Posting API v2
                </div>

                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2.5 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                    <Share2 size={22} />
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-white tracking-tight">
                      {lang === 'EN' 
                        ? '2.3 Third-Party Platform Integration: TikTok API & OAuth 2.0' 
                        : '2.3 Integrazione Terze Parti: API TikTok & OAuth 2.0'}
                    </h4>
                    <span className="text-xs text-emerald-400 font-medium">
                      App: Flower Power Social Studio · Direct Post & Content Posting API
                    </span>
                  </div>
                </div>

                <p className="mb-4 text-xs sm:text-sm text-stone-300">
                  {lang === 'EN'
                    ? 'Our social media publishing platform "Flower Power Social Studio" integrates with the TikTok for Developers platform (Content Posting API and Comment Management API). This section explicitly details how user and account data is handled in accordance with TikTok Developer Policies:'
                    : 'La nostra piattaforma social "Flower Power Social Studio" si integra con la piattaforma TikTok for Developers (Content Posting API e Comment Management API). Questa sezione descrive dettagliatamente la gestione dei dati in conformità alle policy per sviluppatori di TikTok:'}
                </p>

                <div className="space-y-3 text-xs">
                  {/* Scope 1: Permissions */}
                  <div className="p-3.5 rounded-xl bg-stone-950/80 border border-stone-800 flex items-start gap-3">
                    <CheckCircle2 size={16} className="text-emerald-400 shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-white block font-semibold mb-0.5">
                        {lang === 'EN' ? '1. Scope of Access Strictly Limited to Authorized Permissions' : '1. Ambito di Accesso Confinato ai Soli Permessi Autorizzati'}
                      </strong>
                      <p className="text-stone-400">
                        {lang === 'EN'
                          ? 'The application requests access exclusively to scopes explicitly authorized by the account owner during the OAuth 2.0 consent screen: '
                          : 'L\'applicazione richiede l\'accesso esclusivamente agli ambiti esplicitamente autorizzati dal proprietario dell\'account durante la schermata di consenso OAuth 2.0: '}
                        <code className="text-amber-300 bg-stone-900 px-1 py-0.5 rounded">user.info.basic</code> (
                        {lang === 'EN' ? 'for identifying connected profile handle' : 'identificazione account collegato'}),{' '}
                        <code className="text-amber-300 bg-stone-900 px-1 py-0.5 rounded">video.publish</code> &{' '}
                        <code className="text-amber-300 bg-stone-900 px-1 py-0.5 rounded">video.upload</code> (
                        {lang === 'EN' ? 'to publish authorized marketing videos, 9:16 vertical stories, and photo carousels' : 'per la pubblicazione di video promozionali, stories 9:16 e caroselli fotografici'}),{' '}
                        <code className="text-amber-300 bg-stone-900 px-1 py-0.5 rounded">comment.list</code> &{' '}
                        <code className="text-amber-300 bg-stone-900 px-1 py-0.5 rounded">comment.list.manage</code> (
                        {lang === 'EN' ? 'to read and reply to audience comments' : 'per visualizzare e rispondere ai commenti dei clienti'}).
                      </p>
                    </div>
                  </div>

                  {/* Scope 2: Zero Sale */}
                  <div className="p-3.5 rounded-xl bg-stone-950/80 border border-stone-800 flex items-start gap-3">
                    <CheckCircle2 size={16} className="text-emerald-400 shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-white block font-semibold mb-0.5">
                        {lang === 'EN' ? '2. Absolute Prohibition of Data Sale or Unapproved Transfer' : '2. Divieto Assoluto di Vendita o Cessione dei Dati'}
                      </strong>
                      <p className="text-stone-400">
                        {lang === 'EN'
                          ? 'We categorically guarantee that NO TikTok account credentials, access tokens, customer interaction logs, or personal analytics are ever sold, traded, rented, or transferred to third-party data brokers, marketers, or advertisers.'
                          : 'Garantiamo categoricamente che NESSUNA credenziale TikTok, token di accesso, log o dato analitico viene mai venduto, ceduto, noleggiato o condiviso con data broker, terze parti o inserzionisti pubblicitari.'}
                      </p>
                    </div>
                  </div>

                  {/* Scope 3: Encryption */}
                  <div className="p-3.5 rounded-xl bg-stone-950/80 border border-stone-800 flex items-start gap-3">
                    <CheckCircle2 size={16} className="text-emerald-400 shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-white block font-semibold mb-0.5">
                        {lang === 'EN' ? '3. Secure Token Storage & Automatic Refresh' : '3. Archiviazione Cifrata dei Token & Rinnovo'}
                      </strong>
                      <p className="text-stone-400">
                        {lang === 'EN'
                          ? 'OAuth authorization tokens are encrypted using enterprise AES-256 standards in a secure vault. Tokens are used programmatically solely to perform the posts scheduled and authorized by connected account owners and creators.'
                          : 'I token di autorizzazione OAuth sono conservati con cifratura di livello enterprise AES-256 in un vault protetto. Sono utilizzati unicamente per eseguire i post programmati e autorizzati dai proprietari degli account e dai creator collegati.'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* 2.4 Revocation & Data Deletion Instructions */}
              <div id="data-deletion" className="p-5 rounded-xl bg-stone-900/60 border border-stone-800/80 scroll-mt-24">
                <h4 className="text-base font-semibold text-white mb-2 flex items-center gap-2">
                  <Trash2 size={16} className="text-rose-400" />
                  <span>{lang === 'EN' ? '2.4 Consent Revocation & User Data Deletion Instructions' : '2.4 Revoca dei Consensi & Istruzioni per la Cancellazione dei Dati'}</span>
                </h4>
                <p className="mb-3">
                  {lang === 'EN'
                    ? 'In compliance with TikTok Developer Rules, users and connected account administrators have full rights and continuous mechanisms to revoke authorization and permanently delete their data:'
                    : 'In conformità alle regole per gli sviluppatori di TikTok, gli utenti e gli amministratori degli account collegati possono in ogni momento revocare le autorizzazioni e richiedere la cancellazione definitiva dei propri dati:'}
                </p>

                <div className="space-y-2 text-xs bg-stone-950/70 p-4 rounded-xl border border-stone-800">
                  <div className="flex items-start gap-2">
                    <span className="font-bold text-amber-400">A.</span>
                    <p className="text-stone-300">
                      <strong>{lang === 'EN' ? 'Immediate Revocation via TikTok App: ' : 'Revoca Immediata via App TikTok: '}</strong>
                      {lang === 'EN'
                        ? 'You can revoke Flower Power Social Studio permissions at any time directly in your TikTok profile by navigating to: Profile > Settings and Privacy > Security > Manage App Permissions > Select "Flower Power Social Studio" > Tap "Remove Access".'
                        : 'Puoi revocare i permessi in qualsiasi momento direttamente dall\'app TikTok accedendo a: Profilo > Impostazioni e Privacy > Sicurezza > Gestisci autorizzazioni app > Seleziona "Flower Power Social Studio" > Clicca "Rimuovi accesso".'}
                    </p>
                  </div>

                  <div className="flex items-start gap-2 pt-2 border-t border-stone-800/80">
                    <span className="font-bold text-amber-400">B.</span>
                    <p className="text-stone-300">
                      <strong>{lang === 'EN' ? 'Data Deletion Request by Email: ' : 'Richiesta Cancellazione Dati via Email: '}</strong>
                      {lang === 'EN'
                        ? 'To request the complete and immediate purge of all tokens, logs, or stored media records associated with your account, please send an email to '
                        : 'Per richiedere la rimozione immediata e definitiva di ogni token, log o dato memorizzato, è sufficiente inviare un\'email a '}
                      <a href="mailto:redflowerpower@gmail.com?subject=TikTok%20Data%20Deletion%20Request" className="text-amber-400 font-bold underline">
                        redflowerpower@gmail.com
                      </a>{' '}
                      {lang === 'EN'
                        ? 'with the subject "TikTok Data Deletion Request". All associated records will be permanently erased from our servers within 48 hours, and confirmation will be sent to you.'
                        : 'con oggetto "Richiesta Cancellazione Dati TikTok". Tutti i dati saranno eliminati definitivamente entro 48 ore lavorative, con notifica di conferma.'}
                    </p>
                  </div>
                </div>
              </div>

              {/* 2.5 Contact Info */}
              <div className="p-5 rounded-xl bg-stone-900/60 border border-stone-800/80">
                <h4 className="text-base font-semibold text-white mb-2 flex items-center gap-2">
                  <Mail size={16} className="text-amber-400" />
                  <span>{lang === 'EN' ? '2.5 Privacy Officer & Contact Inquiries' : '2.5 Contatti del Responsabile Privacy'}</span>
                </h4>
                <p className="text-xs text-stone-400 mb-3">
                  {lang === 'EN'
                    ? 'For any questions or legal inquiries regarding our Terms of Service, Privacy Policy, or third-party API integrations, please reach out to our legal department:'
                    : 'Per qualsiasi richiesta legale o chiarimento su Termini di Servizio, Privacy o integrazioni terze parti, è possibile contattare direttamente la direzione:'}
                </p>
                <div className="flex flex-wrap gap-4 text-xs">
                  <div className="flex items-center gap-1.5 text-stone-300">
                    <Mail size={14} className="text-amber-400" />
                    <span>Email: </span>
                    <a href="mailto:redflowerpower@gmail.com" className="text-amber-400 hover:underline">redflowerpower@gmail.com</a>
                  </div>
                  <div className="flex items-center gap-1.5 text-stone-300">
                    <Phone size={14} className="text-amber-400" />
                    <span>Phone: +66 82 279 2604 / +66 98 016 7188</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-stone-300">
                    <MapPin size={14} className="text-amber-400" />
                    <span>Ranong & Koh Phayam, Thailand</span>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Footer */}
        <footer className="pt-8 border-t border-stone-800/80 text-center text-xs text-stone-400 space-y-2">
          <p>© {new Date().getFullYear()} Flower Power Pizza & Farm Village. All rights reserved.</p>
          <div className="flex items-center justify-center gap-4 text-stone-400">
            <Link to="/terms" onClick={() => setActiveTab('terms')} className="hover:text-amber-400 transition">Terms of Service</Link>
            <span>·</span>
            <Link to="/privacy" onClick={() => setActiveTab('privacy')} className="hover:text-amber-400 transition">Privacy Policy</Link>
            <span>·</span>
            <Link to="/social" className="hover:text-amber-400 transition">Social Studio</Link>
          </div>
        </footer>
      </main>
    </div>
  );
}
