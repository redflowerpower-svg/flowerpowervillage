/**
 * test-logout.mjs
 * Test reale del flusso login → sessione attiva → signOut → sessione nulla
 * Usa @supabase/supabase-js direttamente da Node (ESM).
 *
 * Usage: node test-logout.mjs <password>
 */

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL     = 'https://htmnjjzxpybpbumtbqic.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_li3CQ1bbmjZDJ2ygbE70Vg_W7XSsc8w';
const ADMIN_EMAIL      = process.env.ADMIN_TEST_EMAIL || 'admin@flowerpowervillage.com';
const ADMIN_PASS       = process.env.ADMIN_TEST_PASSWORD;

if (!ADMIN_PASS) {
  console.error('❌ Errore: variabile d\'ambiente ADMIN_TEST_PASSWORD non impostata.');
  console.error('   Imposta la variabile prima di eseguire lo script:');
  console.error('   Windows PowerShell : $env:ADMIN_TEST_PASSWORD="tua_password" ; node test-logout.mjs');
  console.error('   Windows CMD        : set ADMIN_TEST_PASSWORD=tua_password && node test-logout.mjs');
  console.error('   Linux/macOS        : ADMIN_TEST_PASSWORD=tua_password node test-logout.mjs');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function main() {
  console.log('=== TEST LOGOUT SUPABASE ADMIN ===\n');

  // STEP 1: Login
  console.log(`[1] Login con ${ADMIN_EMAIL} ...`);
  const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
    email: ADMIN_EMAIL,
    password: ADMIN_PASS,
  });

  if (signInError) {
    console.error('❌ Login FALLITO:', signInError.message);
    process.exit(1);
  }

  const session = signInData.session;
  console.log('✅ Login RIUSCITO');
  console.log('   user.id   :', signInData.user?.id);
  console.log('   user.email:', signInData.user?.email);
  console.log('   access_token (prime 20 char):', session?.access_token?.substring(0, 20) + '...');
  console.log('   expires_at:', new Date(session?.expires_at * 1000).toISOString());

  // STEP 2: Verifica sessione attiva
  console.log('\n[2] Verifica getSession() PRIMA del logout ...');
  const { data: sessionBefore } = await supabase.auth.getSession();
  if (sessionBefore?.session) {
    console.log('✅ Sessione ATTIVA (access_token presente)');
    console.log('   token_type:', sessionBefore.session.token_type);
  } else {
    console.log('⚠️  Nessuna sessione trovata (inatteso)');
  }

  // STEP 3: Chiamata protetta PRIMA del logout (deve riuscire)
  console.log('\n[3] Chiamata API protetta PRIMA del logout ...');
  const { data: ordersData, error: ordersError } = await supabase
    .from('pizza_orders')
    .select('id')
    .limit(1);

  if (ordersError) {
    console.log('⚠️  Chiamata fallita (potrebbe essere RLS):', ordersError.message);
  } else {
    console.log('✅ Chiamata riuscita, record trovati:', ordersData?.length ?? 0);
  }

  // STEP 4: signOut
  console.log('\n[4] Esecuzione supabase.auth.signOut() ...');
  const { error: signOutError } = await supabase.auth.signOut();
  if (signOutError) {
    console.error('❌ signOut FALLITO:', signOutError.message);
    process.exit(1);
  }
  console.log('✅ signOut completato senza errori');

  // STEP 5: Verifica sessione DOPO logout
  console.log('\n[5] Verifica getSession() DOPO il logout ...');
  const { data: sessionAfter } = await supabase.auth.getSession();
  if (!sessionAfter?.session) {
    console.log('✅ Sessione NULLA dopo logout — comportamento corretto');
  } else {
    console.log('❌ Sessione ancora ATTIVA dopo logout — BUG!');
    console.log('   token:', sessionAfter.session.access_token?.substring(0, 20) + '...');
  }

  // STEP 6: Chiamata protetta DOPO il logout (deve fallire o ritornare vuoto per RLS)
  console.log('\n[6] Chiamata API protetta DOPO il logout ...');
  const { data: ordersAfter, error: ordersAfterError } = await supabase
    .from('pizza_orders')
    .select('id')
    .limit(1);

  if (ordersAfterError) {
    console.log('✅ Chiamata BLOCCATA dopo logout (atteso):', ordersAfterError.message);
  } else {
    console.log('   Dati ricevuti dopo logout:', JSON.stringify(ordersAfter));
    if (ordersAfter?.length === 0) {
      console.log('✅ RLS ha filtrato i dati (nessun record — comportamento corretto per utente anonimo)');
    } else {
      console.log('⚠️  Dati visibili dopo logout — verificare policy RLS');
    }
  }

  console.log('\n=== FINE TEST ===');
}

main().catch(err => {
  console.error('Errore non gestito:', err);
  process.exit(1);
});
