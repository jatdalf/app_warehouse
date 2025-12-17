  import React, { useRef, useState } from 'react';
  import { Link } from 'react-router-dom';
  import styles from './Uom.module.css';
  import excelPng from '../../assets/Excel.png';

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
    const [showCelebration, setShowCelebration] = useState(false);
    const lottieContainerRef = useRef<HTMLDivElement | null>(null);
    const lottieInstanceRef = useRef<any>(null);
    const [dragActive, setDragActive] = useState(false);

    const processFile = async (f: File) => {
      if (!f) return;
      setProcessing(true);
      setMessage(null);
      setFailures([]);
      try {
        // validate extension first
        if (!/\.(xls|xlsx)$/i.test(f.name)) {
          setMessage('Se espera un archivo Excel para realizar la validacion');
          return;
        }

        const buf = await f.arrayBuffer();
        const res = await analyzeWorkbook(buf);
        setFailures(res);
        setMessage(`Procesado ${res.length} filas con fallo.`);
        if (res.length === 0) triggerCelebration();
      } catch (err: any) {
        // If analyzeWorkbook threw a user-friendly message it will be in err.message
        setMessage(String(err?.message ?? 'Error procesando el archivo'));
      } finally {
        setProcessing(false);
      }
    };

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

        // validate column count: expect exactly 14 columns in the file
        const header = rows[0] || [];
        const colCount = Array.isArray(header) ? header.length : 0;
        if (colCount !== 14) {
          // throw an error with a user-facing message so callers can display it
          throw new Error('Por favor verifique la disposicion del excel, se espera un excel con 14 columnas');
        }

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

  //   const handleFetchOrPick = async () => {
  //     setProcessing(true);
  //     setMessage(null);
  //     setFailures([]);
  //     try {
  //       // try to fetch from public/data/ywm005.xlsx (you can place the file in public/data)
  //       const url = '/data/ywm005.xlsx';
  //       const resp = await fetch(url);
  //       if (resp.ok) {
  //         const buf = await resp.arrayBuffer();
  //         const res = await analyzeWorkbook(buf);
  //         setFailures(res);
  //         setMessage(`Procesado ${res.length} filas con fallo.`);
  //         if (res.length === 0) triggerCelebration();
  //       } else {
  //         // fall back to file picker
  //         setMessage('Archivo no disponible en /data/ywm005.xlsx — por favor selecciona el archivo manualmente.');
  //         fileInputRef.current?.click();
  //       }
  //     } catch (err: any) {
  //       setMessage('Error leyendo el archivo: ' + String(err?.message ?? err));
  //     } finally {
  //       setProcessing(false);
  //     }
  //   };

    const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
      const f = e.target.files?.[0];
      if (!f) return;
      await processFile(f);
    };

    const handleDragOver = (e: React.DragEvent) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'copy';
      setDragActive(true);
    };
    const handleDragEnter = (e: React.DragEvent) => {
      e.preventDefault();
      setDragActive(true);
    };
    const handleDragLeave = (e: React.DragEvent) => {
      e.preventDefault();
      setDragActive(false);
    };
    const handleDrop = async (e: React.DragEvent) => {
      e.preventDefault();
      setDragActive(false);
      const f = e.dataTransfer.files?.[0];
      if (f) await processFile(f);
    };

    // celebration: confetti + spark overlay
    const triggerCelebration = async () => {
      try {
    setShowCelebration(true);
    // dynamic import to avoid adding dependency to initial bundle
    // @ts-ignore - canvas-confetti may not have types in this project
    const confettiModule = await import('canvas-confetti');
    const confetti = (confettiModule && (confettiModule.default || confettiModule)) as any;
        // center burst (bengala-like)
        confetti({
          particleCount: 200,
          startVelocity: 40,
          spread: 160,
          origin: { x: 0.5, y: 0.5 },
          ticks: 400,
        });
        // multiple small bursts
        confetti({ particleCount: 100, spread: 120, origin: { x: 0.3, y: 0.2 } });
        confetti({ particleCount: 100, spread: 120, origin: { x: 0.7, y: 0.2 } });

        // longer tail fireworks: fire several bursts over time
        for (let i = 0; i < 5; i++) {
          setTimeout(() => {
            confetti({ particleCount: 60, spread: 100, origin: { x: Math.random(), y: Math.random() * 0.5 } });
          }, 600 + i * 300);
        }

        // also load a Lottie animation in the overlay container (if present)
        try {
          // dynamic import lottie-web
          // @ts-ignore
          const lottie = (await import('lottie-web')).default;
          if (lottieContainerRef.current) {
            // prefer a local animation placed in public/animations/celebration.json
            const localPath = '/animations/celebration.json';
            let animPath = 'https://assets10.lottiefiles.com/packages/lf20_jbrw3hcz.json';
            try {
              // try fetch local file (no-cache) — if present, use it
              const head = await fetch(localPath, { cache: 'no-cache' });
              if (head && head.ok) animPath = localPath;
            } catch (e) {
              // ignore fetch errors and fallback to remote animPath
            }

            lottieInstanceRef.current = lottie.loadAnimation({
              container: lottieContainerRef.current,
              renderer: 'svg',
              loop: false,
              autoplay: true,
              path: animPath,
            });
          }
        } catch (err) {
          // ignore if lottie not available or loading fails
        }

        // hide celebration after 5 seconds
        setTimeout(() => setShowCelebration(false), 5000);
      } catch (err) {
        console.warn('Celebration failed:', err);
      }
    };

    // cleanup lottie instance when overlay hides or component unmounts
    React.useEffect(() => {
      if (!showCelebration) {
        if (lottieInstanceRef.current) {
          try { lottieInstanceRef.current.destroy(); } catch (e) {}
          lottieInstanceRef.current = null;
        }
      }
      return () => {
        if (lottieInstanceRef.current) {
          try { lottieInstanceRef.current.destroy(); } catch (e) {}
          lottieInstanceRef.current = null;
        }
      };
    }, [showCelebration]);

    return (
      <div>
        <h3>Analisis de UOM</h3>
    <p>Al hacer click se procesara el archivo <strong>ywm005.xlsx</strong> con la disposicion sap <code>/Z-TOSO-Z</code>. Si necesitas una guia para obtener el reporte de sap haz click <Link to="/GuiaYwm005">Aqui</Link></p>
        <div
          className={`${styles.dropZone} ${dragActive ? styles.dropZoneActive : ''}`}
          onDragOver={handleDragOver}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <div className={styles.dropContent}>
            <div className={styles.dropIcon} aria-hidden>
              <img src={excelPng} alt="Excel" className={styles.dropIconImg} />
            </div>
            <div className={styles.dropText}>
              <p>{dragActive ? 'Suelta el archivo aquí' : 'Arrastra y suelta el archivo Excel aquí'}</p>
              <span className={styles.dropHint}>(.xls, .xlsx)</span>
            </div>
          </div>
        </div>

        <div style={{ marginTop: 10 }}>
          <button className={styles.browseBtn} type="button" onClick={() => fileInputRef.current?.click()} disabled={processing}>
            {processing ? 'Procesando...' : 'Explorar archivo...'}
          </button>
          {/* <button
            className={styles.driveBtn}
            type="button"
            onClick={async () => {
              // Try the server proxy endpoint which avoids CORS by downloading and analyzing server-side.
              const sheetId = '1KSBPqM3fWzR0QyuMOpn8m4_K4TVRMbgN';
              const proxyUrl = `/api/proxy-export?sheetId=${encodeURIComponent(sheetId)}`;
              try {
                setProcessing(true);
                setMessage(null);
                setFailures([]);
                const resp = await fetch(proxyUrl, { cache: 'no-cache' });
                // If the backend isn't running, the dev server may return index.html (HTML) which is not JSON.
                const contentType = resp.headers.get('content-type') || '';
                if (!resp.ok) {
                  const text = await resp.text().catch(() => '');
                  throw new Error(`Error desde el servidor: ${resp.status} ${resp.statusText} ${text}`);
                }
                if (!contentType.includes('application/json')) {
                  // Read text to provide context (trim long HTML)
                  const text = await resp.text().catch(() => '');
                  const sample = text ? (text.length > 400 ? text.slice(0, 400) + '...' : text) : '<no body>';
                  throw new Error(`Respuesta inesperada (no JSON) del servidor. Parece que se devolvió HTML (por ejemplo index.html). Asegúrese de que el backend esté corriendo en el puerto correcto y que la ruta /api/proxy-export no esté siendo servida por el servidor de frontend. Contenido de respuesta: ${sample}`);
                }
                const body = await resp.json();
                if (body?.results) {
                  setFailures(body.results);
                  setMessage(`Procesado ${body.results.length} filas con fallo.`);
                  if (body.results.length === 0) triggerCelebration();
                } else {
                  throw new Error('Respuesta inesperada del servidor al procesar el archivo');
                }
              } catch (err: any) {
                // If server not available or fails, inform about CORS/public-sheet option
                setMessage(String(err?.message ?? 'Error descargando el archivo desde Drive. Si sigue fallando, haga público el sheet o configure el servidor para acceder a Drive.'));
              } finally {
                setProcessing(false);
              }
            }}
            disabled={processing}
          >
            {processing ? 'Procesando...' : 'abrir drive'}
          </button> */}
          <input ref={fileInputRef} type="file" accept=".xls,.xlsx" style={{ display: 'none' }} onChange={handleFile} />
        </div>

        {message && <p>{message}</p>}

        {showCelebration && (
          <div className={styles.celebrationOverlay}>
            <div ref={lottieContainerRef} style={{ width: 360, height: 360 }} aria-hidden />
          </div>
        )}

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