import React, { useEffect, useState } from "react";
import * as XLSX from "xlsx";
import LogoOcasa from "../LogoOcasa/LogoOcasa";
import styles from "./Inventarios.module.css";
import { Pie } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
ChartJS.register(ArcElement, Tooltip, Legend);

// Primer Excel: ubicaciones.xlsx
interface RegistroUbicacion {
  tipoAlmacen: string;
  ubicacion: string;
  tipoUbicacion: string;
  material: string;
}

// Segundo Excel: Ylx22.xlsx
interface RegistroInventario {
  fecha: string | number;
  almacen: string;
  ubicacion: string;
  material: string;
  nombre: string;
  totalTeorico: number;
  contado: number;
  resultado: number;
}

const useCountUp = (end: number, duration: number = 2500) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let start = 0;
    const increment = Math.ceil(end / (duration / 16)); // 16ms ≈ 60fps
    const timer = setInterval(() => {
      start += increment;
      if (start >= end) {
        setCount(end);
        clearInterval(timer);
      } else {
        setCount(start);
      }
    }, 16);
    return () => clearInterval(timer);
  }, [end, duration]);

  return count;
};

const Inventario: React.FC = () => {
  // Estado para ubicaciones.xlsx
  const [resumenUbicaciones, setResumenUbicaciones] = useState({
    cantidadUbicaciones: 0,
    ubicacionesPallet: 0,
    ubicacionesEstanteria: 0,
  });

  // Estado para Ylx22.xlsx
  const [resumenInventarios, setResumenInventarios] = useState({
    cantidadPosiciones: 0,
    inventariosDiferencia: 0,
    inventariosOk: 0,
  });

  const [ultimaFecha, setUltimaFecha] = useState<string>("");

  // Filtro de meses
  const meses = [
    "Año 2026",
    "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
    "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
  ];
  const [mesSeleccionado, setMesSeleccionado] = useState("Año 2026");

  // Cargar ubicaciones.xlsx
  useEffect(() => {
    const fetchExcelUbicaciones = async () => {
      const response = await fetch("/data/ubicaciones.xlsx");
      const arrayBuffer = await response.arrayBuffer();
      const workbook = XLSX.read(arrayBuffer, { type: "array" });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData: any[] = XLSX.utils.sheet_to_json(sheet, { header: 1 });

      const registros: RegistroUbicacion[] = jsonData.slice(1).map((row) => ({
        tipoAlmacen: row[1],
        ubicacion: row[2],
        tipoUbicacion: row[3],
        material: row[7],
      }));

      const uniqueUbicaciones = new Map<string, RegistroUbicacion>();
      registros.forEach((r) => {
        if (r.ubicacion && !uniqueUbicaciones.has(r.ubicacion)) {
          uniqueUbicaciones.set(r.ubicacion, r);
        }
      });

      const finalData = Array.from(uniqueUbicaciones.values());

      const cantidadUbicaciones = finalData.length;
      const ubicacionesPallet = finalData.filter((r) =>
        r.tipoUbicacion?.toUpperCase().startsWith("P")
      ).length;
      const ubicacionesEstanteria = finalData.filter((r) =>
        r.tipoUbicacion?.toUpperCase().startsWith("E")
      ).length;

      setResumenUbicaciones({ cantidadUbicaciones, ubicacionesPallet, ubicacionesEstanteria });
    };

    fetchExcelUbicaciones();
  }, []);

  // Cargar Ylx22.xlsx
  useEffect(() => {
    const fetchExcelInventarios = async () => {
      const response = await fetch("/data/Ylx22.xlsx");
      const arrayBuffer = await response.arrayBuffer();
      const workbook = XLSX.read(arrayBuffer, { type: "array" });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData: any[] = XLSX.utils.sheet_to_json(sheet, { header: 1 });

      const registros: RegistroInventario[] = jsonData.slice(1).map((row) => ({
        fecha: row[0],
        almacen: row[6],
        ubicacion: row[8],
        material: row[9],
        nombre: row[10],
        totalTeorico: Number(row[12]) || 0,
        contado: Number(row[13]) || 0,
        resultado: parseFloat(row[14]) || 0,
      }));

      // Normalizar resultado
      registros.forEach((r) => {
        if (r.resultado === 0 || r.resultado === 0.0) {
          r.resultado = 0;
        }
      });

      const excelDateToJSDate = (serial: number): Date => {
        const utc_days = Math.floor(serial - 25569);
        const utc_value = (utc_days + 1) * 86400;
        return new Date(utc_value * 1000);
      };

      const obtenerMes = (fecha: string | number): number => {
        let fechaObj: Date;
        if (typeof fecha === "number") {
          fechaObj = excelDateToJSDate(fecha);
        } else {
          fechaObj = new Date(fecha);
        }
        return fechaObj.getMonth(); // 0 = enero
      };

      // Filtrar registros según mes seleccionado
      const registrosFiltrados = mesSeleccionado === "Año 2026"
        ? registros
        : registros.filter((r) => obtenerMes(r.fecha) === meses.indexOf(mesSeleccionado) - 1);

      const cantidadPosiciones = registrosFiltrados.filter((r) => r.almacen).length;
      const inventariosDiferencia = registrosFiltrados.filter((r) => r.resultado !== 0).length;

      let inventariosOkRaw = registrosFiltrados.filter((r) => r.resultado === 0).length;

      // 👇 Restar 1 solo si el filtro es "Año 2026"
      const inventariosOk =
        mesSeleccionado === "Año 2026" && inventariosOkRaw > 0
          ? inventariosOkRaw - 1
          : inventariosOkRaw;

      // Última fecha
      if (registros.length > 0) {
        const ultimaRaw = registros[registros.length - 2].fecha;
        let fechaObj: Date;
        if (typeof ultimaRaw === "number") {
          fechaObj = excelDateToJSDate(ultimaRaw);
        } else {
          fechaObj = new Date(ultimaRaw);
        }
        const ultimaFormateada = new Intl.DateTimeFormat("es-AR", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
        }).format(fechaObj);
        setUltimaFecha(ultimaFormateada);
      }

      setResumenInventarios({ cantidadPosiciones, inventariosDiferencia, inventariosOk });
    };

    fetchExcelInventarios();
  }, [mesSeleccionado]);

  // Animaciones
  const countUbicaciones = useCountUp(resumenUbicaciones.cantidadUbicaciones);
  const countPallet = useCountUp(resumenUbicaciones.ubicacionesPallet);
  const countEstanteria = useCountUp(resumenUbicaciones.ubicacionesEstanteria);

  const countPosiciones = useCountUp(resumenInventarios.cantidadPosiciones);
  const countDiferencia = useCountUp(resumenInventarios.inventariosDiferencia);
  const countOk = useCountUp(resumenInventarios.inventariosOk);

  // Gráfico ubicaciones
  const pieUbicaciones = {
    labels: ["Pallet (P)", "Estantería (E)"],
    datasets: [
      {
        data: [resumenUbicaciones.ubicacionesPallet, resumenUbicaciones.ubicacionesEstanteria],
        backgroundColor: ["#2b8179ff", "#87e2e7ff"],
        borderColor: ["#fff", "#fff"],
        borderWidth: 2,
      },
    ],
  };

  // Gráfico inventarios
  const pieInventarios = {
    labels: ["Ok", "Con diferencia"],
    datasets: [
      {
        data: [resumenInventarios.inventariosOk , resumenInventarios.inventariosDiferencia],
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

      {/* Grilla Ubicaciones */}
      <div className={styles.layout}>
        <div className={styles.grid}>
          <p>Cantidad de ubicaciones: <span className={styles.numero}>{countUbicaciones}</span></p>
          <p>Ubicaciones de Pallet: <span className={styles.numero}>{countPallet}</span></p>
          <p>Ubicaciones Estanteria: <span className={styles.numero}>{countEstanteria}</span></p>
        </div>
        <div style={{ width: "250px", height: "250px" }}>
          <Pie data={pieUbicaciones} />
        </div>
      </div>

      {/* Grilla Inventarios */}
      <div className={styles.layout}>
        <div className={styles.grid}>
          <p>Posiciones inventariadas: <span className={styles.numero}>{countPosiciones}</span></p>
          <p>Inventarios Ok:  
            <span className={styles.numero}>
              {countOk} ({(((resumenInventarios.inventariosOk) / resumenInventarios.cantidadPosiciones) * 100).toFixed(2)}%)
            </span>
          </p>
          <p>Inventarios con diferencia: 
            <span className={styles.numero}>
              {countDiferencia} ({((resumenInventarios.inventariosDiferencia / resumenInventarios.cantidadPosiciones) * 100).toFixed(2)}%)
            </span>
          </p>
        </div>
        <div style={{ display: "flex", alignItems: "center" }}>
          <div style={{ width: "250px", height: "250px" }}>
            <Pie data={pieInventarios} />
          </div>
          <div style={{ marginLeft: "20px" }}>
            <label className={styles.InventoryLabel}>Visualizar: </label>
            <select className={styles.InventorySelect}
              value={mesSeleccionado}
              onChange={(e) => setMesSeleccionado(e.target.value)}
            >
              {meses.map((mes) => (
                <option key={mes} value={mes}>{mes}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className={styles.InventoryLabel}>
        Última actualización: {ultimaFecha}
      </div>
    </div>
  );
};

export default Inventario;
