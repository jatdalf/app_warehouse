import { useState } from "react";
import Lottie from "lottie-react";

import { useTraslados } from "./useTraslados";

import LogoOcasa from "../LogoOcasa/LogoOcasa";
import LectorPosicion from "../LectorPosicion/LectorPosicion";
import ResumenTraslado from "../ResumenTraslado/ResumenTraslado";
import UploadExcels from "../UploadExcels/UploadExcels";
import type { ExcelSection } from "../UploadExcels/UploadExcels";

import type { ExcelState } from "../ExcelDropZone/ExcelDropZone";

import arrow from "../../assets/arrow.json";
import styles from "./Traslados.module.css";

/* =======================
   COMPONENTE
======================= */
const Traslados: React.FC = () => {
  /* =======================
     ESTADOS EXCEL
  ======================= */
  const [mm, setMM] = useState<ExcelState>({ ok: false, error: null });
  const [lx03, setLX03] = useState<ExcelState>({ ok: false, error: null });
  const [ywm005, setYWM005] = useState<ExcelState>({ ok: false, error: null });

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

  const { agregarTraslado } = useTraslados();

  /* =======================
     HANDLERS
  ======================= */
  const handleExcelChange = (section: ExcelSection, state: ExcelState) => {
    if (section === "MM") setMM(state);
    if (section === "LX03") setLX03(state);
    if (section === "YWM005") setYWM005(state);
  };

  const handleAgregarTraslado = () => {
    if (!desdeData || !haciaData) return;

    agregarTraslado({
      origen: desdeData.ubicacion,
      articulo: desdeData.descripcion,
      loteProveedor: desdeData.loteProveedor,
      cantidad: desdeData.cantidad,
      codigoSap: desdeData.material,
      loteSap: desdeData.lote,
      destino: haciaData.ubicacion,
    });

    setDesdeData(null);
    setHaciaData(null);
  };

  /* =======================
     PASO TRASLADO
  ======================= */
  if (step === "TRASLADO") {
    return (
      <div className={styles.container}>
        <div className={styles.trxContainer}>
          <LectorPosicion
            tipo="DESDE"
            lx03Data={lx03.data ?? []}
            ywm005Data={ywm005.data ?? []}
            onSelect={(data) => {
              setDesdeData(data);
              setHaciaData(null);
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

        {desdeData && haciaData && (
          <ResumenTraslado
            origen={desdeData.ubicacion}
            articulo={desdeData.descripcion}
            loteProveedor={desdeData.loteProveedor}
            cantidad={desdeData.cantidad}
            codigoSap={desdeData.material}
            loteSap={desdeData.lote}
            destino={haciaData.ubicacion}
            onAgregar={handleAgregarTraslado}
          />
        )}
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

      <UploadExcels
        mm={mm}
        lx03={lx03}
        ywm005={ywm005}
        onChange={handleExcelChange}
      />

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
