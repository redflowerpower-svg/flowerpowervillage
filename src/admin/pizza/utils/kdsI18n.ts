import { KdsLanguage } from './kdsExtraDictionary';

export interface KdsDictionary {
  kitchenTitle: string;
  col1Title: string;
  col2Title: string;
  noKitchenOrders: string;
  noKitchenSub: string;
  noReadyOrders: string;
  noReadySub: string;
  acceptBtn: string;
  muteBtn: string;
  muteAlarmBar: string;
  dispatchRiderBtn: string;
  bakedBtn: string;
  directArchiveBtn: string;
  deliveredBtn: string;
  cancelBtn: string;
  deleteBtn: string;
  minAgo: string;
  cookingFor: string;
  min: string;
  newBadge: string;
  callBtn: string;
  notifyCustBtn: string;
  sendRiderBtn: string;
  mapBtn: string;
  screenOn: string;
  testSound: string;
  serviceOpen: string;
  servicePaused: string;
  serviceClosed: string;
  hoursTitle: string;
  openTimeLabel: string;
  closeTimeLabel: string;
  saveHoursBtn: string;
  hoursSaved: string;
  customPauseLabel: string;
  applyCustomPause: string;
  openNowEarly: string;
  sizeLabel: string;
  extraLabel: string;
  dispatchReminderBadge: string;
  snoozeReminderBtn: string;
  snoozedBadge: string;
  testAlarmBtn: string;
  testChimeBtn: string;
  stopTestBtn: string;
  rejectResBtn: string;
  orderPaidBtn: string;
  readyForSettlementBtn: string;
  openTableNotice: string;
  payAtCashierBadge: string;
  cashCollectBadge: string;
  promptPayPaidBadge: string;
  cardPaidBadge: string;
  newReservationBadge: string;
  dineInTableBadge: string;
  guestsLabel: string;
  seatingAreaLabel: string;
  bambooHutLabel: string;
  indoorAcLabel: string;
  gardenAreaLabel: string;
  anyAreaLabel: string;
  confirmArchiveResBtn: string;
  rejectResTooltip: string;
  deleteResTooltip: string;
  kitchenOrdersDockLabel: string;
  itemsCountLabel: string;
  tableStationFallback: string;
  guestFallback: string;
  notesLabel: string;
  snooze10MinTooltip: string;
  testSound1Tooltip: string;
  testSound2Tooltip: string;
  cancelOrderTooltip: string;
  deleteOrderTooltip: string;
  inKitchenBadge: string;
  inDiningRoomBadge: string;
  openBillBadge: string;
  tapToViewOrderTooltip: string;
  tapToChangeTableTooltip: string;
  deliveringBadge: string;
  orderNumberPrefix: string;
}

export const KDS_I18N: Record<KdsLanguage, KdsDictionary> = {
  th: {
    kitchenTitle: 'KITCHEN MONITOR',
    col1Title: 'ออเดอร์ใหม่ (รอรับ & เริ่มทำ)',
    col2Title: 'กำลังเตรียม & กำลังส่ง',
    noKitchenOrders: 'ไม่มีออเดอร์ใหม่',
    noKitchenSub: 'แท็บเล็ตจะส่งเสียงเตือนเมื่อมีออเดอร์ใหม่เข้ามา',
    noReadyOrders: 'ไม่มีออเดอร์กำลังทำหรือส่ง',
    noReadySub: 'ออเดอร์ที่รับแล้วจะแสดงที่นี่เพื่อจัดเตรียมและส่ง',
    acceptBtn: 'รับออเดอร์',
    muteBtn: 'ปิดเสียง',
    muteAlarmBar: 'ปิดเสียงเตือน',
    dispatchRiderBtn: '🛵 ไรเดอร์ออกไปส่งแล้ว',
    bakedBtn: 'อบเสร็จแล้ว ➔ ส่งให้ไรเดอร์',
    directArchiveBtn: '✓ ปิดงานทันที',
    deliveredBtn: '✓ ส่งเรียบร้อยแล้ว / บันทึกประวัติ',
    cancelBtn: '✕ ยกเลิก',
    deleteBtn: '🗑️ ลบถาวร',
    minAgo: 'นาทีที่แล้ว',
    cookingFor: 'กำลังอบ',
    min: 'นาที',
    newBadge: 'ออเดอร์ใหม่',
    callBtn: 'โทร',
    notifyCustBtn: 'แจ้งลูกค้า',
    sendRiderBtn: 'ส่งไรเดอร์',
    mapBtn: 'แผนที่',
    screenOn: 'เปิดจอค้าง',
    testSound: 'ทดสอบ 🔔',
    serviceOpen: 'เปิดรับออเดอร์',
    servicePaused: 'พักรับออเดอร์',
    serviceClosed: 'ปิดตามเวลา',
    hoursTitle: 'เวลาเปิด - ปิดร้าน',
    openTimeLabel: 'เวลาเปิด:',
    closeTimeLabel: 'เวลาปิด:',
    saveHoursBtn: 'บันทึกเวลาเปิด-ปิด',
    hoursSaved: 'บันทึกเรียบร้อย!',
    customPauseLabel: 'กำหนดเวลาหยุดพักเอง (นาที):',
    applyCustomPause: 'ตั้งเวลาพัก',
    openNowEarly: 'เปิดรับออเดอร์ทันที (เริ่มบริการ)',
    sizeLabel: 'ขนาด',
    extraLabel: 'พิเศษ',
    dispatchReminderBadge: '⏰ เกิน 15 นาที: เตือนให้ปิดออเดอร์',
    snoozeReminderBtn: 'เลื่อน 10 นาที',
    snoozedBadge: 'เลื่อนเตือนอยู่',
    testAlarmBtn: 'ทดสอบเสียง 1 🔔',
    testChimeBtn: 'ทดสอบเสียง 2 ⏰',
    stopTestBtn: 'หยุดเสียง',
    rejectResBtn: '✕ ปฏิเสธ',
    orderPaidBtn: '💳 ชำระเงินแล้ว / ปิดโต๊ะ',
    readyForSettlementBtn: '✓ พร้อมสำหรับการชำระ (ย้ายไปขวา)',
    openTableNotice: 'โต๊ะเปิดในห้องอาหาร: พร้อมรับรายการเพิ่ม',
    payAtCashierBadge: '🏪 ชำระที่แคชเชียร์',
    cashCollectBadge: '💵 เงินสด (เก็บปลายทาง)',
    promptPayPaidBadge: '📱 PROMPTPAY (ชำระแล้ว)',
    cardPaidBadge: '💳 CARD 3DS (ชำระแล้ว)',
    newReservationBadge: 'จองโต๊ะใหม่',
    dineInTableBadge: 'ทานที่ร้าน',
    guestsLabel: 'ท่าน',
    seatingAreaLabel: 'โซนที่นั่ง:',
    bambooHutLabel: '🛖 กระท่อมไม้ไผ่',
    indoorAcLabel: '🏠 ห้องแอร์',
    gardenAreaLabel: '🌿 โซนสวน',
    anyAreaLabel: '🎲 ไม่ระบุ',
    confirmArchiveResBtn: '✓ รับ & บันทึกประวัติ',
    rejectResTooltip: 'ปฏิเสธการจองโต๊ะ',
    deleteResTooltip: 'ลบข้อมูลการจองนี้ออกถาวร',
    kitchenOrdersDockLabel: 'ออเดอร์ในครัว & โต๊ะ:',
    itemsCountLabel: 'จาน',
    tableStationFallback: 'โต๊ะ',
    guestFallback: 'ลูกค้า',
    notesLabel: 'หมายเหตุ:',
    snooze10MinTooltip: 'เลื่อนเสียงเตือนออกไป 10 นาที',
    testSound1Tooltip: 'ทดสอบเสียงกริ่งออเดอร์ใหม่',
    testSound2Tooltip: 'ทดสอบเสียงเตือนไรเดอร์ 15 นาที',
    cancelOrderTooltip: 'ยกเลิกออเดอร์นี้',
    deleteOrderTooltip: 'ลบออเดอร์นี้ออกถาวร',
    inKitchenBadge: 'รอส่ง',
    inDiningRoomBadge: 'กำลังเสิร์ฟ',
    openBillBadge: 'เปิดบิล',
    tapToViewOrderTooltip: 'แตะเพื่อเปิดดูรายการและกดส่ง',
    tapToChangeTableTooltip: 'แตะเพื่อเปลี่ยนโต๊ะ',
    deliveringBadge: 'ไรเดอร์กำลังไปส่ง',
    orderNumberPrefix: 'ออเดอร์ #'
  },

  en: {
    kitchenTitle: 'KITCHEN MONITOR',
    col1Title: 'NEW ORDERS (TO ACCEPT)',
    col2Title: 'PREPARING & DELIVERING',
    noKitchenOrders: 'NO NEW ORDERS',
    noKitchenSub: 'Tablet will ring when a new order arrives.',
    noReadyOrders: 'NO ORDERS IN PREPARATION',
    noReadySub: 'Accepted orders will appear here for preparation & delivery.',
    acceptBtn: 'ACCEPT ORDER',
    muteBtn: 'MUTE',
    muteAlarmBar: 'MUTE ALARM',
    dispatchRiderBtn: '🛵 DISPATCH RIDER (OUT)',
    bakedBtn: 'BAKED ➔ READY FOR RIDER',
    directArchiveBtn: '✓ ARCHIVE DIRECTLY',
    deliveredBtn: '✓ DELIVERED & ARCHIVED',
    cancelBtn: '✕ CANCEL',
    deleteBtn: '🗑️ DELETE',
    minAgo: 'm ago',
    cookingFor: 'COOKING',
    min: 'min',
    newBadge: 'NEW ORDER',
    callBtn: 'CALL',
    notifyCustBtn: 'NOTIFY CUSTOMER',
    sendRiderBtn: 'RIDER MAP',
    mapBtn: 'MAP',
    screenOn: 'SCREEN ON',
    testSound: 'TEST 🔔',
    serviceOpen: 'ONLINE: OPEN',
    servicePaused: 'ONLINE: PAUSED',
    serviceClosed: 'ONLINE: CLOSED',
    hoursTitle: 'OPENING & CLOSING HOURS',
    openTimeLabel: 'Open Time:',
    closeTimeLabel: 'Close Time:',
    saveHoursBtn: 'SAVE HOURS',
    hoursSaved: 'HOURS SAVED!',
    customPauseLabel: 'Custom Pause Duration (min):',
    applyCustomPause: 'SET PAUSE',
    openNowEarly: 'START SERVICE NOW (OPEN EARLY)',
    sizeLabel: 'Size',
    extraLabel: 'Extra',
    dispatchReminderBadge: '⏰ 15+ MIN: REMEMBER TO CLOSE ORDER',
    snoozeReminderBtn: 'SNOOZE 10 MIN',
    snoozedBadge: 'SNOOZED',
    testAlarmBtn: 'TEST 1 🔔',
    testChimeBtn: 'TEST 2 ⏰',
    stopTestBtn: 'STOP',
    rejectResBtn: '✕ REJECT',
    orderPaidBtn: '💳 ORDER PAID (CLOSE & ARCHIVE)',
    readyForSettlementBtn: '✓ READY FOR SETTLEMENT (MOVE TO RIGHT)',
    openTableNotice: 'Open table in dining room: ready for extra orders',
    payAtCashierBadge: '🏪 PAY AT CASHIER',
    cashCollectBadge: '💵 CASH (COLLECT ON DELIVERY)',
    promptPayPaidBadge: '📱 PROMPTPAY (PAID)',
    cardPaidBadge: '💳 CARD 3DS (PAID)',
    newReservationBadge: 'NEW RESERVATION',
    dineInTableBadge: 'Dine-In Table',
    guestsLabel: 'Guests',
    seatingAreaLabel: 'Seating Area:',
    bambooHutLabel: '🛖 Bamboo Hut',
    indoorAcLabel: '🏠 Indoor Room',
    gardenAreaLabel: '🌿 Outdoor Garden',
    anyAreaLabel: '🎲 Any Area',
    confirmArchiveResBtn: '✓ CONFIRM & ARCHIVE',
    rejectResTooltip: 'Reject Table Reservation',
    deleteResTooltip: 'Delete reservation permanently',
    kitchenOrdersDockLabel: 'KITCHEN ORDERS & TABLES:',
    itemsCountLabel: 'items',
    tableStationFallback: 'Table',
    guestFallback: 'Guest',
    notesLabel: 'Notes:',
    snooze10MinTooltip: 'Snooze reminder alarm for 10 minutes',
    testSound1Tooltip: 'Test incoming new order buzzer',
    testSound2Tooltip: 'Test 15-minute rider dispatch reminder',
    cancelOrderTooltip: 'Cancel this order',
    deleteOrderTooltip: 'Delete order permanently',
    inKitchenBadge: 'IN KITCHEN',
    inDiningRoomBadge: 'IN DINING ROOM',
    openBillBadge: 'OPEN BILL',
    tapToViewOrderTooltip: 'Tap to view order details and dispatch',
    tapToChangeTableTooltip: 'Tap to change table',
    deliveringBadge: 'OUT FOR DELIVERY',
    orderNumberPrefix: 'Order #'
  },

  mm: {
    kitchenTitle: 'KITCHEN MONITOR',
    col1Title: 'အော်ဒါအသစ်များ (စတင်ချက်ပြုတ်ရန်)',
    col2Title: 'ပြင်ဆင်နေဆဲနှင့် ပို့ဆောင်နေဆဲ',
    noKitchenOrders: 'အော်ဒါအသစ် မရှိပါ',
    noKitchenSub: 'အော်ဒါအသစ်ဝင်လာပါက အချက်ပေးသံ မြည်ပါမည်',
    noReadyOrders: 'ပြင်ဆင်ဆဲ အော်ဒါမရှိပါ',
    noReadySub: 'လက်ခံထားသော အော်ဒါများကို ဤနေရာတွင် ပြသပါမည်',
    acceptBtn: 'အော်ဒါ လက်ခံမည်',
    muteBtn: 'အသံပိတ်',
    muteAlarmBar: 'အချက်ပေးသံ ပိတ်မည်',
    dispatchRiderBtn: '🛵 ပို့ဆောင်သူ ထွက်ခွာပါပြီ',
    bakedBtn: 'ဖုတ်ပြီးပြီ ➔ ပို့ဆောင်သူထံ လွှဲပေးရန်',
    directArchiveBtn: '✓ ပြီးစီးကြောင်း မှတ်တမ်းတင်မည်',
    deliveredBtn: '✓ ပို့ဆောင်ပြီးပါပြီ',
    cancelBtn: '✕ ပယ်ဖျက်မည်',
    deleteBtn: '🗑️ အပြီးဖျက်မည်',
    minAgo: 'မိနစ်အကြာက',
    cookingFor: 'ဖုတ်နေဆဲ',
    min: 'မိနစ်',
    newBadge: 'အော်ဒါအသစ်',
    callBtn: 'ဖုန်းခေါ်',
    notifyCustBtn: 'ဖောက်သည်ထံ အကြောင်းကြားရန်',
    sendRiderBtn: 'မြေပုံ',
    mapBtn: 'မြေပုံ',
    screenOn: 'စခရင် ဖွင့်ထားမည်',
    testSound: 'အသံစမ်းသပ် 🔔',
    serviceOpen: 'ဖွင့်ထားသည်',
    servicePaused: 'ခေတ္တပိတ်ထားသည်',
    serviceClosed: 'ပိတ်ထားသည်',
    hoursTitle: 'ဆိုင်ဖွင့်ချိန် - ပိတ်ချိန်',
    openTimeLabel: 'ဖွင့်ချိန်:',
    closeTimeLabel: 'ပိတ်ချိန်:',
    saveHoursBtn: 'အချိန် သိမ်းဆည်းမည်',
    hoursSaved: 'သိမ်းဆည်းပြီးပါပြီ!',
    customPauseLabel: 'ခေတ္တရပ်နားချိန် (မိနစ်):',
    applyCustomPause: 'ရပ်နားမည်',
    openNowEarly: 'ယခုချက်ချင်း ဖွင့်မည်',
    sizeLabel: 'အရွယ်အစား',
    extraLabel: 'အပိုထည့်ရန်',
    dispatchReminderBadge: '⏰ ၁၅ မိနစ်ကျော်ပြီ: အော်ဒါပိတ်ရန် မမေ့ပါနှင့်',
    snoozeReminderBtn: '၁၀ မိနစ် ရွှေ့မည်',
    snoozedBadge: 'ရွှေ့ဆိုင်းထားဆဲ',
    testAlarmBtn: 'အသံစမ်းသပ် ၁ 🔔',
    testChimeBtn: 'အသံစမ်းသပ် ၂ ⏰',
    stopTestBtn: 'အသံရပ်မည်',
    rejectResBtn: '✕ ငြင်းပယ်မည်',
    orderPaidBtn: '💳 အော်ဒါ ငွေရှင်းပြီးပါပြီ / ပိတ်ပါ',
    readyForSettlementBtn: '✓ ငွေရှင်းရန် အသင့်ဖြစ်နေသည်',
    openTableNotice: 'စားပွဲခုံ ဖွင့်ထားသည်- ထပ်တိုးရန် အသင့်ရှိသည်',
    payAtCashierBadge: '🏪 ငွေရှင်းကောင်တာတွင် ငွေရှင်းရန်',
    cashCollectBadge: '💵 လက်ငင်းငွေချေ (ပစ္စည်းရောက်မှ)',
    promptPayPaidBadge: '📱 PROMPTPAY (ငွေချေပြီး)',
    cardPaidBadge: '💳 CARD 3DS (ငွေချေပြီး)',
    newReservationBadge: 'စားပွဲကြိုတင်မှာယူမှု အသစ်',
    dineInTableBadge: 'ဆိုင်ထိုင်စားပွဲ',
    guestsLabel: 'ဦးရေ',
    seatingAreaLabel: 'နေရာဇုန်:',
    bambooHutLabel: '🛖 ဝါးတဲနေရာ',
    indoorAcLabel: '🏠 အဲကွန်းခန်း',
    gardenAreaLabel: '🌿 ပန်းခြံနေရာ',
    anyAreaLabel: '🎲 မည်သည့်နေရာမဆို',
    confirmArchiveResBtn: '✓ အတည်ပြုပြီး မှတ်တမ်းတင်မည်',
    rejectResTooltip: 'စားပွဲကြိုတင်မှာယူမှုကို ငြင်းပယ်မည်',
    deleteResTooltip: 'အပြီးဖျက်မည်',
    kitchenOrdersDockLabel: 'မီးဖိုချောင် အော်ဒါများနှင့် စားပွဲများ:',
    itemsCountLabel: 'ခု',
    tableStationFallback: 'စားပွဲ',
    guestFallback: 'ဧည့်သည်',
    notesLabel: 'မှတ်ချက်:',
    snooze10MinTooltip: 'အချက်ပေးသံကို ၁၀ မိနစ် ရွှေ့ဆိုင်းပါ',
    testSound1Tooltip: 'အော်ဒါအသစ်ဝင်ရောက်သံ စမ်းသပ်ပါ',
    testSound2Tooltip: '၁၅ မိနစ် သတိပေးသံ စမ်းသပ်ပါ',
    cancelOrderTooltip: 'ဤအော်ဒါကို ပယ်ဖျက်ပါ',
    deleteOrderTooltip: 'ဤအော်ဒါကို အပြီးဖျက်ပါ',
    inKitchenBadge: 'မီးဖိုချောင်တွင်ရှိသည်',
    inDiningRoomBadge: 'စားသောက်ခန်းမတွင်ရှိသည်',
    openBillBadge: 'ဘေလ်ဖွင့်ထားသည်',
    tapToViewOrderTooltip: 'အသေးစိတ်ကြည့်ရန် နှိပ်ပါ',
    tapToChangeTableTooltip: 'စားပွဲပြောင်းရန် နှိပ်ပါ',
    deliveringBadge: 'ပို့ဆောင်နေပါသည်',
    orderNumberPrefix: 'အော်ဒါ #'
  },

  it: {
    kitchenTitle: 'KITCHEN MONITOR',
    col1Title: 'NUOVI ORDINI (DA ACCETTARE)',
    col2Title: 'IN PREPARAZIONE & CONSEGNA',
    noKitchenOrders: 'NESSUN NUOVO ORDINE',
    noKitchenSub: 'Il monitor suonerà automaticamente all\'arrivo di una comanda.',
    noReadyOrders: 'NESSUN ORDINE IN PREPARAZIONE',
    noReadySub: 'Gli ordini accettati compariranno qui per preparazione e consegna.',
    acceptBtn: 'ACCETTA COMANDA',
    muteBtn: 'SILENZIA',
    muteAlarmBar: 'DISATTIVA SUONERIA',
    dispatchRiderBtn: '🛵 ASSEGNA AL RIDER (PARTITO)',
    bakedBtn: 'SFORNATO ➔ PRONTO PER IL RIDER',
    directArchiveBtn: '✓ ARCHIVIA SUBITO',
    deliveredBtn: '✓ CONSEGNATO & ARCHIVIATO',
    cancelBtn: '✕ ANNULLA',
    deleteBtn: '🗑️ ELIMINA',
    minAgo: 'min fa',
    cookingFor: 'IN FORNO DA',
    min: 'min',
    newBadge: 'NUOVA COMANDA',
    callBtn: 'CHIAMA',
    notifyCustBtn: 'NOTIFICA CLIENTE',
    sendRiderBtn: 'MAPPA RIDER',
    mapBtn: 'MAPPA',
    screenOn: 'SCHERMO ATTIVO',
    testSound: 'TEST 🔔',
    serviceOpen: 'SERVIZIO: APERTO',
    servicePaused: 'SERVIZIO: IN PAUSA',
    serviceClosed: 'SERVIZIO: CHIUSO',
    hoursTitle: 'ORARI DI APERTURA E CHIUSURA',
    openTimeLabel: 'Ora Apertura:',
    closeTimeLabel: 'Ora Chiusura:',
    saveHoursBtn: 'SALVA ORARI',
    hoursSaved: 'ORARI SALVATI!',
    customPauseLabel: 'Durata Pausa Personalizzata (min):',
    applyCustomPause: 'ATTIVA PAUSA',
    openNowEarly: 'APRI SERVIZIO ADESSO (ANTICIPA)',
    sizeLabel: 'Formato',
    extraLabel: 'Extra',
    dispatchReminderBadge: '⏰ OLTRE 15 MIN: RICORDATI DI EVADERE LA COMANDA',
    snoozeReminderBtn: 'POSTICIPA 10 MIN',
    snoozedBadge: 'POSTICIPATO',
    testAlarmBtn: 'TEST 1 🔔',
    testChimeBtn: 'TEST 2 ⏰',
    stopTestBtn: 'FERMA',
    rejectResBtn: '✕ RIFIUTA',
    orderPaidBtn: '💳 CONTO SALDATO (CHIUDI & ARCHIVIA)',
    readyForSettlementBtn: '✓ PRONTO PER IL CONTO (SPOSTA A DESTRA)',
    openTableNotice: 'Tavolo aperto in sala: pronto per integrazioni comanda',
    payAtCashierBadge: '🏪 CONTO ALLA CASSA',
    cashCollectBadge: '💵 CONTANTI ALLA CONSEGNA',
    promptPayPaidBadge: '📱 PROMPTPAY (PAGATO)',
    cardPaidBadge: '💳 CARTA 3DS (PAGATO)',
    newReservationBadge: 'NUOVA PRENOTAZIONE TAVOLO',
    dineInTableBadge: 'Tavolo al Ristorante',
    guestsLabel: 'Coperti',
    seatingAreaLabel: 'Area Tavolo:',
    bambooHutLabel: '🛖 Gazebo Bamboo',
    indoorAcLabel: '🏠 Sala Climatizzata',
    gardenAreaLabel: '🌿 Giardino Tropicale',
    anyAreaLabel: '🎲 Qualsiasi Postazione',
    confirmArchiveResBtn: '✓ CONFERMA & ARCHIVIA',
    rejectResTooltip: 'Rifiuta prenotazione tavolo',
    deleteResTooltip: 'Elimina definitivamente la prenotazione',
    kitchenOrdersDockLabel: 'COMANDE IN CUCINA & TAVOLI:',
    itemsCountLabel: 'piatti',
    tableStationFallback: 'Tavolo',
    guestFallback: 'Ospite',
    notesLabel: 'Note:',
    snooze10MinTooltip: 'Posticipa la suoneria promemoria di 10 minuti',
    testSound1Tooltip: 'Test suoneria allarme nuova comanda in arrivo',
    testSound2Tooltip: 'Test suoneria promemoria rider 15 minuti',
    cancelOrderTooltip: 'Annulla questa comanda',
    deleteOrderTooltip: 'Elimina definitivamente la comanda',
    inKitchenBadge: 'IN CUCINA',
    inDiningRoomBadge: 'IN SALA',
    openBillBadge: 'CONTO APERTO',
    tapToViewOrderTooltip: 'Tocca per aprire i dettagli della comanda e gestirla',
    tapToChangeTableTooltip: 'Tocca per cambiare tavolo',
    deliveringBadge: 'RIDER IN CONSEGNA',
    orderNumberPrefix: 'Ordine #'
  },

  de: {
    kitchenTitle: 'KITCHEN MONITOR',
    col1Title: 'NEUE BESTELLUNGEN (ANNEHMEN)',
    col2Title: 'IN ZUBEREITUNG & LIEFERUNG',
    noKitchenOrders: 'KEINE NEUEN BESTELLUNGEN',
    noKitchenSub: 'Das Tablet klingelt bei neuen Bestellungen.',
    noReadyOrders: 'KEINE BESTELLUNGEN IN ZUBEREITUNG',
    noReadySub: 'Angenommene Bestellungen erscheinen hier.',
    acceptBtn: 'BESTELLUNG ANNEHMEN',
    muteBtn: 'STUMM',
    muteAlarmBar: 'ALARM AUS',
    dispatchRiderBtn: '🛵 AN FAHRER ÜBERGEBEN',
    bakedBtn: 'GEBACKEN ➔ BEREIT FÜR FAHRER',
    directArchiveBtn: '✓ DIREKT ARCHIVIEREN',
    deliveredBtn: '✓ GELIEFERT & ARCHIVIERT',
    cancelBtn: '✕ ABBRECHEN',
    deleteBtn: '🗑️ LÖSCHEN',
    minAgo: 'Min. her',
    cookingFor: 'IM OFEN',
    min: 'Min.',
    newBadge: 'NEUE BESTELLUNG',
    callBtn: 'ANRUFEN',
    notifyCustBtn: 'KUNDE BENACHRICHTIGEN',
    sendRiderBtn: 'FAHRER-KARTE',
    mapBtn: 'KARTE',
    screenOn: 'BILDSCHIRM AN',
    testSound: 'TEST 🔔',
    serviceOpen: 'ONLINE: GEÖFFNET',
    servicePaused: 'ONLINE: PAUSIERT',
    serviceClosed: 'ONLINE: GESCHLOSSEN',
    hoursTitle: 'ÖFFNUNGS- UND SCHLIESSZEITEN',
    openTimeLabel: 'Öffnungszeit:',
    closeTimeLabel: 'Schließzeit:',
    saveHoursBtn: 'ZEITEN SPEICHERN',
    hoursSaved: 'ZEITEN GESPEICHERT!',
    customPauseLabel: 'Benutzerdefinierte Pause (Min.):',
    applyCustomPause: 'PAUSE SETZEN',
    openNowEarly: 'JETZT ÖFFNEN (VORZEITIG)',
    sizeLabel: 'Größe',
    extraLabel: 'Extra',
    dispatchReminderBadge: '⏰ 15+ MIN: BESTELLUNG ABSCHLIESSEN',
    snoozeReminderBtn: '10 MIN SCHLUMMERN',
    snoozedBadge: 'PAUSIERT',
    testAlarmBtn: 'TEST 1 🔔',
    testChimeBtn: 'TEST 2 ⏰',
    stopTestBtn: 'STOPP',
    rejectResBtn: '✕ ABLEHNEN',
    orderPaidBtn: '💳 BEZAHLT (SCHLIESSEN & ARCHIVIEREN)',
    readyForSettlementBtn: '✓ BEREIT ZUM ZAHLEN',
    openTableNotice: 'Offener Tisch im Gastraum',
    payAtCashierBadge: '🏪 ZAHLUNG AN DER KASSE',
    cashCollectBadge: '💵 BARZAHLUNG BEI LIEFERUNG',
    promptPayPaidBadge: '📱 PROMPTPAY (BEZAHLT)',
    cardPaidBadge: '💳 KARTE 3DS (BEZAHLT)',
    newReservationBadge: 'NEUE RESERVIERUNG',
    dineInTableBadge: 'Tisch im Restaurant',
    guestsLabel: 'Gäste',
    seatingAreaLabel: 'Sitzbereich:',
    bambooHutLabel: '🛖 Bambushütte',
    indoorAcLabel: '🏠 Innenbereich',
    gardenAreaLabel: '🌿 Tropischer Garten',
    anyAreaLabel: '🎲 Beliebiger Bereich',
    confirmArchiveResBtn: '✓ BESTÄTIGEN & ARCHIVIEREN',
    rejectResTooltip: 'Reservierung ablehnen',
    deleteResTooltip: 'Reservierung dauerhaft löschen',
    kitchenOrdersDockLabel: 'KÜCHENBESTELLUNGEN & TISCHE:',
    itemsCountLabel: 'Gerichte',
    tableStationFallback: 'Tisch',
    guestFallback: 'Gast',
    notesLabel: 'Notizen:',
    snooze10MinTooltip: 'Erinnerungsalarm um 10 Minuten verschieben',
    testSound1Tooltip: 'Testton für neue Bestellung',
    testSound2Tooltip: 'Testton für 15-Minuten-Fahrer-Erinnerung',
    cancelOrderTooltip: 'Diese Bestellung stornieren',
    deleteOrderTooltip: 'Bestellung dauerhaft löschen',
    inKitchenBadge: 'IN DER KÜCHE',
    inDiningRoomBadge: 'IM GASTRAUM',
    openBillBadge: 'OFFENE RECHNUNG',
    tapToViewOrderTooltip: 'Tippen für Bestelldetails',
    tapToChangeTableTooltip: 'Tippen zum Tischwechsel',
    deliveringBadge: 'WIRD AUSGELIEFERT',
    orderNumberPrefix: 'Bestellung #'
  }
};
