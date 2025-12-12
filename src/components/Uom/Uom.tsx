import React, { useRef, useState } from 'react';
import styles from './Uom.module.css';

type FailureRow = {
  rowIndex: number;
  matCliente: string | number;
  descripcion: string | number;
  stockOriginal: any;
  stockParsed: number | null;
  uom: number | null;
  division: number | null;
};

const Uom: React.FC = () => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [failures, setFailures] = useState<FailureRow[]>([]);
  const [processing, setProcessing] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const parseNumber = (val: any): number | null => {
    if (val === null || val === undefined || val === '') return null;
    if (typeof val === 'number') return val;
    const s = String(val).trim();
    // If it ends with .000 remove that
    let cleaned = s;
    if (cleaned.endsWith('.000')) cleaned = cleaned.slice(0, -4);
    // Remove thousands separators like commas
    cleaned = cleaned.replace(/[,]/g, '');
    // Try parse
    const n = Number(cleaned);
    return Number.isFinite(n) ? n : null;
  };

  const analyzeWorkbook = (arrayBuffer: ArrayBuffer) => {
    // load xlsx dynamically
    return import('xlsx').then((XLSX) => {
      const wb = XLSX.read(arrayBuffer, { type: 'array' });
      const sheetName = wb.SheetNames[0];
      const sheet = wb.Sheets[sheetName];
      const rows: any[][] = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' });

      const results: FailureRow[] = [];

      for (let i = 1; i < rows.length; i++) {
        const row = rows[i];
        // columns are 0-based: A=0, C=2, F=5, N=13
        const matCliente = row[0];
        const descripcion = row[2];
        const stockCell = row[5];
        const uomCell = row[13];

        const stockParsed = (() => {
          if (stockCell === null || stockCell === undefined || stockCell === '') return null;
          // If it's a number like 12345.000 JS may parse as number; convert to string then remove trailing .000 if present
          if (typeof stockCell === 'number') return stockCell;
          let s = String(stockCell).trim();
          if (s.endsWith('.000')) s = s.slice(0, -4);
          s = s.replace(/[,]/g, '');
          const n = Number(s);
          return Number.isFinite(n) ? n : null;
        })();

        const uom = parseNumber(uomCell);

        if (stockParsed === null || uom === null || uom === 0) {
          // skip or consider as failure? we'll skip rows with missing data
          continue;
        }

        const division = stockParsed / uom;
        const isInteger = Math.abs(division - Math.round(division)) < 1e-9;
        if (!isInteger) {
          results.push({
            rowIndex: i + 1, // human-friendly (1-based)
            matCliente,
            descripcion,
            stockOriginal: stockCell,
            stockParsed,
            uom,
            division,
          });
        }
      }

      return results;
    });
  };

  const handleFetchOrPick = async () => {
    setProcessing(true);
    setMessage(null);
    setFailures([]);
    try {
      // try to fetch from public/data/ywm005.xlsx (you can place the file in public/data)
      const url = '/data/ywm005.xlsx';
      const resp = await fetch(url);
      if (resp.ok) {
        const buf = await resp.arrayBuffer();
        const res = await analyzeWorkbook(buf);
        setFailures(res);
        setMessage(`Procesado ${res.length} filas con fallo.`);
      } else {
        // fall back to file picker
        setMessage('Archivo no disponible en /data/ywm005.xlsx — por favor selecciona el archivo manualmente.');
        fileInputRef.current?.click();
      }
    } catch (err: any) {
      setMessage('Error leyendo el archivo: ' + String(err?.message ?? err));
    } finally {
      setProcessing(false);
    }
  };

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setProcessing(true);
    setMessage(null);
    setFailures([]);
    try {
      const buf = await f.arrayBuffer();
      const res = await analyzeWorkbook(buf);
      setFailures(res);
      setMessage(`Procesado ${res.length} filas con fallo.`);
    } catch (err: any) {
      setMessage('Error procesando el archivo: ' + String(err?.message ?? err));
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div>
      <h3>Analisis de UOM</h3>
      <p>Al hacer click se intentará leer <strong>ywm005.xlsx</strong> desde <code>/data/ywm005.xlsx</code> (coloca el archivo en <code>public/data/</code>), o selecciona manualmente si no está disponible.</p>
      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        <button onClick={handleFetchOrPick} disabled={processing}>
          {processing ? 'Procesando...' : 'Procesar UOM (ywm005.xlsx)'}
        </button>
        <input ref={fileInputRef} type="file" accept=".xls,.xlsx" style={{ display: 'none' }} onChange={handleFile} />
      </div>

      {message && <p>{message}</p>}

      {failures.length > 0 && (
        <div style={{ marginTop: 16 }}>
          <h4>Filas con falla de UOM ({failures.length})</h4>
          <div className={styles.tableWrap}>
            <table className={styles.uomTable}>
              <thead>
                <tr>
                  <th>Fila</th>
                  <th>MAT. CLIENTE</th>
                  <th>DESCRIPCIÓN</th>
                  {/* <th>STOCK original (F)</th> */}
                  <th>STOCK</th>
                  <th>UOM</th>
                  <th>STOCK / UOM</th>
                </tr>
              </thead>
              <tbody>
                {failures.map((r) => (
                  <tr key={r.rowIndex}>
                    <td data-label="Fila"><span>{r.rowIndex}</span></td>
                    <td data-label="MAT. CLIENTE"><span>{String(r.matCliente ?? '')}</span></td>
                    <td data-label="DESCRIPCIÓN" className={styles.desc}><span>{String(r.descripcion ?? '')}</span></td>
                    {/* <td data-label="STOCK original (F)"><span>{String(r.stockOriginal ?? '')}</span></td> */}
                    <td data-label="STOCK" className={styles.numeric}><span>{r.stockParsed}</span></td>
                    <td data-label="UOM" className={styles.numeric}><span>{r.uom}</span></td>
                    <td data-label="STOCK / UOM" className={styles.numeric}><span>{r.division}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default Uom;