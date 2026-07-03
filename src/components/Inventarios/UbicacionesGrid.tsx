// src/components/Inventarios/UbicacionesGrid.tsx
import React from "react";
import { Pie } from "react-chartjs-2";
import styles from "./Inventarios.module.css";

interface UbicacionesGridProps {
  countUbicaciones: number;
  countPallet: number;
  countEstanteria: number;
  pieUbicaciones: any;
}

const UbicacionesGrid: React.FC<UbicacionesGridProps> = ({
  countUbicaciones,
  countPallet,
  countEstanteria,
  pieUbicaciones,
}) => {
  return (
    <div className={styles.layout}>
      <div className={styles.grid}>
        <p>
          Cantidad de ubicaciones:{" "}
          <span className={styles.numero}>{countUbicaciones}</span>
        </p>
        <p>
          Ubicaciones de Pallet:{" "}
          <span className={styles.numero}>{countPallet}</span>
        </p>
        <p>
          Ubicaciones Estanteria:{" "}
          <span className={styles.numero}>{countEstanteria}</span>
        </p>
      </div>
      <div style={{ width: "250px", height: "250px" }}>
        <Pie data={pieUbicaciones} />
      </div>
    </div>
  );
};

export default UbicacionesGrid;