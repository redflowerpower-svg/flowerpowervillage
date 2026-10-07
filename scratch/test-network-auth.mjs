async function test() {
  try {
    // 1. Check client
    console.log('--- 1. Testing check-client ---');
    let res = await fetch('http://localhost:3000/api/network-auth?action=check-client');
    console.log('Check-client result:', await res.json());

    // 2. Testing Heartbeat from Ranong
    console.log('\n--- 2. Testing Heartbeat ---');
    res = await fetch('http://localhost:3000/api/network-auth?action=heartbeat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        location: 'ranong_pizzeria',
        label: 'Router Ranong (2.4G/5G/Extender)',
        ip: '182.232.100.55' // test simulated IP
      })
    });
    console.log('Heartbeat result:', await res.json());

    // 3. Testing Get Whitelist
    console.log('\n--- 3. Testing Get Whitelist ---');
    res = await fetch('http://localhost:3000/api/network-auth?action=get-whitelist');
    console.log('Whitelist result:', await res.json());

    // 4. Testing Authorize Persistent Device
    console.log('\n--- 4. Testing Authorize Device ---');
    res = await fetch('http://localhost:3000/api/network-auth?action=authorize-device', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        deviceId: 'dev_test_permanent_token_123',
        deviceName: 'MacBook Pro Admin Red',
        authorizedBy: 'admin'
      })
    });
    console.log('Authorize result:', await res.json());

    // 5. Testing check-client with device token
    console.log('\n--- 5. Testing Check-client with Device Token ---');
    res = await fetch('http://localhost:3000/api/network-auth?action=check-client', {
      headers: { 'X-Device-Token': 'dev_test_permanent_token_123' }
    });
    console.log('Token check result:', await res.json());

  } catch (err) {
    console.error('Error:', err.message);
  }
}

test();
