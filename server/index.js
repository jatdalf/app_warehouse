require("dotenv").config();

const express = require('express');
const cors = require('cors');
const {obtenerUltimoYWM005}=require("./services/driveService");
const {analyzeBuffer}=require("./utils/xlsxAnalyzer");
const { https } = require('follow-redirects');
const driveRoutes=require("./routes/drive");
const healthRoutes=require("./routes/health");
const remitosRoutes=require("./routes/remitos");

const app = express();
app.use(cors());
app.use(express.json());
app.use("/api",driveRoutes);
app.use("/api",healthRoutes);
app.use("/api",remitosRoutes);

const DRIVE_FOLDER_ID = process.env.DRIVE_FOLDER_ID; // set this to the shared folder id

if (!DRIVE_FOLDER_ID) {
  console.warn('WARNING: DRIVE_FOLDER_ID is not set. Please set the environment variable to the Drive folder id.');
}


// Proxy an export URL (or sheetId) for Google Sheets and analyze server-side to avoid CORS.
// Usage: /api/proxy-export?sheetId=SPREADSHEET_ID  OR /api/proxy-export?exportUrl=FULL_EXPORT_URL
app.get('/api/proxy-export', async (req, res) => {
  try {
    const { sheetId, exportUrl } = req.query;
    let url = exportUrl;
    if (!url && sheetId) {
      url = `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=xlsx`;
    }
    if (!url) return res.status(400).json({ error: 'Provide sheetId or exportUrl query param' });

    // Download the export following redirects
    https.get(url, { timeout: 20000 }, (resp) => {
      const chunks = [];
      resp.on('data', (chunk) => chunks.push(chunk));
      resp.on('end', () => {
        const buffer = Buffer.concat(chunks);
        try {
          const results = analyzeBuffer(buffer);
          return res.json({ file: sheetId || exportUrl, results });
        } catch (err) {
          console.error('Analyze error', err);
          return res.status(500).json({ error: 'Failed to analyze workbook: ' + String(err?.message ?? err) });
        }
      });
      resp.on('error', (err) => {
        console.error('Download error', err);
        return res.status(500).json({ error: 'Failed to download export: ' + String(err?.message ?? err) });
      });
    }).on('error', (err) => {
      console.error('Request error', err);
      return res.status(500).json({ error: 'Request failed: ' + String(err?.message ?? err) });
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: String(err?.message ?? err) });
  }
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Server listening on ${PORT}`));
