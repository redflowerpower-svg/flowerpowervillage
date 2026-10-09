import fs from 'fs';

let apiKey = process.env.DEEPSEEK_API_KEY || '';
if (!apiKey) {
  const envPath = fs.existsSync('.env.local') ? '.env.local' : '.env';
  if (fs.existsSync(envPath)) {
    const envFile = fs.readFileSync(envPath, 'utf8');
    envFile.split('\n').forEach(line => {
      const parts = line.split('=');
      if (parts.length >= 2 && parts[0].trim() === 'DEEPSEEK_API_KEY') {
        apiKey = parts.slice(1).join('=').trim();
      }
    });
  }
}

const enTableModal = {
  modalTitle: 'Book a Table or Garden Hut',
  modalSubtitle: 'Flower Power Pizza Ranong',
  nameLabel: 'Full Name',
  namePlaceholder: 'e.g. Marco Rossi',
  contactLabel: 'Phone / LINE ID',
  contactPlaceholder: 'e.g. +66 94 980 0200 or LINE ID',
  emailLabel: 'Email (for instant confirmation)',
  emailPlaceholder: 'e.g. marco.rossi@email.com',
  dateLabelLine1: 'Reservation',
  dateLabelLine2: 'Date',
  timeLabelLine1: 'Preferred',
  timeLabelLine2: 'Time',
  guestsLabelLine1: 'Number of',
  guestsLabelLine2: 'Guests',
  areaLabel: 'Select Seating Area',
  areaIndoor: 'Indoor Dining Room',
  areaOutdoor: 'Outdoor Garden Terrace',
  areaHut: 'Private Garden Hut',
  notesLabel: 'Special Requests or Notes (Optional)',
  notesPlaceholder: 'e.g. Birthday celebration, anniversary, dietary needs...',
  eventsNoticeTitle: 'Birthdays, Private Parties & Catering',
  eventsNoticeText: 'Planning a special event? Contact us directly for custom menus and dedicated packages:',
  btnSubmit: 'Send Reservation Request',
  btnSubmitting: 'Submitting...',
  successTitle: 'Reservation Request Sent!',
  successText: 'We have received your request for Flower Power Pizza and sent a summary email. Our team will confirm availability shortly.',
  btnClose: 'Close',
  openWhatsApp: 'Chat on WhatsApp',
  openLine: 'Chat on LINE',
};

async function run() {
  const filePath = 'src/pizza/components/TableReservationModal.tsx';
  let content = fs.readFileSync(filePath, 'utf8');

  const langs = [
    { code: 'FR', name: 'French' },
    { code: 'RU', name: 'Russian' },
    { code: 'ZH', name: 'Chinese (Simplified)' }
  ];

  const translatedLangs = {};

  for (const l of langs) {
    const res = await fetch('https://api.deepseek.com/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          { role: 'system', content: `Translate this Table Reservation UI JSON into natural ${l.name}. Return clean JSON matching the keys.` },
          { role: 'user', content: JSON.stringify(enTableModal) }
        ],
        response_format: { type: 'json_object' },
        temperature: 0.1
      })
    });
    const data = await res.json();
    translatedLangs[l.code] = JSON.parse(data.choices[0].message.content);
  }

  // Format blocks
  let allNewBlocks = '';
  for (const [code, dict] of Object.entries(translatedLangs)) {
    allNewBlocks += `\n  ${code}: {\n`;
    for (const [k, v] of Object.entries(dict)) {
      allNewBlocks += `    ${k}: '${String(v).replace(/'/g, "\\'")}',\n`;
    }
    allNewBlocks += `  },`;
  }

  // Fix the missing comma after MM and append FR, RU, ZH
  content = content.replace(
    /openLine: 'LINE တွင် စကားပြောမည်',\s*\}\s*ES: \{/s,
    "openLine: 'LINE တွင် စကားပြောမည်',\n  },\n\n  ES: {"
  );

  // If ES ends with comma, ensure we can append FR, RU, ZH before closing of translations
  if (!content.includes('  FR: {')) {
    content = content.replace(
      /openLine: 'Chatear por LINE',\s*\},?\s*\};/s,
      `openLine: 'Chatear por LINE',\n  },${allNewBlocks}\n};`
    );
  }

  fs.writeFileSync(filePath, content, 'utf8');
  console.log('✅ TableReservationModal.tsx fixed and all 9 languages added!');
}

run().catch(console.error);
