import os
import json
import time
import urllib.request
import urllib.error
from datetime import datetime

# Helper to load environment variables from .env or .env.local
def load_env():
    env_config = {}
    for env_file in ['.env.local', '.env']:
        if os.path.exists(env_file):
            with open(env_file, 'r', encoding='utf-8') as f:
                for line in f:
                    line = line.strip()
                    if not line or line.startswith('#'):
                        continue
                    if '=' in line:
                        key, val = line.split('=', 1)
                        key = key.strip()
                        val = val.strip()
                        if val.startswith('"') and val.endswith('"'):
                            val = val[1:-1]
                        elif val.startswith("'") and val.endswith("'"):
                            val = val[1:-1]
                        env_config[key] = val
            break
    return env_config

env = load_env()
SUPABASE_URL = env.get('SUPABASE_URL') or env.get('VITE_SUPABASE_URL')
SUPABASE_SERVICE_ROLE_KEY = env.get('SUPABASE_SERVICE_ROLE_KEY') or env.get('SERVICE_ROLE')
OCTORATE_STRUCTURE_ID = env.get('VITE_OCTORATE_STRUCTURE_ID', '366879')
OCTORATE_API_BASE = 'https://api.octorate.com/connect/rest/v1'

CACHE_FILE_PATH = 'scratch/octorate-cache-py.json'
CACHE_TTL_SECONDS = 5 * 60

def get_cached_data(cache_key):
    if os.path.exists(CACHE_FILE_PATH):
        try:
            with open(CACHE_FILE_PATH, 'r', encoding='utf-8') as f:
                cache_obj = json.load(f)
            entry = cache_obj.get(cache_key)
            if entry and (time.time() - entry['timestamp'] < CACHE_TTL_SECONDS):
                return entry['data']
        except Exception:
            pass
    return None

def save_to_cache(cache_key, data):
    cache_obj = {}
    if os.path.exists(CACHE_FILE_PATH):
        try:
            with open(CACHE_FILE_PATH, 'r', encoding='utf-8') as f:
                cache_obj = json.load(f)
        except Exception:
            cache_obj = {}
    
    cache_obj[cache_key] = {
        'timestamp': time.time(),
        'data': data
    }
    try:
        os.makedirs(os.path.dirname(CACHE_FILE_PATH), exist_ok=True)
        with open(CACHE_FILE_PATH, 'w', encoding='utf-8') as f:
            json.dump(cache_obj, f, indent=2)
    except Exception as e:
        print(f"⚠️ Impossibile salvare la cache locale: {e}")

def get_octorate_token():
    if not SUPABASE_URL or not SUPABASE_SERVICE_ROLE_KEY:
        raise ValueError("SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY mancanti nel file d'ambiente (.env o .env.local)")
    
    url = f"{SUPABASE_URL}/rest/v1/octorate_tokens?id=eq.singleton&select=access_token"
    headers = {
        'apikey': SUPABASE_SERVICE_ROLE_KEY,
        'Authorization': f"Bearer {SUPABASE_SERVICE_ROLE_KEY}"
    }
    
    req = urllib.request.Request(url, headers=headers)
    try:
        with urllib.request.urlopen(req) as response:
            res_data = json.loads(response.read().decode('utf-8'))
            if res_data and len(res_data) > 0:
                return res_data[0].get('access_token')
            else:
                raise ValueError("Token Octorate non trovato in Supabase.")
    except Exception as e:
        raise ValueError(f"Errore durante il recupero del token da Supabase: {e}")

def get_calendar_data_verbose(token, rate_id, date_from, date_to):
    cache_key = f"calendar_{rate_id}_{date_from}_{date_to}"
    cached = get_cached_data(cache_key)
    if cached:
        print(f"📦 [CACHE LOCAL] Lettura dati calendario da cache locale per ID {rate_id}... OK ✅")
        return {'ok': True, 'data': cached}
    
    url = f"{OCTORATE_API_BASE}/calendar/{OCTORATE_STRUCTURE_ID}?product={rate_id}&date_from={date_from}&date_to={date_to}"
    headers = {
        'Authorization': f"Bearer {token}"
    }
    req = urllib.request.Request(url, headers=headers)
    try:
        with urllib.request.urlopen(req) as response:
            data = json.loads(response.read().decode('utf-8'))
            save_to_cache(cache_key, data)
            return {'ok': True, 'data': data}
    except urllib.error.HTTPError as e:
        try:
            err_text = e.read().decode('utf-8')
        except Exception:
            err_text = str(e)
        return {'ok': False, 'status': e.code, 'error': err_text}
    except Exception as e:
        return {'ok': False, 'error': str(e)}

def fetch_with_concurrency_limit(token, rates, limit=3):
    results = []
    date_from = datetime.now().strftime('%Y-%m-%d')
    date_to = '2026-10-31'
    
    for i in range(0, len(rates), limit):
        chunk = rates[i:i+limit]
        for rate in chunk:
            print(f"📡 [HTTP GET] Richiesta Octorate per: \"{rate['name']}\" (ID: {rate['id']})...")
            res = get_calendar_data_verbose(token, rate['id'], date_from, date_to)
            results.append({
                'rateName': rate['name'],
                'id': rate['id'],
                'result': res
            })
        
        if i + limit < len(rates):
            time.sleep(0.3) # Delay di cortesia per la rete di Koh Phayam
            
    return results

def main():
    try:
        print('========================================================================')
        print('🔍 DIAGNOSTICA VERBOSE PYTHON (V7 OPTIMIZED): VERIFICA STATO TARIFFE OTA')
        print('⚡ Ottimizzato per Koh Phayam: Cache locale 5m + Rate Limiting Safe')
        print('========================================================================\n')

        token = get_octorate_token()
        print('🔑 [STEP 1] Recupero token Octorate... OK ✅\n')

        print('📡 [STEP 2] Scaricamento del catalogo tariffe da Octorate...')
        cache_key_catalog = f"catalog_{OCTORATE_STRUCTURE_ID}"
        all_products = get_cached_data(cache_key_catalog)
        
        if not all_products:
            url = f"https://api.octorate.com/connect/rest/v3/roomrates/{OCTORATE_STRUCTURE_ID}?fields=id,name"
            headers = {
                'Authorization': f"Bearer {token}"
            }
            req = urllib.request.Request(url, headers=headers)
            try:
                with urllib.request.urlopen(req) as response:
                    all_products = json.loads(response.read().decode('utf-8'))
                    save_to_cache(cache_key_catalog, all_products)
            except urllib.error.HTTPError as e:
                print(f"\n❌ ERRORE OCTORATE HTTP {e.code}")
                raise RuntimeError(f"Errore scaricamento catalogo: HTTP {e.code}")
        else:
            print('📦 [CACHE LOCAL] Catalogo alloggi recuperato da cache locale... OK ✅')

        booking_rates = [p for p in all_products if p.get('name') and ('main bnb-7d' in p['name'].lower() or 'main bnb-14d' in p['name'].lower())]
        agoda_rates = [p for p in all_products if p.get('name') and ('acd ac-7d' in p['name'].lower() or 'agd ac-14d' in p['name'].lower() or 'agoda ac' in p['name'].lower())]

        print(f"\n🔵 Trovate {len(booking_rates)} Tariffe Booking (Main bnb-7d/14d) nel catalogo.")
        print(f"💗 Trovate {len(agoda_rates)} Tariffe Agoda (AGD AC-7d/14d) nel catalogo.\n")

        date_from = datetime.now().strftime('%Y-%m-%d')
        date_to = '2026-10-31'

        print(f"📅 Analisi del periodo: Dal {date_from} Al {date_to} (compresi)")
        print('------------------------------------------------------------------------')

        test_rates = []
        if len(booking_rates) > 0:
            test_rates.append(booking_rates[0])
        if len(agoda_rates) > 0:
            test_rates.append(agoda_rates[0])

        if len(test_rates) > 0:
            print(f"\n🧪 Test diagnostico di lettura parallela a concorrenza limitata (Max 3):")
            results = fetch_with_concurrency_limit(token, test_rates, 3)
            
            for res in results:
                r_res = res['result']
                if r_res['ok']:
                    days_count = len(r_res['data'].get('days', [])) if 'days' in r_res['data'] else 0
                    print(f"🟢 LETTURA OK per \"{res['rateName']}\"! Giorni ricevuti: {days_count}")
                else:
                    print(f"🔴 ERRORE LETTURA per \"{res['rateName']}\": Status HTTP {r_res.get('status')}. Dettagli: {r_res.get('error')}")

        print('\n========================================================================')
    except Exception as e:
        print(f"\n❌ ERRORE CRITICO DIAGNOSTICA: {e}")

if __name__ == '__main__':
    main()
