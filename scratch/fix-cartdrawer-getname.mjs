import fs from 'fs';

const filePath = 'src/pizza/components/CartDrawer.tsx';
let content = fs.readFileSync(filePath, 'utf8');

const oldFnRegex = /  const getTranslatedName = \(o: \{ name: string; nameTh\?: string; nameIt\?: string; nameDe\?: string; nameMm\?: string; name_mm\?: string; productId\?: string; id\?: string \}\) => \{[\s\S]*?    return o\.name;\r?\n  \};/;

const newFn = `  const getTranslatedName = (o: { name: string; nameTh?: string; nameIt?: string; nameDe?: string; nameMm?: string; name_mm?: string; nameEs?: string; nameFr?: string; nameRu?: string; nameZh?: string; productId?: string; id?: string }) => {
    const pid = (o.productId || o.id || '').trim().toLowerCase();
    if (lang === 'ZH') {
      if (o.nameZh || (o as any).name_zh) return o.nameZh || (o as any).name_zh;
      if (pid) {
        for (const cat of menuData) {
          const found = cat.items.find(m => m.id.toLowerCase() === pid);
          if (found && (found.nameZh || (found as any).name_zh)) return found.nameZh || (found as any).name_zh;
        }
      }
    }
    if (lang === 'RU') {
      if (o.nameRu || (o as any).name_ru) return o.nameRu || (o as any).name_ru;
      if (pid) {
        for (const cat of menuData) {
          const found = cat.items.find(m => m.id.toLowerCase() === pid);
          if (found && (found.nameRu || (found as any).name_ru)) return found.nameRu || (found as any).name_ru;
        }
      }
    }
    if (lang === 'FR') {
      if (o.nameFr || (o as any).name_fr) return o.nameFr || (o as any).name_fr;
      if (pid) {
        for (const cat of menuData) {
          const found = cat.items.find(m => m.id.toLowerCase() === pid);
          if (found && (found.nameFr || (found as any).name_fr)) return found.nameFr || (found as any).name_fr;
        }
      }
    }
    if (lang === 'ES') {
      if (o.nameEs || (o as any).name_es) return o.nameEs || (o as any).name_es;
      if (pid) {
        for (const cat of menuData) {
          const found = cat.items.find(m => m.id.toLowerCase() === pid);
          if (found && (found.nameEs || (found as any).name_es)) return found.nameEs || (found as any).name_es;
        }
      }
    }
    if (lang === 'MM') {
      if (o.nameMm || o.name_mm) return o.nameMm || o.name_mm;
      if (pid) {
        for (const cat of menuData) {
          const found = cat.items.find(m => m.id.toLowerCase() === pid);
          if (found && (found.nameMm || found.name_mm)) return found.nameMm || found.name_mm;
        }
      }
    }
    if (lang === 'TH') {
      if (o.nameTh) return o.nameTh;
      if (pid) {
        for (const cat of menuData) {
          const found = cat.items.find(m => m.id.toLowerCase() === pid);
          if (found && found.nameTh) return found.nameTh;
        }
      }
    }
    if (lang === 'IT') {
      if (o.nameIt) return o.nameIt;
      if (pid) {
        for (const cat of menuData) {
          const found = cat.items.find(m => m.id.toLowerCase() === pid);
          if (found && (found.nameIt || found.name_it)) return found.nameIt || found.name_it;
        }
      }
    }
    if (lang === 'DE') {
      if (o.nameDe) return o.nameDe;
      if (pid) {
        for (const cat of menuData) {
          const found = cat.items.find(m => m.id.toLowerCase() === pid);
          if (found && (found.nameDe || found.name_de)) return found.nameDe || found.name_de;
        }
      }
    }
    return o.name;
  };`;

if (oldFnRegex.test(content)) {
  content = content.replace(oldFnRegex, newFn);
  fs.writeFileSync(filePath, content, 'utf8');
  console.log('✅ Updated getTranslatedName in CartDrawer.tsx');
} else {
  console.error('❌ Could not match old getTranslatedName in CartDrawer.tsx');
}
