// src/utils/dateUtils.ts

// ✅ Array fijo de nombres de meses
export const nombreMeses = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
];

// ✅ Convertir fecha de Excel (serial number) a objeto Date
export const excelDateToJSDate = (excelDate: number | string): Date => {
  if (typeof excelDate === "string") {
    // Si ya viene como string, intentamos parsear directamente
    return new Date(excelDate);
  }

  // Excel cuenta días desde 1900-01-01 (con bug de 1900 como año bisiesto)
  const epoch = new Date(Date.UTC(1899, 11, 30));
  const jsDate = new Date(epoch.getTime() + excelDate * 24 * 60 * 60 * 1000);
  return jsDate;
};

// ✅ Obtener índice del mes (0 = Enero, 1 = Febrero, etc.)
export const obtenerMes = (fechaExcel: number | string): number => {
  const fecha = excelDateToJSDate(fechaExcel);
  return fecha.getMonth();
};

// ✅ Formatear fecha segura (dd/mm/yyyy)
export const safeFormatFecha = (fechaExcel: number | string): string => {
  try {
    const fecha = excelDateToJSDate(fechaExcel);
    const dia = fecha.getDate().toString().padStart(2, "0");
    const mes = (fecha.getMonth() + 1).toString().padStart(2, "0");
    const anio = fecha.getFullYear();
    return `${dia}/${mes}/${anio}`;
  } catch {
    return "";
  }
};
export const buildInforFileName = (
    date: Date = new Date()
): string => {
    const dia = date
        .getDate()
        .toString()
        .padStart(2, "0");

    const mes = (date.getMonth() + 1)
        .toString()
        .padStart(2, "0");

    const anio =
        date.getFullYear();

    return `Infor${dia}${mes}${anio}.xlsx`;
};
