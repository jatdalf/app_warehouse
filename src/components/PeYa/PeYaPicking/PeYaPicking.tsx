import React, { useState, useMemo } from "react";
import styles from "../PeYaPicking/PeYaPicking.module.css"
import LogoOcasa from "../../LogoOcasa/LogoOcasa";
import LogoPeYa from "../../LogoPeYa/LogoPeya";
import { DataGrid } from "@mui/x-data-grid";
import type { GridColDef } from "@mui/x-data-grid";
import { useLocation, useNavigate } from "react-router-dom"; // ✅ importar useNavigate

const columns: GridColDef[] = [
  { field: "sku", headerName: "SKU", width: 90, sortable: false },
  {
    field: "skuBarcode",
    headerName: "SKU Barcode",
    width: 170,
    sortable: false,
    renderCell: (params) => (
      <span className={styles.barcodeFont}>{params.value}</span>
    ),
  },
  { field: "ean", headerName: "EAN", width: 124, sortable: false },
  {
    field: "title",
    headerName: "Title",
    width: 250,
    sortable: false,
    renderCell: (params) => (
      <div className={styles.pikingGridColumn}>
        {params.value}
      </div>
    ),
  },
  { field: "bultos", headerName: "Bultos", width: 80, sortable: false },
];

const PeYaPicking: React.FC = () => {
  const regexST = /^ST[A-Z0-9]\d+$/;
  const location = useLocation();
  const navigate = useNavigate(); // ✅ hook para navegar
  const data = (location.state as { data: any[] })?.data || [];
  const groupedByST = useMemo(() => {
    const groups: Record<string, any[]> = {};
    data.forEach((row) => {
      if (row.st && regexST.test(row.st)) {
        if (!groups[row.st]) groups[row.st] = [];
        groups[row.st].push(row);
      }
    });
    return groups;
  }, [data]);

  const stKeys = Object.keys(groupedByST);
  const [currentIndex, setCurrentIndex] = useState(0);
  const currentST = stKeys[currentIndex];
  const currentRows = groupedByST[currentST] || [];
  const rows = currentRows.map((r, idx) => ({
    id: idx + 1,
    sku: r.sku,
    skuBarcode: `*${r.sku}*`, // ✅ formato Code 39
    ean: r.ean,
    title: r.title,
    bultos: r.bultos,
  }));

  const destino = currentRows.length > 0 ? currentRows[0].storeName : "";
  const handleNext = () => {
    if (currentIndex < stKeys.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      alert("No hay más ST disponibles.");
    }
  };
    const handlePrintRemito = () => {
    navigate("/PeYaRemito", { state: { data: currentRows } });
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

      {/* Encabezado */}
      <div className={styles.pickingHeader}>
        <h2>Picking</h2>
        {currentST ? (
          <div className={styles.stDetailInline}>
            <span>Pedido: <strong>{currentST}</strong></span>
            <span>Destino: <strong>{destino}</strong></span>
            <span><em>({currentIndex + 1} de {stKeys.length})</em></span>
          </div>
        ) : (
          <p>No hay datos disponibles</p>
        )}
      </div>

      {/* DataGrid */}
      <div className={styles.gridWrapperPicking}>
        <DataGrid
          rows={rows}
          columns={columns}
          disableColumnMenu
          disableRowSelectionOnClick
          autoHeight
          columnHeaderHeight={40}
          hideFooter
          sx={{
            "& .MuiDataGrid-row:nth-of-type(odd)": {
              backgroundColor: "#ffffff",
            },
            "& .MuiDataGrid-row:nth-of-type(even)": {
              backgroundColor: "#e6f7ff",
            },
            "& .MuiDataGrid-columnHeaders": {
              backgroundColor: "#2b8179",
              color: "#000000",
              fontWeight: "bold",
            },
            "& .MuiDataGrid-virtualScroller": {
              overflowX: "hidden !important", // ✅ oculta scroll horizontal
            },
          }}
        />
      </div>

      {/* Botones de navegación */}
      <div className={styles.actionsBox}>
        <button
          className={styles.actionButton}
          onClick={() => {
            if (currentIndex > 0) {
              setCurrentIndex(currentIndex - 1);
            } else {
              alert("Ya estás en el primer ST.");
            }
          }}
        >
          ⇐ Anterior
        </button>

        <button className={styles.actionButton} onClick={handleNext}>
          Siguiente ⇒
        </button>

        <button className={styles.actionButton} onClick={handlePrintRemito}>
          Imprimir Remito
        </button>

      </div>
    </div>
  );
};

export default PeYaPicking;

