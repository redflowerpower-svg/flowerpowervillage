import fs from 'fs';
import path from 'path';

const filePath = path.resolve(process.cwd(), 'src/pizza/components/MenuGrid.tsx');
let content = fs.readFileSync(filePath, 'utf8');

// 1. Replace modal outer container and card container
const targetSnippet = `      {/* DEDICATED CUSTOMIZATION MODAL (Zero layout shift, 100% structured touch interface) */}
      {customizingItem && (
        <div
          className="fixed inset-0 z-[70] bg-stone-950/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 md:p-6 animate-fadeIn"
          onClick={handleCloseCustomize}
        >
          <div
            className="relative w-full max-w-2xl max-h-[90dvh] h-[90dvh] sm:h-auto sm:max-h-[88vh] bg-white rounded-t-[2rem] sm:rounded-[2rem] shadow-2xl border border-stone-200 flex flex-col overflow-hidden animate-scaleIn min-h-0"
            onClick={(e) => e.stopPropagation()}
          >`;

const replacementSnippet = `      {/* DEDICATED CUSTOMIZATION MODAL (Zero layout shift, 100% structured touch interface) */}
      {customizingItem && (
        <div
          className="fixed inset-0 z-[70] bg-stone-950/80 backdrop-blur-sm flex items-center justify-center p-3 pb-16 sm:p-4 md:p-6 animate-fadeIn"
          onClick={handleCloseCustomize}
        >
          <div
            className="relative w-full max-w-2xl max-h-[80dvh] sm:max-h-[85vh] bg-white rounded-[2rem] shadow-2xl border border-stone-200 flex flex-col overflow-hidden animate-scaleIn min-h-0"
            onClick={(e) => e.stopPropagation()}
          >`;

const normContent = content.replace(/\r\n/g, '\n');
const normTarget = targetSnippet.replace(/\r\n/g, '\n');

if (normContent.includes(normTarget)) {
  const updatedNorm = normContent.replace(normTarget, replacementSnippet.replace(/\r\n/g, '\n'));
  const finalContent = content.includes('\r\n') ? updatedNorm.replace(/\n/g, '\r\n') : updatedNorm;
  fs.writeFileSync(filePath, finalContent, 'utf8');
  console.log('✅ Successfully adjusted customization modal height and padding in MenuGrid.tsx');
} else {
  console.log('❌ Could not match modal container in MenuGrid.tsx');
}
