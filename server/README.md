Google Drive ingestion (server)
=================================

This small server downloads the latest file from a configured Google Drive folder and runs the UOM analysis.

Setup (high level)
1. Enable Google Drive API in a Google Cloud project.
2. Create a Service Account and download the JSON key file.
3. Share the Drive folder with the Service Account email (give Viewer access). Obtain the folder ID from the folder URL.
4. Copy the service account JSON key to the server and set the environment variable:

   ```powershell
   setx GOOGLE_APPLICATION_CREDENTIALS "C:\path\to\service-account.json"
   setx DRIVE_FOLDER_ID "YOUR_FOLDER_ID_HERE"
   ```

   Or export env vars in Linux/macOS:
   ```bash
   export GOOGLE_APPLICATION_CREDENTIALS=/path/to/service-account.json
   export DRIVE_FOLDER_ID=YOUR_FOLDER_ID_HERE
   ```

5. Install dependencies and start the server:
   ```powershell
   cd server
   npm install
   npm start
   ```

Usage
- GET /api/process-drive-ywm005
  - The server lists files in the folder (most recently modified first). It prefers a file with "ywm005" in the name, otherwise picks the latest file.
  - It downloads the file and runs the same UOM analysis the frontend uses. Returns JSON:
    { file: 'ywm005.xlsx', results: [ { row, matCliente, descripcion, stockOriginal, stockParsed, uom, division }, ... ] }

Notes
- This server uses the service account so you don't need to handle rotating personal credentials.
- Secure the server behind HTTPS and add authentication if you plan to expose it beyond your network.
- Alternatively you can implement a push flow where the SAP operator triggers processing from a simple script that calls this endpoint after uploading the file to Drive.
