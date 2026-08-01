import fs from 'fs';
import path from 'path';

const userProvidedText = `
Jungle Villa (529773): JV 7d (529778), JV Main bnb-7d (529788), JV 14d (529779), JV Main bnb-14d (529792), JV AC7d (529780), JV AC14d (529781), JV AGD AC-7d (921868), JV AGD AC-14d (921869), JV AC bnb-14d (529801), JV AirBnB (529783), JV AirBnB AC (529813), JV BE (529784)

Jungle Villa Left (495795): JVL 7d (495803), JVL Main bnb-7d (496001), JVL 14d (495804), JVL Main bnb-14d (496009), JVL AC7d (495805), JVL AC14d (495806), JVL AGD AC-7d (921870), JVL AGD AC-14d (921871), JVL AC bnb-14d (496031), JVL AC bnb-7d (496022), JVL AirBnB (495810), JVL AirBnB AC (496057), JVL BE (495807)

Jungle Villa Right (495796): JVR 7d (495976), JVR Main bnb-7d (496002), JVR 14d (495977), JVR Main bnb-14d (496010), JVR AC7d (495978), JVR AC14d (495979), JVR AGD AC-7d (921872), JVR AGD AC-14d (921873), JVR AC bnb-14d (496030), JVR AC bnb-7d (496021), JVR AirBnB (495982), JVR AirBnB AC (496056), JVR BE (495980)

Peace & Love Villa (494840): P&L7d (495549), P&L Main bnb-7d (495575), P&L14d (495551), P&L Main bnb-14d (495580), P&L AC7d (495552), P&L AC14d (495565), P&L AGD AC-7d (921874), P&L AGD AC-14d (921875), P&L AC bnb-14d (495593), P&L AC bnb-7d (495587), P&L BE (495566), P&L AirBnB (495569), P&L AirBnB AC (495609)

Penthouse Villa (421511): Pent 7d (422445), Pent Main bnb-7d (421520), Pent 14d (421513), Pent Main bnb-14d (421516), Pent AC7d (421522), Pent AC14d (421527), Pent AGD AC-7d (921876), Pent AGD AC-14d (921877), Pent AC bnb-7d (421525), Pent AC bnb-14d (421530), Pent AirBnB (421532), Pent AirBnB AC (421533), Pent BE (449348)

Yellow Bungalow (293957): Yellow 7d (422422), Yellow Main bnb-7d (332054), Yellow 14d (293958), Yellow Main bnb-14d (332055), Yellow AC7d (331921), Yellow AC14d (331922), Yellow AGD AC-7d (921878), Yellow AGD AC-14d (921879), Yellow AC bnb-7d (332057), Yellow AC bnb-14d (332060), Yellow AirBnB (297022), Yellow AirBnB AC (340198), Yellow BE (449385)

Red Bungalow (293954): Red 7d (422131), Red Main bnb-7d (332029), Red 14d (293953), Red Main bnb-14d (332030), Red AC7d (330964), Red AC14d (330970), Red AC bnb-7d (332035), Red AC bnb-14d (332036), Red AGD AC-7d (921880), Red AGD AC-14d (921881), Red AirBnB (297021), Red AirBnB AC (340196), Red BE (449422)

Green Bungalow (293962): Green 7d (422402), Green Main bnb-7d (332066), Green 14d (293961), Green Main bnb-14d (332070), Green AC7d (331923), Green AC14d (331924), Green AC bnb-7d (332072), Green AC bnb-14d (332074), Green AGD AC-7d (921882), Green AGD AC-14d (921883), Green AirBnB (297023), Green AirBnB AC (340200), Green BE (449668)

Room 1 (293963): R1 7d (422300), R1 Main bnb-7d (332735), R1 14d (293964), R1 Main bnb-14d (332737), R1 AGD AC-7d (921889), R1 AGD AC-14d (921890), R1 AC7d (331976), R1 AC14d (331977), R1 AirBnB (297033), R1 AC bnb-14d (916402), R1 AC bnb-7d (916818), R1 AirBnB AC (421505)

Room 2 (293959): R2 7d (422296), R2 Main bnb-7d (332739), R2 14d (293960), R2 Main bnb-14d (332741), R2 AC7d (331966), R2 AC14d (331967), R2 AGD AC-7d (921891), R2 AGD AC-14d (921900), R2 AC bnb-7d (332119), R2 AC bnb-14d (332134), R2 AirBnB (297032), R2 AirBnB AC (421506)

Room 3 (293948): R3 7d (422293), R3 Main bnb-7d (332757), R3 14d (293947), R3 Main bnb-14d (332743), R3 AC7d (331968), R3 AC14d (331969), R3 AGD AC-7d (921892), R3 AGD AC-14d (921893), R3 AC bnb-7d (332121), R3 AC bnb-14d (332136), R3 AirBnB (297028), R3 AirBnB AC (421507)

Room 4 (293945): R4 7d (422265), R4 Main bnb-7d (332746), R4 14d (293946), R4 Main bnb-14d (332759), R4 AC7d (331970), R4 AC14d (331971), R4 AGD AC-7d (921894), R4 AGD AC-14d (921895), R4 AC bnb-7d (332123), R4 AC bnb-14d (332138), R4 AirBnB (297029), R4 AirBnB AC (421508)

Room 5 (293943): R5 7d (422213), R5 Main bnb-7d (332763), R5 14d (293944), R5 Main bnb-14d (332765), R5 AC7d (331972), R5 AC14d (331973), R5 AGD AC-7d (921896), R5 AGD AC-14d (921897), R5 AC bnb-7d (332125), R5 AC bnb-14d (332140), R5 AirBnB (297031), R5 AirBnB AC (421509)

Lodge 1 (293951): Lodge 1 7d (422149), Lodge 1 Main bnb-7d (332767), Lodge 1 14d (293952), Lodge 1 Main bnb-14d (332769), Lodge 1 AGD AC-7d (921884), Lodge 1 AGD AC-14d (921885), Lodge 1 AC7d (331974), Lodge 1 AC14d (422157), Lodge 1 AC bnb-7d (332129), Lodge 1 AC bnb-14d (332142), Lodge 1 AirBnB (297030), Lodge 1 AC AirBnB (421510)

Lodge 2 (883795): Lodge 2 BE (923905), Lodge 2 14d (916108), Lodge 2 7d (916110), Lodge 2 AC AirBnB (916104), Lodge 2 AC bnb-14d (916830), Lodge 2 AC bnb-7d (916829), Lodge 2 AC14d (916105), Lodge 2 AC7d (916114), Lodge 2 AGD AC-7d (921886), Lodge 2 AGD AC-14d (921887), Lodge 2 AirBnB (916103), Lodge 2 Main bnb-14d (916107), Lodge 2 Main bnb-7d (916109)

Camel Tent (293965): Camel 7d (422325), Camel Main bnb-7d (332084), Camel 14d (293966), Camel Main bnb-14d (332089), Camel Airbnb (297025), Camel BE (449675)

Lagoon Tent (293955): Lagoon 7d (422351), Lagoon Main bnb-7d (332077), Lagoon 14d (293956), Lagoon Main bnb-14d (332081), Lagoon AirBnB (297024), Lagoon BE (449674)

Internal room (293942): Inter 7d (872182), Inter Main bnb-7d (332105), Inter 14d (293941), Inter Main bnb-14d (332109), Inter AC7d (340367), Inter AC14d (421998), Inter AGD AC-7d (921898), Inter AGD AC-14d (921899), Inter AC bnb-7d (916840), Inter AC bnb-14d (916838), Inter AirBnB (297027), Inter AirBnB AC (422147)
`;

// Parse user provided text into a Map of Accommodation -> Rate Name -> ID
function parseUserText(text) {
  const lines = text.trim().split('\n').filter(l => l.trim());
  const parsed = [];

  for (const line of lines) {
    const colonIdx = line.indexOf(':');
    if (colonIdx === -1) continue;

    const roomPart = line.substring(0, colonIdx).trim();
    const ratesPart = line.substring(colonIdx + 1).trim();

    const roomMatch = roomPart.match(/^(.*?)\s*\((\d+)\)$/);
    const roomName = roomMatch ? roomMatch[1].trim() : roomPart;
    const motherId = roomMatch ? roomMatch[2] : null;

    const rates = [];
    const rateTokens = ratesPart.split(',');
    for (const tok of rateTokens) {
      const m = tok.trim().match(/^(.*?)\s*\((\d+)\)$/);
      if (m) {
        rates.push({ rateName: m[1].trim(), id: m[2] });
      }
    }

    parsed.push({ roomName, motherId, rates });
  }
  return parsed;
}

// Read current code files
const derivedRatesFile = fs.readFileSync('src/admin/resort/components/DerivedRatesTreeSection.tsx', 'utf8');
const calendarFile = fs.readFileSync('src/admin/resort/components/ResortVisualCalendar.tsx', 'utf8');

const userAccommodations = parseUserText(userProvidedText);

console.log(`Parsed ${userAccommodations.length} accommodations from user input.\n`);

const report = [];

for (const userAcc of userAccommodations) {
  const roomReport = {
    room: userAcc.roomName,
    motherId: userAcc.motherId,
    motherMatchDerived: derivedRatesFile.includes(userAcc.motherId),
    motherMatchCalendar: calendarFile.includes(userAcc.motherId),
    ratesCheck: []
  };

  for (const rate of userAcc.rates) {
    const inDerived = derivedRatesFile.includes(rate.id);
    const inCalendar = calendarFile.includes(rate.id);
    roomReport.ratesCheck.push({
      rateName: rate.rateName,
      id: rate.id,
      inDerived,
      inCalendar,
      isMissing: !inDerived || !inCalendar
    });
  }

  report.push(roomReport);
}

fs.writeFileSync('scratch/audit_comparison_report.json', JSON.stringify(report, null, 2));
console.log('Audit completed and written to scratch/audit_comparison_report.json');
