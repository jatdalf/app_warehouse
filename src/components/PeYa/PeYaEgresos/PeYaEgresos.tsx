import React, { useState, useMemo } from "react";
import styles from "../PeYaEgresos/PeyaEgresos.module.css"
import LogoOcasa from "../../LogoOcasa/LogoOcasa";
import LogoPeYa from "../../LogoPeYa/LogoPeya";
import { DataGrid } from "@mui/x-data-grid";
import type { GridColDef } from "@mui/x-data-grid";
import { useNavigate } from "react-router-dom";
import {obtenerRemitos} from "../../../../src/services/remitos";
import LoadingOverlay from "../../LoadingOverlay/LoadingOverlay";


const columns: GridColDef[] = [
  { field: "storeName", headerName: "Store Name Único", width: 150, sortable: false },
  { field: "st", headerName: "ST", width: 90, sortable: false },
  { field: "sku", headerName: "SKU", width: 90, sortable: false },
  { field: "ean", headerName: "EAN", width: 90, sortable: false },
  { field: "title", headerName: "Title", width: 300, sortable: false },
  { field: "uxb", headerName: "UxB", width: 30, sortable: false },
  { field: "bultos", headerName: "Bultos", width: 60, sortable: false },
  { field: "unidades", headerName: "Unidades", width: 80, sortable: false },
];

const PeYaEgresos: React.FC = () => {
  const [rows, setRows] = useState<any[]>([]);
  const navigate = useNavigate();
  const regexST = /^ST[A-Z0-9]\d+$/;

  const handlePaste = (event: React.ClipboardEvent<HTMLDivElement>) => {
    event.preventDefault();
    const text = event.clipboardData.getData("text/plain");
    const lines = text.split("\n").filter((line) => line.trim() !== "");
    const newRows = lines.map((line, index) => {
      const cells = line.split("\t");
      return {
        id: rows.length + index + 1,
        storeName: cells[0] || "",
        st: cells[1] || "",
        sku: cells[2] || "",
        ean: cells[3] || "",
        title: cells[4] || "",
        uxb: cells[5] || "",
        bultos: cells[6] || "",
        unidades: cells[7] || "",
      };
    });
    setRows([...rows, ...newRows]);
  };
  
  // ✅ Cálculos de métricas
  const metrics = useMemo(() => {
    const stValues = rows.map((r) => r.st).filter((st) => st && regexST.test(st));
    const pedidos = new Set(stValues).size;

    const lineas = rows.filter(
      (r) => r.storeName.startsWith("AR") && regexST.test(r.st)
    ).length;

    const skuValues = rows.map((r) => r.sku).filter((sku) => sku && sku !== "SKU");
    const skus = new Set(skuValues).size;

    const bultos = rows.reduce((acc, r) => {
      if (
        r.storeName &&
        !r.storeName.toLowerCase().startsWith("total") &&
        r.bultos &&
        !isNaN(Number(r.bultos))
      ) {
        return acc + Number(r.bultos);
      }
      return acc;
    }, 0);
    return { pedidos, lineas, skus, bultos };
  }, [rows]);

  const handleGeneratePicking = () => {
    navigate("/PeYaPicking", { state: { data: rows } });
  };
  
  const [loading,setLoading]=useState(false);

const handleGenerateRemito=async()=>{
    try{
        setLoading(true);
        const stsUnicos=[
            ...new Set(
                rows
                    .map(r=>r.st)
                    .filter((st:string)=>regexST.test(st))
            )
        ];
        const remitos=await obtenerRemitos(
            stsUnicos,
            "Jorge"
        );
        navigate("/PeYaRemito",{
            state:{data:rows, remitos}
        });
    }catch(err){
        console.error(err);
        alert("No fue posible obtener los números de remito.");
    }finally{
        setLoading(false);
    }
  };

const handleGenerateSalida = () => {
  navigate("/PeYaSalida", { state: { data: rows } });
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

      {/* Fieldset con DataGrid */}
      <div className={styles.fieldsetContainerSmall}>
        <fieldset className={styles.fieldsetPeya}>
          <legend>Pegue los datos del pedido aquí</legend>

          {/* Métricas arriba del grid */}
          <div className={styles.metricsBox}>
            <div className={styles.metricItem}>
              Cantidad de pedidos: <strong>{metrics.pedidos}</strong>
            </div>
            <div className={styles.metricItem}>
              Cantidad de líneas: <strong>{metrics.lineas}</strong>
            </div>
            <div className={styles.metricItem}>
              Cantidad de SKU: <strong>{metrics.skus}</strong>
            </div>
            <div className={styles.metricItem}>
              Cantidad de bultos: <strong>{metrics.bultos}</strong>
            </div>
          </div>

          <div
            className={styles.gridWrapper}
            tabIndex={0}
            onPaste={handlePaste}
          >

<DataGrid
  rows={rows}
  columns={columns}
  disableColumnMenu
  disableRowSelectionOnClick
  hideFooter           // ✅ quita el footer de paginación
  sx={{
    "& .MuiDataGrid-row:nth-of-type(odd)": {
      backgroundColor: "#ffffff",
    },
    "& .MuiDataGrid-row:nth-of-type(even)": {
      backgroundColor: "#e6f7ff",
    },
  }}
/>


          </div>
        </fieldset>
      </div>

      {/* Botones de acciones */}
      <div className={styles.actionsBox}>
        <button className={styles.actionButton} onClick={handleGeneratePicking}>
          Generar Picking
        </button>
        
      <button
          className={styles.actionButton}
          onClick={handleGenerateRemito}
          disabled={loading}
      >
          {loading?"Generando Remitos...":"Generar Remito"}
      </button>

      <LoadingOverlay
          open={loading}
          title="Preparando Remitos"
          message="Consultando la numeración disponible..."
      />
       
        <button className={styles.actionButton} onClick={handleGenerateSalida}>
          Generar Salida Infor
        </button>
      </div>

      <LoadingOverlay
          open={loading}
          title="Preparando Remitos"
          message="Consultando la numeración disponible..."
      />

    </div>
  );
};

export default PeYaEgresos;
