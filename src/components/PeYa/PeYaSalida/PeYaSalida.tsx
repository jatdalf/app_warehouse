    import React from "react";
    import { useLocation } from "react-router-dom";
    import * as XLSX from "xlsx";
    import { saveAs } from "file-saver";
    import styles from "../PeYaSalida/PeYaSalida.module.css";
    import LogoOcasa from "../../LogoOcasa/LogoOcasa";
    import LogoPeYa from "../../LogoPeYa/LogoPeya";

    const PeYaSalida: React.FC = () => {
    const location = useLocation();
    const data = (location.state as { data: any[] })?.data || [];

const handleGenerateExcel = async () => {
  // 1. Leer el archivo base desde public/data
  const response = await fetch("/data/Infor00000.xlsx");
  const arrayBuffer = await response.arrayBuffer();
  const wb = XLSX.read(arrayBuffer, { type: "array" });

  // 2. Obtener referencias a las hojas existentes
  const wsData = wb.Sheets["Data"];
  const wsDetail = wb.Sheets["Detail"];

  // 3. ST únicos
  const stValues = Array.from(new Set(data.map(r => r.st).filter(st => /^ST\d+/.test(st))));

  // 4. Completar hoja Data desde fila 3 en adelante
  stValues.forEach((st, idx) => {
    const destino = data.find(r => r.st === st)?.storeName || "";
    const row = idx + 3; // fila 3 en adelante
    wsData[`C${row}`] = { t: "s", v: st };             // ORDERKEY
    wsData[`D${row}`] = { t: "s", v: "0102003550" };   // STORERKEY
    wsData[`E${row}`] = { t: "s", v: st };             // EXTERNORDERKEY
    wsData[`F${row}`] = { t: "s", v: "0" };            // TYPE
    wsData[`G${row}`] = { t: "s", v: "0" };            // ENABLEPACKING
    wsData[`H${row}`] = { t: "s", v: destino };        // EXT_UDF_STR1
  });

  // 5. Completar hoja Detail desde fila 3 en adelante (solo filas válidas)
  let detailRow = 3;
  data.forEach(r => {
    if (r.st && /^ST\d+/.test(r.st) && r.sku) {
      wsDetail[`C${detailRow}`] = { t: "s", v: r.st };             // ORDERKEY
      wsDetail[`D${detailRow}`] = { t: "s", v: r.sku };            // SKU
      wsDetail[`E${detailRow}`] = { t: "s", v: "0102003550" };     // STORERKEY
      wsDetail[`F${detailRow}`] = { t: "s", v: r.st };             // EXTERNORDERKEY
      wsDetail[`G${detailRow}`] = { t: "n", v: Number(r.bultos) }; // OPENQTY
      wsDetail[`H${detailRow}`] = { t: "s", v: r.storeName };      // EXT_UDF_STR1
      detailRow++;
    }
  });

  // 6. Exportar el archivo modificado (mantiene formatos y comentarios)
  const wbout = XLSX.write(wb, { bookType: "xlsx", type: "array", cellStyles: true });
  saveAs(new Blob([wbout], { type: "application/octet-stream" }), "Infor00000.xlsx");
};


    return (
        <div className={styles.container}>
        {/* Header con logos */}
        <div className={styles.header}>
            <div className={styles.logoLeft}>
            <LogoPeYa />
            </div>
            <div className={styles.logoRight}>
            <LogoOcasa />
            </div>
        </div>

        <h2 className={styles.title}>Generar Salida Infor</h2>
        <p className={styles.info}>
            Se procesarán <strong>{data.length}</strong> filas y se completará el archivo <strong>Infor00000.xlsx</strong> desde la fila 3 en adelante.
        </p>

        <div className={styles.actionsBox}>
            <button className={styles.actionButton} onClick={handleGenerateExcel}>
            Completar y Guardar Excel
            </button>
        </div>
        </div>
    );
    };

    export default PeYaSalida;
