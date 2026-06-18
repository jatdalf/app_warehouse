import { useRef } from "react";
import Lottie from "lottie-react";
import * as XLSX from "xlsx";

import LogoExcel from "../../assets/Excel.png";
import checkOk from "../../assets/check-ok.json";

import styles from "./ExcelDropZone.module.css";

export interface ExcelState {
  ok: boolean;
  error: string | null;
  created?: string;
  rows?: number;
  data?: any[];
}

interface Props {
  title: string;
  expectedColumns: number;
  baseFile: string;
  value: ExcelState;
  onChange: (state: ExcelState) => void;
}

const ExcelDropZone: React.FC<Props> = ({
  title,
  expectedColumns,
  baseFile,
  value,
  onChange,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const processExcel = async (file: File): Promise<ExcelState> => {
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

    if (rows[0]?.length !== expectedColumns) {
      return {
        ok: false,
        error: `El excel debe tener ${expectedColumns} columnas`,
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

  const handleFile = async (file: File) => {
    const result = await processExcel(file);
    onChange(result);
  };

  const handleBaseFile = async () => {
    const resp = await fetch(baseFile);
    const blob = await resp.blob();
    const file = new File([blob], baseFile);
    handleFile(file);
  };

  return (
    <div className={styles.fileBox}>
      <h4>{title}</h4>

      <div
        className={styles.dropZone}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          const file = e.dataTransfer.files?.[0];
          if (file) handleFile(file);
        }}
        onClick={() => inputRef.current?.click()}
      >
        <div className={styles.dropContent}>
          {!value.ok ? (
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
              <p>Creado: {value.created}</p>
              <p>Líneas: {value.rows}</p>
              <div className={styles.lottieOk}>
                <Lottie animationData={checkOk} loop={false} />
              </div>
            </>
          )}

          {value.error && (
            <p className={styles.errorInside}>{value.error}</p>
          )}
        </div>
      </div>

      <button className={styles.button} onClick={handleBaseFile}>
        Usar archivo base
      </button>

      <input
        ref={inputRef}
        type="file"
        accept=".xls,.xlsx"
        hidden
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
        }}
      />
    </div>
  );
};

export default ExcelDropZone;
