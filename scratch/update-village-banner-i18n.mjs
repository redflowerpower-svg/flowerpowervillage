import fs from 'fs';
import path from 'path';

const filePath = path.resolve(process.cwd(), 'src/booking/components/booking-engine.tsx');
let content = fs.readFileSync(filePath, 'utf8');

const targetSnippet = `      {/* Floating Bright Yellow & Neon Red Banner (Requirement 3 V23) */}
      {appliedPromo && !selectedRoom && (
        <div className="fixed bottom-0 left-0 right-0 z-30 bg-yellow-400 border-t-4 border-red-600 shadow-[0_-4px_25px_rgba(220,38,38,0.5)] px-4 py-3 transition-all duration-300">
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 overflow-hidden">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-600 text-white font-black text-xs uppercase tracking-wider animate-pulse shadow-md shrink-0">
                <Percent className="w-3.5 h-3.5 text-white" />
                {appliedPromo.discountType === 'percentage' ? \`-\${appliedPromo.discountValue}%\` : \`-฿\${appliedPromo.discountValue}\`}
              </span>
              <div className="text-xs md:text-sm font-black text-stone-950 flex items-center gap-2 truncate">
                <span className="text-base">🎟️</span>
                <span className="text-red-700 font-black uppercase tracking-wider shrink-0">
                  {lang === 'IT' ? 'COPERTURA SCONTO ATTIVA:' : lang === 'TH' ? 'ใช้ส่วนลดโปรโมชั่น:' : lang === 'DE' ? 'AKTIVER RABATT:' : 'ACTIVE DISCOUNT COVERAGE:'}
                </span>
                <span className="truncate text-stone-950 font-black">
                  {lang === 'IT' ? \`Applicato il codice \${appliedPromo.code}\` : lang === 'TH' ? \`ใช้รหัส \${appliedPromo.code} แล้ว\` : lang === 'DE' ? \`Code \${appliedPromo.code} angewendet\` : \`Code \${appliedPromo.code} applied\`}
                </span>
                <span className="hidden md:inline text-stone-800 font-bold text-xs">
                  ({lang === 'IT' ? 'sconto applicato su camera + ospiti' : lang === 'TH' ? 'ใช้ได้กับค่าห้องพักและผู้เข้าพักเสริม' : lang === 'DE' ? 'Rabatt gültig auf Zimmer + Gäste' : 'valid on room + extra guests'})
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={handleRemovePromo}
              className="p-1.5 text-stone-900 hover:text-red-700 hover:bg-yellow-300 rounded-full transition-colors cursor-pointer shrink-0 font-bold"
              title={lang === 'IT' ? 'Rimuovi codice promozionale' : lang === 'TH' ? 'ลบรหัสโปรโมชั่น' : lang === 'DE' ? 'Gutscheincode entfernen' : 'Remove promo code'}
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}`;

const replacementSnippet = `      {/* Floating Bright Yellow & Neon Red Banner (Requirement 3 V23 - 9-Language DeepSeek Certified) */}
      {appliedPromo && !selectedRoom && (() => {
        const bannerLabels: Record<string, { coverage: string; applied: string; note: string; remove: string }> = {
          IT: { coverage: 'COPERTURA SCONTO ATTIVA:', applied: \`Codice \${appliedPromo.code} applicato\`, note: 'valido su camera + ospiti extra', remove: 'Rimuovi codice promozionale' },
          EN: { coverage: 'ACTIVE DISCOUNT COVERAGE:', applied: \`Code \${appliedPromo.code} applied\`, note: 'valid on room + extra guests', remove: 'Remove promo code' },
          TH: { coverage: 'ความคุ้มครองส่วนลดที่ใช้งานอยู่:', applied: \`ใช้โค้ด \${appliedPromo.code} แล้ว\`, note: 'ใช้ได้กับห้องพัก + แขกเพิ่มเติม', remove: 'ลบโค้ดโปรโมชั่น' },
          MM: { coverage: 'အသုံးပြုနေသော လျှော့စျေး လွှမ်းခြုံမှု-', applied: \`ကုဒ် \${appliedPromo.code} ကို အသုံးပြုပြီးပါပြီ\`, note: 'အခန်းနှင့် ဧည့်သည်အပိုများအတွက် အကျုံးဝင်သည်', remove: 'ပရိုမိုကုဒ်ကို ဖယ်ရှားပါ' },
          DE: { coverage: 'AKTIVE RABATTABDECKUNG:', applied: \`Code \${appliedPromo.code} angewendet\`, note: 'gültig für Zimmer + zusätzliche Gäste', remove: 'Promo-Code entfernen' },
          ES: { coverage: 'COBERTURA DE DESCUENTO ACTIVA:', applied: \`Código \${appliedPromo.code} aplicado\`, note: 'válido en habitación + huéspedes adicionales', remove: 'Eliminar código promocional' },
          FR: { coverage: 'COUVERTURE DE RÉDUCTION ACTIVE :', applied: \`Code \${appliedPromo.code} appliqué\`, note: 'valable sur la chambre + les invités supplémentaires', remove: 'Supprimer le code promo' },
          RU: { coverage: 'АКТИВНОЕ ПОКРЫТИЕ СКИДКИ:', applied: \`Код \${appliedPromo.code} применён\`, note: 'действует на номер + дополнительных гостей', remove: 'Удалить промокод' },
          ZH: { coverage: '有效折扣覆盖范围：', applied: \`代码 \${appliedPromo.code} 已应用\`, note: '适用于客房 + 额外客人', remove: '移除促销代码' },
        };
        const activeLabel = bannerLabels[lang] || bannerLabels.IT;
        return (
          <div className="fixed bottom-0 left-0 right-0 z-30 bg-yellow-400 border-t-4 border-red-600 shadow-[0_-4px_25px_rgba(220,38,38,0.5)] px-4 py-3 transition-all duration-300">
            <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 overflow-hidden">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-600 text-white font-black text-xs uppercase tracking-wider animate-pulse shadow-md shrink-0">
                  <Percent className="w-3.5 h-3.5 text-white" />
                  {appliedPromo.discountType === 'percentage' ? \`-\${appliedPromo.discountValue}%\` : \`-฿\${appliedPromo.discountValue}\`}
                </span>
                <div className="text-xs md:text-sm font-black text-stone-950 flex items-center gap-2 truncate">
                  <span className="text-base">🎟️</span>
                  <span className="text-red-700 font-black uppercase tracking-wider shrink-0">
                    {activeLabel.coverage}
                  </span>
                  <span className="truncate text-stone-950 font-black">
                    {activeLabel.applied}
                  </span>
                  <span className="hidden md:inline text-stone-800 font-bold text-xs">
                    ({activeLabel.note})
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={handleRemovePromo}
                className="p-1.5 text-stone-900 hover:text-red-700 hover:bg-yellow-300 rounded-full transition-colors cursor-pointer shrink-0 font-bold"
                title={activeLabel.remove}
                aria-label={activeLabel.remove}
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        );
      })()}`;

const normContent = content.replace(/\r\n/g, '\n');
const normTarget = targetSnippet.replace(/\r\n/g, '\n');

if (normContent.includes(normTarget)) {
  const updatedNorm = normContent.replace(normTarget, replacementSnippet.replace(/\r\n/g, '\n'));
  const finalContent = content.includes('\r\n') ? updatedNorm.replace(/\n/g, '\r\n') : updatedNorm;
  fs.writeFileSync(filePath, finalContent, 'utf8');
  console.log('✅ Successfully updated booking-engine.tsx with 9 languages');
} else {
  console.log('❌ Could not find target snippet in booking-engine.tsx');
}
