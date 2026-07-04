// src/components/Inventarios/UbicacionesGrid.tsx
import React from "react";
import { Pie } from "react-chartjs-2";
import styles from "./Inventarios.module.css";

interface UbicacionesGridProps {
  countUbicaciones: number;
  countInventariadas: number;
  countSinInventariar: number;
  pieUbicaciones: any;
}

const UbicacionesGrid: React.FC<UbicacionesGridProps> = ({
  countUbicaciones,
  countInventariadas,
  countSinInventariar,
  pieUbicaciones,
}) => {
  // ✅ Opciones con tooltip personalizado
  const optionsPieUbicaciones = {
    plugins: {
      tooltip: {
        callbacks: {
          label: function (context: any) {
            const dataset = context.dataset;
            const total = dataset.data.reduce(
              (acc: number, val: number) => acc + val,
              0
            );
            const value = dataset.data[context.dataIndex];
            const percentage = ((value / total) * 100).toFixed(2);
            return `${context.label}: ${value} (${percentage}%)`;
          },
        },
      },
    },
  };

  return (
    <div className={styles.layout}>
      <div className={styles.grid}>
        <p>
          Cantidad de ubicaciones:{" "}
          <span className={styles.numero}>{countUbicaciones}</span>
        </p>
        <p>
          Posiciones inventariadas:{" "}
          <span className={styles.numero}>{countInventariadas}</span>
        </p>
        <p>
          Posiciones sin inventariar:{" "}
          <span className={styles.numero}>{countSinInventariar}</span>
        </p>
      </div>

      <div style={{ width: "250px", height: "250px" }}>
        <Pie data={pieUbicaciones} options={optionsPieUbicaciones} />
      </div>
    </div>
  );
};

export default UbicacionesGrid;
