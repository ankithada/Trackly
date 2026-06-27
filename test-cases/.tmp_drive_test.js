const fs = require('fs');
const path = require('path');
const { GoogleAuth } = require('google-auth-library');

function loadEnv() {
  const envPath = path.join(__dirname, '.env');
  if (!fs.existsSync(envPath)) return;
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

loadEnv();

const keyRaw = process.env.GOOGLE_PRIVATE_KEY || '';
const keyPath = path.isAbsolute(keyRaw.trim()) ? keyRaw.trim() : path.join(__dirname, keyRaw.trim());
console.log('GOOGLE_PRIVATE_KEY path:', keyPath);
console.log('Private key exists:', fs.existsSync(keyPath));
console.log('GOOGLE_SHEET_ID:', process.env.GOOGLE_SHEET_ID);
console.log('GOOGLE_DRIVE_FOLDER_ID:', process.env.GOOGLE_DRIVE_FOLDER_ID);

(async () => {
  try {
    const auth = new GoogleAuth({
      keyFilename: keyPath,
      scopes: [
        'https://www.googleapis.com/auth/drive.file',
        'https://www.googleapis.com/auth/spreadsheets'
      ]
    });
    const client = await auth.getClient();
    const token = await client.getAccessToken();
    console.log('Access token length:', token.token ? token.token.length : 'none');

    const folderId = process.env.GOOGLE_DRIVE_FOLDER_ID;
    const url = `https://www.googleapis.com/drive/v3/files/${encodeURIComponent(folderId)}?fields=id,name&supportsAllDrives=true`;
    const res = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token.token}`
      }
    });
    const body = await res.text();
    console.log('Drive status:', res.status, res.statusText);
    console.log('Drive response:', body);
  } catch (err) {
    console.error('Drive test error:', err);
    process.exit(1);
  }
})();
