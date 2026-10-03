import fs from 'fs';

const filePath = 'src/pizza/components/CheckoutFlow.tsx';
let content = fs.readFileSync(filePath, 'utf8');
const isCrlf = content.includes('\r\n');
if (isCrlf) content = content.replace(/\r\n/g, '\n');

const target = `                      {isGeneratingQr ? (
                        <div className="w-36 h-36 bg-stone-50 border border-stone-200 rounded-xl flex flex-col items-center justify-center gap-2 shadow-xs">
                          <Loader2 className="w-6 h-6 text-[#8B1E1E] animate-spin" />
                          <span className="text-[10px] font-bold text-stone-600">
                            {lang === 'IT' && 'Generazione QR Omise...'}
                            {lang === 'EN' && 'Generating Omise QR...'}
                            {lang === 'TH' && 'กำลังสร้าง QR Code...'}
                            {lang === 'DE' && 'Omise QR wird generiert...'}
                          </span>
                        </div>
                      ) : omiseQrUrl ? (`;

const replacement = `                      {isGeneratingQr ? (
                        <div className="w-36 h-36 bg-stone-50 border border-stone-200 rounded-xl flex flex-col items-center justify-center gap-2 shadow-xs">
                          <Loader2 className="w-6 h-6 text-[#8B1E1E] animate-spin" />
                          <span className="text-[10px] font-bold text-stone-600">
                            {lang === 'IT' && 'Generazione QR Omise...'}
                            {lang === 'EN' && 'Generating Omise QR...'}
                            {lang === 'TH' && 'กำลังสร้าง QR Code...'}
                            {lang === 'DE' && 'Omise QR wird generiert...'}
                          </span>
                        </div>
                      ) : paymentError && !omiseQrUrl ? (
                        <div className="w-full max-w-xs bg-red-50 border border-red-200 rounded-xl p-3 text-center space-y-2">
                          <p className="text-xs text-red-700 font-bold">{paymentError}</p>
                          <button
                            type="button"
                            onClick={() => {
                              setPaymentError(null);
                              handleGeneratePromptPayQr();
                            }}
                            className="px-3 py-1.5 bg-[#8B1E1E] text-white text-xs font-bold rounded-lg shadow hover:bg-[#701616] cursor-pointer"
                          >
                            {lang === 'IT' ? 'Riprova Generazione QR' : lang === 'TH' ? 'ลองใหม่อีกครั้ง' : lang === 'DE' ? 'QR erneut generieren' : 'Retry Generate QR'}
                          </button>
                        </div>
                      ) : omiseQrUrl ? (`;

if (content.includes(target)) {
  content = content.replace(target, replacement);
  console.log('✅ Updated QR error UI successfully!');
} else {
  console.log('❌ Target string not found in CheckoutFlow.tsx');
}

if (isCrlf) content = content.replace(/\n/g, '\r\n');
fs.writeFileSync(filePath, content, 'utf8');
