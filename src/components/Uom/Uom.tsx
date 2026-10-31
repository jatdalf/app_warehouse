  import React, { useRef, useState } from 'react';
  import { Link } from 'react-router-dom';
  import styles from './Uom.module.css';
  import excelPng from '../../assets/Excel.png';

  type FailureRow = {
    rowIndex: number;
    loteSap: string | number;
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

const analyzeWorkbook = async (
  arrayBuffer: ArrayBuffer
): Promise<FailureRow[]> => {
  const XLSX = await import("xlsx");
  const wb = XLSX.read(arrayBuffer, { type: "array" });

  const sheetName = wb.SheetNames[0];

  if (!sheetName) {
    throw new Error("El archivo Excel no contiene hojas.");
  }

  const rows = XLSX.utils.sheet_to_json<unknown[]>(
    wb.Sheets[sheetName],
    { header: 1, defval: "" }
  );

  // Ignora mayúsculas, acentos, espacios y signos.
  // Por ejemplo: "MAT.CLIENTE" y "Mat. Cliente" coinciden.
  const normalizar = (value: unknown): string =>
    String(value ?? "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, "");

  const requeridas = [
    "MAT. CLIENTE",
    "LOTE",
    "DESCRIPCIÓN MATERIAL",
    "STOCK",
    "UOM",
  ] as const;

  // Localiza los encabezados, aunque haya filas de título arriba.
  const candidatas = rows.map((row, index) => {
    const encabezados = row.map(normalizar);

    return {
      index,
      encabezados,
      coincidencias: requeridas.filter(nombre =>
        encabezados.includes(normalizar(nombre))
      ).length,
    };
  });

  const cabecera = candidatas.reduce<
    (typeof candidatas)[number] | undefined
  >(
    (mejor, actual) =>
      !mejor || actual.coincidencias > mejor.coincidencias
        ? actual
        : mejor,
    undefined
  );

  if (!cabecera || cabecera.coincidencias === 0) {
    throw new Error(
      `Verificar disposición de archivo. No se encontraron los ` +
      `encabezados necesarios: ${requeridas.join(", ")}.`
    );
  }

  const faltantes = requeridas.filter(nombre =>
    !cabecera.encabezados.includes(normalizar(nombre))
  );

  if (faltantes.length > 0) {
    throw new Error(
      `Verificar disposición de archivo. ` +
      `${faltantes.length === 1 ? "Falta columna" : "Faltan columnas"}: ` +
      `${faltantes.join(", ")}.`
    );
  }

  const duplicadas = requeridas.filter(nombre => nombre !== "MAT. CLIENTE" &&
    cabecera.encabezados.filter(encabezado => encabezado === normalizar(nombre)).length > 1
  );

  if (duplicadas.length > 0) {
    throw new Error(
      `Verificar disposición de archivo. ` +
      `Encabezados repetidos: ${duplicadas.join(", ")}.`
    );
  }

  const columna = (nombre: string): number =>
    cabecera.encabezados.indexOf(normalizar(nombre));

  const columnas = {
    material: columna("MAT. CLIENTE"),
    lote: columna("LOTE"),
    descripcion: columna("DESCRIPCIÓN MATERIAL"),
    stock: columna("STOCK"),
    uom: columna("UOM"),
  };

  const normalizarMaterial = (value: unknown): string => String(value ?? "").trim().replace(/^0+(?=\d)/, "");
  const results: FailureRow[] = [];

  for (let i = cabecera.index + 1; i < rows.length; i++) {
    const row = rows[i];
    const stockCell = row[columnas.stock];
    const stockParsed = parseNumber(stockCell);
    const uom = parseNumber(row[columnas.uom]);

    // Conserva el comportamiento actual para datos incompletos.
    if (stockParsed === null || uom === null || uom === 0) {
      continue;
    }

    const division = stockParsed / uom;
    const isInteger =
      Math.abs(division - Math.round(division)) < 1e-9;

    if (!isInteger) {
      results.push({
        rowIndex: i + 1,
        loteSap: String(row[columnas.lote] ?? ""),
        matCliente: normalizarMaterial(row[columnas.material]),
        descripcion: String(row[columnas.descripcion] ?? ""),
        stockOriginal: stockCell,
        stockParsed,
        uom,
        division,
      });
    }
  }

  return results;
};

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
                    <th>Lote SAP</th>
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
                      <td data-label="Lote SAP"><span>{String(r.loteSap ?? '')}</span></td>
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