import fs from 'fs';

try {
  const content = fs.readFileSync('scratch/diff_delivery_menu.txt', 'utf8');
  // Convert the string characters (which are Latin1 values like \u00C3) into raw byte values,
  // then interpret those raw byte values as UTF-8.
  const recovered = Buffer.from(content, 'latin1').toString('utf8');
  fs.writeFileSync('scratch/diff_delivery_menu_recovered.txt', recovered, 'utf8');
  console.log("Decoding complete! Recovered file saved.");
} catch (e) {
  console.error("Error decoding:", e);
}
