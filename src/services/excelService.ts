// src/services/excelService.ts
import * as XLSX from "xlsx";
import { safeFormatFecha, obtenerMes } from "../utils/dateUtils";

export interface ResumenUbicaciones {
  cantidadUbicaciones: number;
  ubicacionesPallet: number;
  ubicacionesEstanteria: number;
}

export interface ResumenInventarios {
  cantidadPosiciones: number;
  inventariosDiferencia: number;
  inventariosOk: number;
  ultimaFecha: string;
  registrosFiltrados: any[];
}

// ✅ Procesar ubicaciones.xlsx y devolver resumen
export const getResumenUbicaciones = async (): Promise<ResumenUbicaciones> => {
  const response = await fetch("/data/ubicaciones.xlsx");
  const arrayBuffer = await response.arrayBuffer();
  const workbook = XLSX.read(arrayBuffer, { type: "array" });
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const jsonData: any[] = XLSX.utils.sheet_to_json(sheet, { header: 1 });

  const registros = jsonData.slice(1).map((row) => ({
    tipoAlmacen: row[1],
    ubicacion: row[2],
    tipoUbicacion: row[3],
    material: row[7],
  }));

  const uniqueUbicaciones = new Map<string, any>();
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

  return { cantidadUbicaciones, ubicacionesPallet, ubicacionesEstanteria };
};

// ✅ Procesar Ylx22.xlsx y devolver resumen (multi-mes)
export const getResumenInventarios = async (
  mesesSeleccionados: string[],
  meses: string[]
): Promise<ResumenInventarios> => {
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

  // ✅ Filtrado correcto por múltiples meses
  const filtrados = registros.filter((r) =>
    mesesSeleccionados.some(
      (mes) => obtenerMes(r.fecha) === meses.indexOf(mes)
    )
  );

  const cantidadPosiciones = filtrados.filter((r) => r.almacen).length;
  const inventariosDiferencia = filtrados.filter((r) => r.resultado !== 0).length;
  const inventariosOkRaw = filtrados.filter((r) => r.resultado === 0).length;

  const inventariosOk = inventariosOkRaw;

  const ultimaFecha =
    registros.length > 0 ? safeFormatFecha(registros[registros.length - 2].fecha) : "";

  return {
    cantidadPosiciones,
    inventariosDiferencia,
    inventariosOk,
    ultimaFecha,
    registrosFiltrados: filtrados,
  };
};
