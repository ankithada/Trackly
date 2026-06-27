const fs = require('fs');
const path = require('path');
const { GoogleAuth } = require('google-auth-library');

const envPath = path.join(__dirname, '.env');
if (fs.existsSync(envPath)) {
  for (const rawLine of fs.readFileSync(envPath, 'utf8').split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith('#')) continue;
    const match = line.match(/^([A-Za-z_][A-Za-z0-9_]*)=(.*)$/);
    if (!match) continue;
    let value = match[2].trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    process.env[match[1]] = value;
  }
}

const rawKey = process.env.GOOGLE_PRIVATE_KEY || '';
const trimmedKey = rawKey.trim();
const keyPath = trimmedKey && path.isAbsolute(trimmedKey) ? trimmedKey : path.join(__dirname, trimmedKey);
console.log('GOOGLE_PRIVATE_KEY raw:', process.env.GOOGLE_PRIVATE_KEY);
console.log('Resolved keyPath:', keyPath);
console.log('Exists:', fs.existsSync(keyPath));

(async () => {
  try {
    const auth = new GoogleAuth({
      keyFilename: keyPath,
      scopes: [
        'https://www.googleapis.com/auth/spreadsheets',
        'https://www.googleapis.com/auth/drive.file'
      ]
    });
    const client = await auth.getClient();
    const token = await client.getAccessToken();
    console.log('Token length:', token.token ? token.token.length : 'none');

    const sheetId = process.env.GOOGLE_SHEET_ID;
    if (!sheetId) {
      console.error('Missing GOOGLE_SHEET_ID');
      process.exit(1);
    }
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/A1?majorDimension=ROWS`;
    const res = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token.token}`
      }
    });
    const body = await res.text();
    console.log('status', res.status, res.statusText);
    console.log('body', body.slice(0, 2000));
  } catch (error) {
    console.error('TEST ERROR:', error);
    process.exit(1);
  }
})();
