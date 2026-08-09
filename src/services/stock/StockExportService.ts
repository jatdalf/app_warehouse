import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import type { StockItem } from "../../core/stock/StockItem";

const COL_ARTICULO = 2;   // B
const COL_UBICACION = 5;  // E
const COL_STOCK_G = 7;    // G
const COL_STOCK_H = 8;    // H
const COL_STOCK_AG = 33;  // AG

export class StockExportService {
    static async export(
        sourceFile: File,
        stockActualizado: StockItem[],
        fileName: string
    ) {
        const buffer = await sourceFile.arrayBuffer();
        const workbook = new ExcelJS.Workbook();
        await workbook.xlsx.load(buffer);
        const worksheet = workbook.worksheets[0];
        if (!worksheet) {
            throw new Error("El archivo de stock no contiene hojas.");
        }
        const stockMap = new Map<string, number>();
        for (const item of stockActualizado) {
            const key = `${item.articulo}|${item.ubicacion}`;
            stockMap.set(key, Number(item.stock));
        }
        const filasAEliminar: number[] = [];
        worksheet.eachRow({ includeEmpty: false }, (row, rowNumber) => {
            if (rowNumber === 1) {
                return;
            }
            const articulo = String(row.getCell(COL_ARTICULO).value ?? "").trim();
            const ubicacion = String(row.getCell(COL_UBICACION).value ?? "").trim();
            if (!articulo || !ubicacion) {
                return;
            }
            const key = `${articulo}|${ubicacion}`;
            const stock = stockMap.get(key) ?? 0;
            if (stock <= 0) {
                filasAEliminar.push(rowNumber);
                return;
            }
            row.getCell(COL_STOCK_G).value = stock;
            row.getCell(COL_STOCK_H).value = stock;
            row.getCell(COL_STOCK_AG).value = stock;
            // G y H con 5 decimales visuales
            row.getCell(COL_STOCK_G).numFmt = "0.00000";
            row.getCell(COL_STOCK_H).numFmt = "0.00000";
            // AG entero
            row.getCell(COL_STOCK_AG).numFmt = "0";
            }
        );

        // Importante: borrar de abajo hacia arriba
        filasAEliminar
            .sort((a, b) => b - a)
            .forEach(rowNumber => {
                worksheet.spliceRows(
                    rowNumber,
                    1
                );
            });
        const output = await workbook.xlsx.writeBuffer();
        saveAs(new Blob([output],
                {
                    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                }
            ),
            fileName
        );
    }
}