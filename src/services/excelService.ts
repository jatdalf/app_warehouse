// src/services/excelService.ts
import * as XLSX from "xlsx";
import { safeFormatFecha, excelDateToJSDate } from "../utils/dateUtils";

export interface ResumenUbicaciones {
  cantidadUbicaciones: number;
  posicionesInventariadas: number;
  posicionesSinInventariar: number;
}

export interface ResumenInventarios {
  cantidadPosiciones: number;
  inventariosDiferencia: number;
  inventariosOk: number;
  ultimaFecha: string;
  registrosFiltrados: any[];
}

// ✅ Array fijo de nombres de meses
export const nombreMeses = [
  "Enero","Febrero","Marzo","Abril","Mayo","Junio",
  "Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"
];

// ✅ Obtener índice del mes (0 = Enero, 1 = Febrero, etc.)
export const obtenerMes = (fechaExcel: number | string): number => {
  const fecha = excelDateToJSDate(fechaExcel);
  return fecha.getMonth();
};

// ✅ Cargar ubicaciones únicas (columna B = Tipo almacén)
export const loadUbicaciones = async (): Promise<string[]> => {
  const response = await fetch("/data/ubicaciones.xlsx");
  const arrayBuffer = await response.arrayBuffer();
  const workbook = XLSX.read(arrayBuffer, { type: "array" });
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const jsonData: any[] = XLSX.utils.sheet_to_json(sheet, { header: 1 });

  const registros = jsonData.slice(1).map((row) => ({
    tipoAlmacen: row[1], // columna B
    ubicacion: row[2],   // columna C
  }));

  const uniqueUbicaciones = new Map<string, string>();
  registros.forEach((r) => {
    if (r.ubicacion && !uniqueUbicaciones.has(r.ubicacion)) {
      uniqueUbicaciones.set(r.ubicacion, r.tipoAlmacen);
    }
  });

  return Array.from(uniqueUbicaciones.keys()); // lista de ubicaciones únicas
};

// ✅ Procesar inventarios y calcular posiciones inventariadas vs sin inventariar
export const getResumenInventarios = async (
  mesesSeleccionados: string[],
  ubicacionesUnicas: string[]
): Promise<{ resumenInventarios: ResumenInventarios; resumenUbicaciones: ResumenUbicaciones }> => {
  const response = await fetch("/data/Ylx22.xlsx");
  const arrayBuffer = await response.arrayBuffer();
  const workbook = XLSX.read(arrayBuffer, { type: "array" });
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const jsonData: any[] = XLSX.utils.sheet_to_json(sheet, { header: 1 });

  const registros = jsonData.slice(1).map((row) => ({
    fecha: row[0],
    almacen: row[6],
    ubicacion: row[8],
    material: row[9],
    nombre: row[10],
    totalTeorico: Number(row[12]) || 0,
    contado: Number(row[13]) || 0,
    resultado: parseFloat(row[14]) || 0,
  }));

  registros.forEach((r) => {
    if (!r.resultado) r.resultado = 0;
  });

  // ✅ Filtrar usando array fijo de meses
  const filtrados = registros.filter((r) =>
    mesesSeleccionados.some(
      (mes) => obtenerMes(r.fecha) === nombreMeses.indexOf(mes)
    )
  );

  // Calcular inventarios
  const cantidadPosiciones = filtrados.filter((r) => r.almacen).length;
  const inventariosDiferencia = filtrados.filter((r) => r.resultado !== 0).length;
  const inventariosOk = filtrados.filter((r) => r.resultado === 0).length;

  const ultimaFecha =
    registros.length > 0 ? safeFormatFecha(registros[registros.length - 2].fecha) : "";

  // ✅ Calcular posiciones inventariadas vs sin inventariar
  const ubicacionesInventariadas = new Set(
    filtrados.map((r) => r.ubicacion).filter((u) => u)
  );
  const posicionesInventariadas = ubicacionesInventariadas.size;
  const posicionesSinInventariar = ubicacionesUnicas.length - posicionesInventariadas;

  return {
    resumenInventarios: {
      cantidadPosiciones,
      inventariosDiferencia,
      inventariosOk,
      ultimaFecha,
      registrosFiltrados: filtrados,
    },
    resumenUbicaciones: {
      cantidadUbicaciones: ubicacionesUnicas.length,
      posicionesInventariadas,
      posicionesSinInventariar,
    },
  };
};
