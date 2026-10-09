import fs from 'fs';
import path from 'path';

// 1. PizzaPromoCodesSection.tsx
const pizzaSecPath = path.resolve('src/admin/pizza/components/PizzaPromoCodesSection.tsx');
let pizzaContent = fs.readFileSync(pizzaSecPath, 'utf8').replace(/\r\n/g, '\n');

if (!pizzaContent.includes('savedFeedback')) {
  pizzaContent = pizzaContent.replace(
    'const [searchQuery, setSearchQuery] = useState<string>(\'\');',
    'const [searchQuery, setSearchQuery] = useState<string>(\'\');\n  const [savedFeedback, setSavedFeedback] = useState<string | null>(null);'
  );

  pizzaContent = pizzaContent.replace(
    '// Reset Form\n    setCode(\'\');',
    'setSavedFeedback(`✅ Coupon "${code.trim().toUpperCase()}" creato e sincronizzato sul Cloud!`);\n    setTimeout(() => setSavedFeedback(null), 4000);\n    // Reset Form\n    setCode(\'\');'
  );

  pizzaContent = pizzaContent.replace(
    '<button\n              type="submit"',
    '{savedFeedback && (\n            <div className="p-2.5 bg-emerald-500/20 border border-emerald-400/50 rounded-lg text-emerald-300 font-bold text-xs flex items-center gap-2 animate-fadeIn">\n              <span>{savedFeedback}</span>\n            </div>\n          )}\n          <button\n              type="submit"'
  );

  fs.writeFileSync(pizzaSecPath, pizzaContent, 'utf8');
  console.log('✅ Updated PizzaPromoCodesSection.tsx');
}

// 2. PromoCodesSection.tsx
const resortSecPath = path.resolve('src/admin/resort/components/PromoCodesSection.tsx');
let resortContent = fs.readFileSync(resortSecPath, 'utf8').replace(/\r\n/g, '\n');

if (!resortContent.includes('savedFeedback')) {
  resortContent = resortContent.replace(
    'const [expandedCodeId, setExpandedCodeId] = useState<string | null>(null);',
    'const [expandedCodeId, setExpandedCodeId] = useState<string | null>(null);\n  const [savedFeedback, setSavedFeedback] = useState<string | null>(null);'
  );

  resortContent = resortContent.replace(
    '// Reset Form\n    setCode(\'\');',
    'setSavedFeedback(`✅ Ticket "${code.trim().toUpperCase()}" creato e sincronizzato sul Cloud!`);\n    setTimeout(() => setSavedFeedback(null), 4000);\n    // Reset Form\n    setCode(\'\');'
  );

  resortContent = resortContent.replace(
    '<button\n            type="submit"',
    '{savedFeedback && (\n          <div className="p-2.5 bg-emerald-500/20 border border-emerald-400/50 rounded-lg text-emerald-300 font-bold text-xs flex items-center gap-2 animate-fadeIn">\n            <span>{savedFeedback}</span>\n          </div>\n        )}\n        <button\n            type="submit"'
  );

  fs.writeFileSync(resortSecPath, resortContent, 'utf8');
  console.log('✅ Updated PromoCodesSection.tsx');
}
