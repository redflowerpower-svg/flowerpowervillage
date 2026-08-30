async function testGetTx() {
  const res = await fetch('http://localhost:3000/api/payments-admin?action=get-transactions');
  const data = await res.json();
  console.log('Get Transactions API Output:', data);
}

testGetTx();
