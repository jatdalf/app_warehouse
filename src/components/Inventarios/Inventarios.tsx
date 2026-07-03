import React, { useEffect, useState } from "react";
import LogoOcasa from "../LogoOcasa/LogoOcasa";
import styles from "./Inventarios.module.css";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { useCountUp } from "../../components/Inventarios/hooks/useCountUp";
import { getResumenUbicaciones, getResumenInventarios } from "../../services/excelService";
import UbicacionesGrid from "./UbicacionesGrid";
import InventariosGrid from "./InventariosGrid";

ChartJS.register(ArcElement, Tooltip, Legend);

const Inventario: React.FC = () => {
  
const meses = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
];
  const [mesesSeleccionados, setMesesSeleccionados] = useState<string[]>(["Enero"]);

  const [resumenUbicaciones, setResumenUbicaciones] = useState({
    cantidadUbicaciones: 0,
    ubicacionesPallet: 0,
    ubicacionesEstanteria: 0,
  });

  const [resumenInventarios, setResumenInventarios] = useState({
    cantidadPosiciones: 0,
    inventariosDiferencia: 0,
    inventariosOk: 0,
  });

  const [registrosFiltrados, setRegistrosFiltrados] = useState<any[]>([]);
  const [ultimaFecha, setUltimaFecha] = useState<string>("");

  // ✅ Cargar resumen de ubicaciones
  useEffect(() => {
    const fetchUbicaciones = async () => {
      const resumen = await getResumenUbicaciones();
      setResumenUbicaciones(resumen);
    };
    fetchUbicaciones();
  }, []);

  // ✅ Cargar resumen de inventarios
useEffect(() => {
  const fetchInventarios = async () => {
    const resumen = await getResumenInventarios(mesesSeleccionados, meses);
    setResumenInventarios({
      cantidadPosiciones: resumen.cantidadPosiciones,
      inventariosDiferencia: resumen.inventariosDiferencia,
      inventariosOk: resumen.inventariosOk,
    });
    setRegistrosFiltrados(resumen.registrosFiltrados);
    setUltimaFecha(resumen.ultimaFecha);
  };
  fetchInventarios();
}, [mesesSeleccionados]);

  // ✅ Animaciones
  const countUbicaciones = useCountUp(resumenUbicaciones.cantidadUbicaciones);
  const countPallet = useCountUp(resumenUbicaciones.ubicacionesPallet);
  const countEstanteria = useCountUp(resumenUbicaciones.ubicacionesEstanteria);

  const countPosiciones = useCountUp(resumenInventarios.cantidadPosiciones);
  const countDiferencia = useCountUp(resumenInventarios.inventariosDiferencia);
  const countOk = useCountUp(resumenInventarios.inventariosOk);

  // ✅ Datos para los gráficos
  const pieUbicaciones = {
    labels: ["Pallet (P)", "Estantería (E)"],
    datasets: [
      {
        data: [
          resumenUbicaciones.ubicacionesPallet,
          resumenUbicaciones.ubicacionesEstanteria,
        ],
        backgroundColor: ["#2b8179ff", "#87e2e7ff"],
        borderColor: ["#fff", "#fff"],
        borderWidth: 2,
      },
    ],
  };

  const pieInventarios = {
    labels: ["Ok", "Con diferencia"],
    datasets: [
      {
        data: [
          resumenInventarios.inventariosOk,
          resumenInventarios.inventariosDiferencia,
        ],
        backgroundColor: ["#28a745", "#dc3545"],
        borderColor: ["#fff", "#fff"],
        borderWidth: 2,
      },
    ],
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2>Reporte de Inventarios</h2>
        <LogoOcasa />
      </div>

      {/* Grilla Ubicaciones modularizada */}
      <UbicacionesGrid
        countUbicaciones={countUbicaciones}
        countPallet={countPallet}
        countEstanteria={countEstanteria}
        pieUbicaciones={pieUbicaciones}
      />

      {/* Grilla Inventarios modularizada */}
      <InventariosGrid
        countPosiciones={countPosiciones}
        countOk={countOk}
        countDiferencia={countDiferencia}
        resumenInventarios={resumenInventarios}
        pieInventarios={pieInventarios}
        meses={meses}
        mesesSeleccionados={mesesSeleccionados}
        setMesesSeleccionados={setMesesSeleccionados}
        registrosFiltrados={registrosFiltrados}
        ultimaFecha={ultimaFecha}
      />
    </div>
  );
};

export default Inventario;
