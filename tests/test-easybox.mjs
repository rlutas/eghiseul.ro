const API_URL = 'https://api.sameday.ro';

async function testEasyBox() {
  // Auth
  const authRes = await fetch(API_URL + '/api/authenticate', {
    method: 'POST',
    headers: {
      'X-AUTH-USERNAME': 'edigitalizareAPI',
      'X-AUTH-PASSWORD': 'Lp7k#Qg2',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ remember_me: 1 }),
  });
  const authData = await authRes.json();
  if (!authData.token) {
    console.log('Auth failed:', authData);
    return;
  }
  const token = authData.token;
  console.log('Auth OK, token:', token.substring(0, 10) + '...');

  // Get EasyBox lockers
  const lockersRes = await fetch(API_URL + '/api/client/ooh-locations?countPerPage=500&page=1&listingType=0', {
    headers: { 'X-AUTH-TOKEN': token },
  });
  const lockersData = await lockersRes.json();
  console.log('Total lockers:', lockersData.total);

  // Filter by Arad county
  const aradLockers = lockersData.data.filter(l =>
    l.county && l.county.toLowerCase().includes('arad')
  );
  console.log('Arad lockers:', aradLockers.length);
  for (const l of aradLockers.slice(0, 5)) {
    console.log(`  ${l.name} | ${l.city} | ${l.county} | lat:${l.lat} lng:${l.lng}`);
  }

  // Check bucuresti too
  const bucLockers = lockersData.data.filter(l =>
    l.county && l.county.toLowerCase().includes('bucure')
  );
  console.log('\nBucuresti lockers:', bucLockers.length);
}

testEasyBox().catch(e => console.error('Error:', e));
