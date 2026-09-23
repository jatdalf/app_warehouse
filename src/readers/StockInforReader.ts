import * as XLSX from "xlsx";
import type { StockItem } from "../core/stock/StockItem";

export class StockInforReader {
  static async read(file: File): Promise<StockItem[]> {
    const buffer = await file.arrayBuffer();

    const workbook = XLSX.read(buffer, {
      cellDates: true,
    });

    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];

    if (!sheet) {
      throw new Error("El archivo no contiene ninguna hoja.");
    }

    const rows = XLSX.utils.sheet_to_json<unknown[]>(sheet, {
      header: 1,
      raw: true,
      defval: "",
    });

    if (rows.length === 0) {
      throw new Error("El archivo de stock está vacío.");
    }

    /*
     * Buscamos la fila de encabezados.
     * No asumimos obligatoriamente que sea la primera fila.
     */
    const headerRowIndex = rows.findIndex((row) => {
      const headers = row.map((value) => this.normalizeHeader(value));

      return (
        headers.includes("articulo") &&
        headers.includes("ubicacion")
      );
    });

    if (headerRowIndex === -1) {
      throw new Error(
        'No se encontró la fila con los encabezados "Artículo" y "Ubicación".',
      );
    }

    const headers = rows[headerRowIndex];

    const articuloIndex = this.findColumnIndex(headers, [
      "Artículo",
      "Articulo",
    ]);

    const ubicacionIndex = this.findColumnIndex(headers, [
      "Ubicación",
      "Ubicacion",
    ]);

    const stockIndex = this.findColumnIndex(headers, [
      "Disponible",      
    ]);

    const fechaVencimientoIndex = this.findColumnIndex(headers, [
      "Fecha vencimiento",
      "Fecha de vencimiento",
      "F. vencimiento",
      "Vencimiento",
    ]);

    const missingColumns: string[] = [];

    if (articuloIndex === -1) {
      missingColumns.push("Artículo");
    }

    if (ubicacionIndex === -1) {
      missingColumns.push("Ubicación");
    }

    if (stockIndex === -1) {
      missingColumns.push("Disponible");
    }

    if (missingColumns.length > 0) {
      throw new Error(
        `No se encontraron las columnas requeridas: ${missingColumns.join(", ")}.`,
      );
    }

    return rows
      .slice(headerRowIndex + 1)
      .map((row): StockItem | null => {
        const articulo = String(row[articuloIndex] ?? "").trim();
        const ubicacion = String(row[ubicacionIndex] ?? "").trim();
        const stock = this.parseNumber(row[stockIndex]);

        if (!articulo || !ubicacion) {
          return null;
        }

        return {
          articulo,
          ubicacion,
          stock,
          fechaVencimiento:
            fechaVencimientoIndex !== -1
              ? this.parseFechaVencimiento(
                  row[fechaVencimientoIndex],
                )
              : null,
        };
      })
      .filter((item): item is StockItem => {
        return item !== null && item.stock > 0;
      });
  }

  private static findColumnIndex(
    headers: unknown[],
    possibleNames: string[],
  ): number {
    const normalizedNames = possibleNames.map((name) =>
      this.normalizeHeader(name),
    );

    return headers.findIndex((header) =>
      normalizedNames.includes(this.normalizeHeader(header)),
    );
  }

  private static normalizeHeader(value: unknown): string {
    return String(value ?? "")
      .trim()
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/\s+/g, " ");
  }

  private static parseNumber(value: unknown): number {
    if (typeof value === "number") {
      return Number.isFinite(value) ? value : 0;
    }

    const text = String(value ?? "")
      .trim()
      .replace(/\s/g, "");

    if (!text) {
      return 0;
    }

    /*
     * Admite:
     * 1234.56
     * 1234,56
     * 1.234,56
     */
    const normalized =
      text.includes(",") && text.includes(".")
        ? text.replace(/\./g, "").replace(",", ".")
        : text.replace(",", ".");

    const number = Number(normalized);

    return Number.isFinite(number) ? number : 0;
  }

  private static parseFechaVencimiento(
    value: unknown,
  ): Date | null {
    // XLSX ya la convirtió
    if (value instanceof Date) {
      return Number.isNaN(value.getTime()) ? null : value;
    }

    // Fecha serial de Excel
    if (typeof value === "number") {
      const parsed = XLSX.SSF.parse_date_code(value);

      if (!parsed) {
        return null;
      }

      return new Date(parsed.y, parsed.m - 1, parsed.d);
    }

    // Fecha como texto
    if (typeof value === "string") {
      const texto = value.trim();

      if (!texto) {
        return null;
      }

      // Formatos: 18/09/2026 o 18/9/26
      const match = texto.match(
        /^(\d{1,2})\/(\d{1,2})\/(\d{2}|\d{4})$/,
      );

      if (match) {
        const dia = Number(match[1]);
        const mes = Number(match[2]) - 1;
        let anio = Number(match[3]);

        if (anio < 100) {
          anio += 2000;
        }

        const fecha = new Date(anio, mes, dia);

        // Evita aceptar fechas imposibles como 31/02/2026.
        if (
          fecha.getFullYear() !== anio ||
          fecha.getMonth() !== mes ||
          fecha.getDate() !== dia
        ) {
          return null;
        }

        return fecha;
      }
    }

    return null;
  }
}