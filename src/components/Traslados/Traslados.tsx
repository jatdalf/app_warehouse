import { useRef, useState } from "react";
import * as XLSX from "xlsx";
import Lottie from "lottie-react";

import LogoOcasa from "../LogoOcasa/LogoOcasa";
import LectorPosicion from "../LectorPosicion/LectorPosicion";

import LogoExcel from "../../assets/Excel.png";
import checkOk from "../../assets/check-ok.json";
import arrow from "../../assets/arrow.json";

import styles from "./Traslados.module.css";

import ResumenTraslado from "../ResumenTraslado/ResumenTraslado";

/* =======================
   TIPOS Y CONSTANTES
======================= */

type ExcelSection = "MM" | "LX03" | "YWM005";

const SECTION_COLUMNS: Record<ExcelSection, number> = {
  MM: 4,
  LX03: 16,
  YWM005: 14,
};

const BASE_FILES: Record<ExcelSection, string> = {
  MM: "/data/MM.xlsx",
  LX03: "/data/lx03.xlsx",
  YWM005: "/data/ywm005.xlsx",
};

interface ExcelState {
  ok: boolean;
  error: string | null;
  created?: string;
  rows?: number;
  data?: any[];
}

const emptyState: ExcelState = {
  ok: false,
  error: null,
};

/* =======================
   COMPONENTE
======================= */

const Traslados: React.FC = () => {
  /* =======================
     REFS
  ======================= */
  const inputRefs = {
    MM: useRef<HTMLInputElement>(null),
    LX03: useRef<HTMLInputElement>(null),
    YWM005: useRef<HTMLInputElement>(null),
  };

  /* =======================
     ESTADOS EXCEL
  ======================= */
  const [mm, setMM] = useState<ExcelState>(emptyState);
  const [lx03, setLX03] = useState<ExcelState>(emptyState);
  const [ywm005, setYWM005] = useState<ExcelState>(emptyState);

  /* =======================
     FLUJO
  ======================= */
  const [step, setStep] = useState<"UPLOAD" | "TRASLADO">("UPLOAD");

  /* =======================
     DATOS TRASLADO
  ======================= */
  const [desdeData, setDesdeData] = useState<any | null>(null);
  const [haciaData, setHaciaData] = useState<any | null>(null);

  const desdeConfirmado = Boolean(desdeData);

  /* =======================
     HELPERS EXCEL
  ======================= */

  const setStateBySection = (sec: ExcelSection, state: ExcelState) => {
    if (sec === "MM") setMM(state);
    if (sec === "LX03") setLX03(state);
    if (sec === "YWM005") setYWM005(state);
  };

  const processExcel = async (
    file: File,
    section: ExcelSection
  ): Promise<ExcelState> => {
    if (!/\.(xls|xlsx)$/i.test(file.name)) {
      return { ok: false, error: "Se espera un archivo Excel" };
    }

    const buffer = await file.arrayBuffer();
    const wb = XLSX.read(buffer, { type: "array" });
    const sheet = wb.Sheets[wb.SheetNames[0]];

    const rows: any[][] = XLSX.utils.sheet_to_json(sheet, {
      header: 1,
      defval: "",
    });

    if (rows[0]?.length !== SECTION_COLUMNS[section]) {
      return {
        ok: false,
        error: `El excel debe tener ${SECTION_COLUMNS[section]} columnas`,
      };
    }

    return {
      ok: true,
      error: null,
      created: new Date(file.lastModified).toLocaleDateString(),
      rows: rows.length - 1,
      data: rows.slice(1),
    };
  };

  const handleFile = async (file: File, section: ExcelSection) => {
    const result = await processExcel(file, section);
    setStateBySection(section, result);
  };

  const handleBaseFile = async (section: ExcelSection) => {
    const resp = await fetch(BASE_FILES[section]);
    const blob = await resp.blob();
    const file = new File([blob], BASE_FILES[section]);
    handleFile(file, section);
  };

  /* =======================
     RENDER DROPZONE
  ======================= */

  const renderBox = (section: ExcelSection, state: ExcelState) => (
    <div className={styles.fileBox}>
      <h4>Excel {section}</h4>

      <div
        className={styles.dropZone}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          const file = e.dataTransfer.files?.[0];
          if (file) handleFile(file, section);
        }}
        onClick={() => inputRefs[section].current?.click()}
      >
        <div className={styles.dropContent}>
          {!state.ok ? (
            <>
              <img src={LogoExcel} className={styles.excelIcon} />
              <p>
                Arrastrá el Excel aquí <br />
                o hacé click para buscarlo
              </p>
            </>
          ) : (
            <>
              <strong>Archivo cargado</strong>
              <p>Creado: {state.created}</p>
              <p>Líneas: {state.rows}</p>
              <div className={styles.lottieOk}>
                <Lottie animationData={checkOk} loop={false} />
              </div>
            </>
          )}

          {state.error && (
            <p className={styles.errorInside}>{state.error}</p>
          )}
        </div>
      </div>

      <button
        className={styles.buttons}
        onClick={() => handleBaseFile(section)}
      >
        Usar archivo base
      </button>

      <input
        ref={inputRefs[section]}
        type="file"
        accept=".xls,.xlsx"
        hidden
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file, section);
        }}
      />
    </div>
  );

  /* =======================
     PASO TRASLADO
  ======================= */

  if (step === "TRASLADO") {
    return (
      <div className={styles.trxContainer}>
        <LectorPosicion
          tipo="DESDE"
          lx03Data={lx03.data ?? []}
          ywm005Data={ywm005.data ?? []}
          onSelect={(data) => {
            setDesdeData(data);
            setHaciaData(null); // 🔒 resetea HACIA si cambia DESDE
          }}
        />

        <div className={styles.arrow}>
          <Lottie animationData={arrow} loop />
        </div>

        <LectorPosicion
          tipo="HACIA"
          disabled={!desdeConfirmado}
          tipoAlmacenDesde={desdeData?.tipoAlmacen}
          lx03Data={lx03.data ?? []}
          ywm005Data={ywm005.data ?? []}
          onSelect={(data) => setHaciaData(data)}
        />
      </div>
      
    );
  }

  /* =======================
     PASO UPLOAD
  ======================= */

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2>Traslados</h2>
        <LogoOcasa />
      </div>

      <div className={styles.filesContainer}>
        {renderBox("MM", mm)}
        {renderBox("LX03", lx03)}
        {renderBox("YWM005", ywm005)}
      </div>

      <div className={styles.generateWrapper}>
        <button
          className={`${styles.buttons} ${
            mm.ok && lx03.ok && ywm005.ok
              ? styles.enabled
              : styles.disabled
          }`}
          disabled={!(mm.ok && lx03.ok && ywm005.ok)}
          onClick={() => setStep("TRASLADO")}
        >
          Generar traslado
        </button>
      </div>
    </div>
  );
};

export default Traslados;
