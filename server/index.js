const express = require('express');
const cors = require('cors');
const { google } = require('googleapis');
const XLSX = require('xlsx');

const app = express();
app.use(cors());
app.use(express.json());

const DRIVE_FOLDER_ID = process.env.DRIVE_FOLDER_ID; // set this to the shared folder id

if (!DRIVE_FOLDER_ID) {
  console.warn('WARNING: DRIVE_FOLDER_ID is not set. Please set the environment variable to the Drive folder id.');
}

// helper: download file from Drive into Buffer
async function downloadFileBuffer(drive, fileId) {
  const res = await drive.files.get({ fileId, alt: 'media' }, { responseType: 'stream' });
  const chunks = [];
  return new Promise((resolve, reject) => {
    res.data.on('data', (chunk) => chunks.push(chunk));
    res.data.on('end', () => resolve(Buffer.concat(chunks)));
    res.data.on('error', reject);
  });
}

// Analizar buffer de xlsx y devolver fallos (mismo criterio que frontend)
function analyzeBuffer(buffer) {
  const wb = XLSX.read(buffer, { type: 'buffer' });
  const sheetName = wb.SheetNames[0];
  const sheet = wb.Sheets[sheetName];
  const rows = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' });

  const results = [];
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    const matCliente = row[0];
    const descripcion = row[2];
    const stockCell = row[5];
    const uomCell = row[13];

    const parseNumber = (val) => {
      if (val === null || val === undefined || val === '') return null;
      if (typeof val === 'number') return val;
      let s = String(val).trim();
      if (s.endsWith('.000')) s = s.slice(0, -4);
      s = s.replace(/[,]/g, '');
      const n = Number(s);
      return Number.isFinite(n) ? n : null;
    };

    const stockParsed = parseNumber(stockCell);
    const uom = parseNumber(uomCell);
    if (stockParsed === null || uom === null || uom === 0) continue;
    const division = stockParsed / uom;
    const isInteger = Math.abs(division - Math.round(division)) < 1e-9;
    if (!isInteger) {
      results.push({ row: i + 1, matCliente, descripcion, stockOriginal: stockCell, stockParsed, uom, division });
    }
  }
  return results;
}

// Endpoint: process latest file or file matching 'ywm005'
app.get('/api/process-drive-ywm005', async (req, res) => {
  try {
    const auth = new google.auth.GoogleAuth({
      scopes: ['https://www.googleapis.com/auth/drive.readonly']
    });
    const authClient = await auth.getClient();
    const drive = google.drive({ version: 'v3', auth: authClient });

    // list files in folder, order by modifiedTime desc
    const q = DRIVE_FOLDER_ID ? `'${DRIVE_FOLDER_ID}' in parents and trashed = false` : `trashed = false`;
    const listRes = await drive.files.list({ q, fields: 'files(id,name,modifiedTime)', orderBy: 'modifiedTime desc', pageSize: 50 });
    const files = listRes.data.files || [];

    if (files.length === 0) return res.status(404).json({ error: 'No files found in Drive folder' });

    // Prefer file that contains 'ywm005' in name (case-insensitive), otherwise pick latest
    let target = files.find(f => /ywm005/i.test(f.name));
    if (!target) target = files[0];

    const buffer = await downloadFileBuffer(drive, target.id);
    const results = analyzeBuffer(buffer);
    return res.json({ file: target.name, results });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: String(err?.message ?? err) });
  }
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Server listening on ${PORT}`));
