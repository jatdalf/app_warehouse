// src/utils/dateUtils.ts

/**
 * Convierte un serial de Excel a objeto Date.
 * Excel cuenta días desde 1/1/1900, con el bug del año bisiesto 1900.
 */
export const excelDateToJSDate = (serial: number): Date => {
  const utc_days = Math.floor(serial - 25569);
  const utc_value = (utc_days + 1) * 86400;
  return new Date(utc_value * 1000);
};

/**
 * Formatea una fecha (serial o string) a dd/mm/yyyy.
 * Si la fecha es inválida, devuelve la fecha actual.
 */
export const safeFormatFecha = (fecha: string | number): string => {
  let fechaObj: Date;

  if (typeof fecha === "number" && !isNaN(fecha)) {
    fechaObj = excelDateToJSDate(fecha);
  } else {
    const parsed = new Date(fecha);
    fechaObj = isNaN(parsed.getTime()) ? new Date() : parsed;
  }

  return new Intl.DateTimeFormat("es-AR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(fechaObj);
};

/**
 * Devuelve el mes (0 = enero) de una fecha serial o string.
 */
export const obtenerMes = (fecha: string | number): number => {
  let fechaObj: Date;
  if (typeof fecha === "number" && !isNaN(fecha)) {
    fechaObj = excelDateToJSDate(fecha);
  } else {
    fechaObj = new Date(fecha);
  }
  return fechaObj.getMonth();
};