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
  fecha: string;
  almacen: string;
  ubicacion: string;
  material: string;
  nombre: string;
  totalTeorico: number;
  contado: number;
  resultado: number;
}

const useCountUp = (end: number, duration: number = 3000) => {
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

      // Normalizar resultado: todo lo que sea 0 o 0,000 → 0
      registros.forEach((r) => {
        if (r.resultado === 0 || r.resultado === 0.0) {
          r.resultado = 0;
        }
      });

      const cantidadPosiciones = registros.filter((r) => r.almacen).length;
      const inventariosDiferencia = registros.filter((r) => r.resultado !== 0).length;
      const inventariosOk = registros.filter((r) => r.resultado === 0).length;

      const excelDateToJSDate = (serial: number): Date => {
            // Excel cuenta desde 1/1/1900, pero incluye el bug del año bisiesto 1900
        const utc_days = Math.floor(serial - 25569); 
        const utc_value = (utc_days + 1) * 86400; // 👈 sumamos +1 día
        return new Date(utc_value * 1000); // milisegundos
        };


      // Tomar la última fecha directamente del último registro
        if (registros.length > 0) {
        const ultimaRaw = registros[registros.length -2].fecha;

        let fechaObj: Date;

        if (typeof ultimaRaw === "number") {
            // Si viene como serial de Excel
            fechaObj = excelDateToJSDate(ultimaRaw);
        } else {
            // Si viene como string reconocible por Date
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
  }, []);

  // Animaciones
  const countUbicaciones = useCountUp(resumenUbicaciones.cantidadUbicaciones);
  const countPallet = useCountUp(resumenUbicaciones.ubicacionesPallet);
  const countEstanteria = useCountUp(resumenUbicaciones.ubicacionesEstanteria);

  const countPosiciones = useCountUp(resumenInventarios.cantidadPosiciones);
  const countDiferencia = useCountUp(resumenInventarios.inventariosDiferencia);
  const countOk = useCountUp(resumenInventarios.inventariosOk) -1; // Resto 1 para no contar la última fila vacía
  

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
        data: [resumenInventarios.inventariosOk, resumenInventarios.inventariosDiferencia],
        backgroundColor: ["#28a745","#dc3545"],
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
                {countOk}  ({(((resumenInventarios.inventariosOk -1) / resumenInventarios.cantidadPosiciones) * 100).toFixed(2)}%)
            </span>
          </p>
          <p>Inventarios con diferencia: 
            <span className={styles.numero}>
                {countDiferencia}  ({((resumenInventarios.inventariosDiferencia / resumenInventarios.cantidadPosiciones) * 100).toFixed(2)}%)
            </span>
          </p>
        </div>
        <div style={{ width: "250px", height: "250px" }}>
          <Pie data={pieInventarios} />
        </div>
      </div>

        <div style={{ marginTop: "30px", textAlign: "center", fontStyle: "italic", color: "#6c757d" }}>
        Última actualización: {ultimaFecha}
        </div>

    </div>
  );
};

export default Inventario;
