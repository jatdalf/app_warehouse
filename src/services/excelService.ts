// src/services/excelService.ts
import * as XLSX from "xlsx";
import { excelDateToJSDate } from "../utils/dateUtils";

export interface ResumenUbicaciones {
  cantidadUbicaciones: number;
  posicionesInventariadas: number;
  posicionesSinInventariar: number;
  listaSinInventariar: { tipoAlmacen: string; ubicacion: string }[];
}

export interface ResumenInventarios {
  cantidadPosiciones: number;
  inventariosDiferencia: number;
  inventariosOk: number;
  ultimaFecha: string;
  registrosFiltrados: any[];
}

export const nombreMeses = [
  "Enero","Febrero","Marzo","Abril","Mayo","Junio",
  "Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"
];

export const obtenerMes = (fechaExcel: number | string): number => {
  const fecha = excelDateToJSDate(fechaExcel);
  return fecha.getMonth();
};

// ✅ Cargar ubicaciones únicas con Tipo almacén (columna B) y Ubicación (columna C)
export const loadUbicaciones = async (): Promise<{ tipoAlmacen: string; ubicacion: string }[]> => {
  const response = await fetch("/data/ubicaciones.xlsx");
  const arrayBuffer = await response.arrayBuffer();
  const workbook = XLSX.read(arrayBuffer, { type: "array" });
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const jsonData: any[] = XLSX.utils.sheet_to_json(sheet, { header: 1 });

  const registros = jsonData.slice(1).map((row) => ({
    tipoAlmacen: row[1], // columna B
    ubicacion: row[2],   // columna C
  }));

  const uniqueUbicaciones = new Map<string, { tipoAlmacen: string; ubicacion: string }>();
  registros.forEach((r) => {
    if (r.ubicacion && !uniqueUbicaciones.has(r.ubicacion)) {
      uniqueUbicaciones.set(r.ubicacion, r);
    }
  });

  return Array.from(uniqueUbicaciones.values());
};

// ✅ Procesar inventarios y calcular posiciones inventariadas vs sin inventariar
export const getResumenInventarios = async (
  mesesSeleccionados: string[],
  ubicacionesUnicas: { tipoAlmacen: string; ubicacion: string }[]
): Promise<{ resumenInventarios: ResumenInventarios; resumenUbicaciones: ResumenUbicaciones }> => {
  const response = await fetch("/data/Ylx22.xlsx");
  const arrayBuffer = await response.arrayBuffer();
  const workbook = XLSX.read(arrayBuffer, { type: "array" });
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const jsonData: any[] = XLSX.utils.sheet_to_json(sheet, { header: 1 });
  const rawModified = workbook.Props?.ModifiedDate;
  const ultimaFecha = rawModified ? new Date(rawModified).toLocaleDateString( "es-AR",
        {day: "2-digit", month: "2-digit", year: "numeric"}) : "";

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

  // ✅ Filtrar por meses seleccionados
  const filtrados = registros.filter((r) =>
    mesesSeleccionados.some(
      (mes) => obtenerMes(r.fecha) === nombreMeses.indexOf(mes)
    )
  );

  // Calcular inventarios
  const cantidadPosiciones = filtrados.filter((r) => r.almacen).length;
  const inventariosDiferencia = filtrados.filter((r) => r.resultado !== 0).length;
  const inventariosOk = filtrados.filter((r) => r.resultado === 0).length;

  // ✅ Cruce consistente con detalle
  const ubicacionesInventariadasSet = new Set(
    filtrados.map((r) => r.ubicacion).filter((u) => u)
  );

  const listaSinInventariar = ubicacionesUnicas.filter(
    (u) => !ubicacionesInventariadasSet.has(u.ubicacion)
  );

  const posicionesInventariadas = ubicacionesInventariadasSet.size;
  const posicionesSinInventariar = listaSinInventariar.length;

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
      listaSinInventariar,
    },
  };
};
