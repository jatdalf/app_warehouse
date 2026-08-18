import React, { useEffect, useState } from "react";
import LogoOcasa from "../LogoOcasa/LogoOcasa";
import styles from "./Inventarios.module.css";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { useCountUp } from "../../components/Inventarios/hooks/useCountUp";
import { loadUbicaciones, getResumenInventarios, loadFeriados} from "../../services/excelService";
import UbicacionesGrid from "./UbicacionesGrid";
import InventariosGrid from "./InventariosGrid";


ChartJS.register(ArcElement, Tooltip, Legend);

const Inventario: React.FC = () => {
  const meses = [
    "Enero","Febrero","Marzo","Abril","Mayo","Junio",
    "Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"
  ];
  const [mesesSeleccionados, setMesesSeleccionados] = useState<string[]>([meses[new Date().getMonth()]]);

  // ✅ Estado inicial ahora incluye listaSinInventariar
  const [resumenUbicaciones, setResumenUbicaciones] = useState({
    cantidadUbicaciones: 0,
    posicionesInventariadas: 0,
    posicionesSinInventariar: 0,
    listaSinInventariar: [] as { tipoAlmacen: string; ubicacion: string }[],
  });

  const [resumenInventarios, setResumenInventarios] = useState({
    cantidadPosiciones: 0,
    inventariosDiferencia: 0,
    inventariosOk: 0,
  });
  const [registrosFiltrados, setRegistrosFiltrados] = useState<any[]>([]);
  const [ultimaFecha, setUltimaFecha] = useState<string>("");
  const [feriados, setFeriados] = useState<Date[]>([]);
  const [ubicacionesUnicas, setUbicacionesUnicas] = useState<{ tipoAlmacen: string; ubicacion: string }[]>([]);

  useEffect(() => {
    const fetchUbicaciones = async () => {
      const ubicaciones = await loadUbicaciones();
      setUbicacionesUnicas(ubicaciones);
      setResumenUbicaciones((prev) => ({
        ...prev,
        cantidadUbicaciones: ubicaciones.length,
      }));
    };
    fetchUbicaciones();
  }, []);

  useEffect(() => {
    const fetchInventarios = async () => {
      if (ubicacionesUnicas.length === 0) return;
      const { resumenInventarios, resumenUbicaciones } = await getResumenInventarios(
        mesesSeleccionados,
        ubicacionesUnicas
      );
      setResumenInventarios({
        cantidadPosiciones: resumenInventarios.cantidadPosiciones,
        inventariosDiferencia: resumenInventarios.inventariosDiferencia,
        inventariosOk: resumenInventarios.inventariosOk,
      });
      setRegistrosFiltrados(resumenInventarios.registrosFiltrados);
      setUltimaFecha(resumenInventarios.ultimaFecha);
      setResumenUbicaciones(resumenUbicaciones);
    };
    fetchInventarios();
  }, [mesesSeleccionados, ubicacionesUnicas]);
  useEffect(() => {
    const fetchFeriados = async () => {
      try {
        const data = await loadFeriados();
        setFeriados(data);
      } catch (error) {console.error("Error cargando feriados:", error);}
    };
    void fetchFeriados();
  }, []);
    const countUbicaciones = useCountUp(resumenUbicaciones.cantidadUbicaciones);
  const countInventariadas = useCountUp(resumenUbicaciones.posicionesInventariadas);
  const countSinInventariar = useCountUp(resumenUbicaciones.posicionesSinInventariar);

  const countPosiciones = useCountUp(resumenInventarios.cantidadPosiciones);
  const countDiferencia = useCountUp(resumenInventarios.inventariosDiferencia);
  const countOk = useCountUp(resumenInventarios.inventariosOk);

  const pieUbicaciones = {
    labels: ["Con inventario", "Sin inventariar"],
    datasets: [
      {
        data: [resumenUbicaciones.posicionesInventariadas, resumenUbicaciones.posicionesSinInventariar,],
        backgroundColor: ["rgb(35, 200, 183)", "rgb(241, 232, 132)"],
        borderColor: ["#fff", "#fff"],
        borderWidth: 2,
      },
    ],
  };

  const pieInventarios = {
    labels: ["Ok", "Con diferencia"],
    datasets: [
      {
        data: [resumenInventarios.inventariosOk, resumenInventarios.inventariosDiferencia,],
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

      <UbicacionesGrid
        countUbicaciones={countUbicaciones}
        countInventariadas={countInventariadas}
        countSinInventariar={countSinInventariar}
        pieUbicaciones={pieUbicaciones}
        ubicacionesSinInventariar={resumenUbicaciones.listaSinInventariar}
      />

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
        feriados={feriados}
      />
    </div>
  );
};

export default Inventario;
