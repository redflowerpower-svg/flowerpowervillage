import fs from 'fs';
import path from 'path';

const deliveryMenuPath = path.resolve('src/pizza/pages/DeliveryMenu.tsx');
const diningTabletPath = path.resolve('src/pizza/pages/DiningTabletSite.tsx');

function safeguardFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');

  // Replace group.name[lang] -> (group.name[lang] || group.name.IT || group.name.EN)
  content = content.replace(/group\.name\[lang\]/g, '(group.name[lang] || group.name.IT || group.name.EN)');

  // Replace group.desc[lang] -> (group.desc?.[lang] || group.desc?.IT || group.desc?.EN || "")
  content = content.replace(/group\.desc\[lang\]/g, '(group.desc?.[lang] || group.desc?.IT || group.desc?.EN || "")');

  // Replace s.name[lang] -> (s.name[lang] || s.name.IT || s.name.EN)
  content = content.replace(/s\.name\[lang\]/g, '(s.name[lang] || s.name.IT || s.name.EN)');

  // Replace activeSection.name[lang] -> (activeSection.name[lang] || activeSection.name.IT || activeSection.name.EN)
  content = content.replace(/activeSection\.name\[lang\]/g, '(activeSection.name[lang] || activeSection.name.IT || activeSection.name.EN)');

  fs.writeFileSync(filePath, content, 'utf8');
  console.log('Safeguarded:', filePath);
}

safeguardFile(deliveryMenuPath);
safeguardFile(diningTabletPath);
