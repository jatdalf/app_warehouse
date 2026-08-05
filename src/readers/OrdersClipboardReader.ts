import type { OrderItem } from "../core/orders/OrderItem";

const regexST = /^ST[A-Z0-9]\d+$/;

export class OrdersClipboardReader {
    static read(text: string): OrderItem[] {
        const lines = text
            .split(/\r?\n/)
            .filter(line => line.trim() !== "");

        const parsedRows = lines.map((line) => {
            const cells = line.split("\t");
            const storeName = cells[0]?.trim() ?? "";
            const st = cells[1]?.trim() ?? "";

            if (!storeName.startsWith("AR") || !regexST.test(st)) {
                return null;
            }

            return {
                storeName,
                st,
                sku: cells[2]?.trim() ?? "",
                ean: cells[3]?.trim() ?? "",
                title: cells[4]?.trim() ?? "",
                uxb: cells[5]?.trim() ?? "",
                bultos:
                    Number.parseInt(
                        cells[6] ?? "0",
                        10
                    ) || 0,
                unidades:
                    Number.parseInt(
                        cells[7] ?? "0",
                        10
                    ) || 0
            };
        });

        return parsedRows.filter((row): row is OrderItem => row !== null);
    }
}