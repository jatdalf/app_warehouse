// src/components/Inventarios/InventariosGrid.tsx
import React from "react";
import { Pie } from "react-chartjs-2";
import styles from "./Inventarios.module.css";
import { useNavigate } from "react-router-dom";

interface InventariosGridProps {
  countPosiciones: number;
  countOk: number;
  countDiferencia: number;
  resumenInventarios: {
    cantidadPosiciones: number;
    inventariosOk: number;
    inventariosDiferencia: number;
  };
  pieInventarios: any;
  meses: string[];
  mesesSeleccionados: string[];
  setMesesSeleccionados: (meses: string[]) => void;
  registrosFiltrados: any[];
  ultimaFecha: string;
}

const InventariosGrid: React.FC<InventariosGridProps> = ({
  countPosiciones,
  countOk,
  countDiferencia,
  resumenInventarios,
  pieInventarios,
  meses,
  mesesSeleccionados,
  setMesesSeleccionados,
  registrosFiltrados,
  ultimaFecha,
}) => {
  const navigate = useNavigate();

  return (
    <div className={styles.layout}>
      <div className={styles.grid}>
        <p>
          Inventarios Realizados:{" "}
          <span className={styles.numero}>{countPosiciones}</span>
        </p>
        <p>
          Inventarios Ok:{" "}
          <span className={styles.numero}>
            {countOk} (
            {(
              (resumenInventarios.inventariosOk /
                resumenInventarios.cantidadPosiciones) *
              100
            ).toFixed(2)}
            %)
          </span>
        </p>
        <p>
          Inventarios con diferencia:{" "}
          <span className={styles.numero}>
            {countDiferencia} (
            {(
              (resumenInventarios.inventariosDiferencia /
                resumenInventarios.cantidadPosiciones) *
              100
            ).toFixed(2)}
            %)
          </span>
        </p>
      </div>

      <div style={{ display: "flex", alignItems: "center" }}>
        <div style={{ width: "250px", height: "250px" }}>
          <Pie data={pieInventarios} />
        </div>
        <div style={{ marginLeft: "20px" }}>
  <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
      {/* ✅ Fieldset con meses */}
      <fieldset className={styles.fieldsetMeses}>
        <legend className={styles.legendMeses}>Visualizar</legend>
    
<select
  multiple
  size={12}   // ✅ muestra todos los meses sin scroll
  className={styles.InventorySelect}
  value={mesesSeleccionados}
  onChange={(e) =>
    setMesesSeleccionados(
      Array.from(e.target.selectedOptions, (opt) => opt.value)
    )
  }
>
  {meses.map((mes) => (
    <option key={mes} value={mes}>
      {mes}
    </option>
  ))}
</select>

    </fieldset>
  </div>

   <div style={{ marginTop: "10px" }}>
        <button
          className={styles.InventoryDetailButton}
          onClick={() =>
            navigate("/InventoryDetail", { state: { registros: registrosFiltrados } })
          }
        >
          Ver detalles
        </button>
      </div>
</div>
      </div>

      <div className={styles.InventoryLabel}>
        ( Última actualización {ultimaFecha} )
      </div>
    </div>
  );
};

export default InventariosGrid;