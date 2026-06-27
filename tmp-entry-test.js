const http = require('http');

function request(options, body) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => resolve({ statusCode: res.statusCode, headers: res.headers, body: data }));
    });
    req.on('error', reject);
    if (body) req.write(body);
    req.end();
  });
}

(async () => {
  try {
    const loginData = JSON.stringify({ username: 'admin', password: 'admin123' });
    const login = await request({ host: '127.0.0.1', port: 3000, path: '/api/auth/login', method: 'POST', headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(loginData) } }, loginData);
    console.log('LOGIN', login.statusCode, login.body);

    const setCookie = login.headers['set-cookie'];
    if (!setCookie) {
      console.error('No cookie returned');
      process.exit(1);
    }
    const cookie = Array.isArray(setCookie) ? setCookie.map((c) => c.split(';')[0]).join('; ') : setCookie.split(';')[0];

    const payload = JSON.stringify({
      receiptNumber: '',
      vehicleNumber: 'RJTEST01',
      vehicleType: 'Tipper',
      driverName: 'Test Driver',
      driverPhone: '9999999999',
      ownerName: 'Test Owner',
      entryAreaGate: 'A',
      exitAreaGate: 'B',
      tareWeightTons: '10',
      grossWeightTons: '20',
      amountPaid: '1000',
      totalAmountInclGst: '1180',
      paymentMode: 'Cash',
      formReason: 'Test',
      destinationName: 'Site',
      distanceKm: '10',
      validityTimeHours: '2',
      photos: {}
    });

    const create = await request({ host: '127.0.0.1', port: 3000, path: '/api/entries', method: 'POST', headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(payload), Cookie: cookie } }, payload);
    console.log('CREATE', create.statusCode, create.body);
  } catch (err) {
    console.error('ERR', err);
    process.exit(1);
  }
})();
