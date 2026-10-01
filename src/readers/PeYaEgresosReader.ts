import * as XLSX from "xlsx";
import type { EgresoItem } from "../components/PeYa/PeYaInformes/egresos/EgresoItem";

export interface PeYaEgresosData {
    items: EgresoItem[];
    modifiedAt: Date | null;
}

export class PeYaEgresosReader {
static async read(): Promise<PeYaEgresosData> {
    const response = await fetch(
        "/api/drive-file",
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                fileId: "1VDoNzHfOKDmf1r827uaekcEvnQ1qfdJR"
            })
        }
    );

    if (!response.ok) {
        throw new Error(
            "No fue posible cargar SalidasPeYa.xlsx desde Google Drive."
        );
    }

    const data = await response.json();

    if (!data.success || !data.base64) {
        throw new Error(
            data.error ??
            "Respuesta inválida al cargar SalidasPeYa.xlsx."
        );
    }

    const binary = atob(data.base64);
    const bytes = new Uint8Array(binary.length);

    for (let i = 0; i < binary.length; i++) {
        bytes[i] = binary.charCodeAt(i);
    }

    const workbook = XLSX.read(
        bytes,
        {
            type: "array",
            cellDates: true
        }
    );

    console.log(
        "Hojas disponibles:",
        workbook.SheetNames
    );

    const sheet = workbook.Sheets["Sheet1"];

    if (!sheet) {
        throw new Error(
            'No existe la hoja "Sheet1" en SalidasPeYa.xlsx'
        );
    }

    const rawModified =
        workbook.Props?.ModifiedDate;

    const modifiedAt =
        rawModified
            ? new Date(rawModified)
            : null;

    const rows =
        XLSX.utils.sheet_to_json<
            Record<string, unknown>
        >(sheet, {
            defval: "",
            raw: true
        });

    if (rows.length === 0) {
        throw new Error(
            "SalidasPeYa.xlsx no contiene registros."
        );
    }

    const columnasRequeridas = [
        "N.º orden",
        "Artículo",
        "Expedido",
        "Fecha real de expedición"
    ];

    const columnasDisponibles =
        Object.keys(rows[0]);

    const columnasFaltantes =
        columnasRequeridas.filter(
            columna =>
                !columnasDisponibles.includes(
                    columna
                )
        );

    if (columnasFaltantes.length > 0) {
        throw new Error(
            `SalidasPeYa.xlsx cambió de estructura. Faltan columnas: ${columnasFaltantes.join(", ")}`
        );
    }

    const items = rows
        .map(row => ({
            st: String(
                row["N.º orden"] ?? ""
            ).trim(),

            sku: String(
                row["Artículo"] ?? ""
            ).trim(),

            bultos: this.parseCantidad(
                row["Expedido"]
            ),

            fecha: this.parseDate(
                row["Fecha real de expedición"]
            )
        }))
        .filter(item =>
            item.st !== "" &&
            item.sku !== "" &&
            item.bultos > 0 &&
            !Number.isNaN(
                item.fecha.getTime()
            )
        );

    return {
        items,
        modifiedAt
    };
}
    private static parseCantidad(value: unknown
    ): number {
        if (typeof value === "number") {
            return value;
        }
        const texto = String(value ?? "").trim().replace(",", ".");
        const numero = Number(texto);
        return Number.isNaN(numero) ? 0 : numero;
    }


    private static parseDate(
        value: unknown
    ): Date {

        if (value instanceof Date) {
            return value;
        }


        if (typeof value === "number") {

            const parsed =
                XLSX.SSF.parse_date_code(
                    value
                );

            if (!parsed) {
                return new Date(NaN);
            }

            return new Date(
                parsed.y,
                parsed.m - 1,
                parsed.d,
                parsed.H ?? 0,
                parsed.M ?? 0
            );
        }


        /*
         * Ejemplo del archivo:
         *
         * 14/8/26, 12:00
         */
        const texto =
            String(value ?? "")
                .trim();

        if (!texto) {
            return new Date(NaN);
        }


        const partes =
            texto.split(",");

        const fechaTexto =
            partes[0]?.trim();

        const horaTexto =
            partes[1]?.trim() ?? "00:00";


        const fechaPartes =
            fechaTexto.split("/");

        if (fechaPartes.length !== 3) {
            return new Date(NaN);
        }


        const dia =
            Number(fechaPartes[0]);

        const mes =
            Number(fechaPartes[1]);

        let anio =
            Number(fechaPartes[2]);

        if (anio < 100) {
            anio += 2000;
        }


        const horaPartes =
            horaTexto.split(":");


        return new Date(
            anio,
            mes - 1,
            dia,
            Number(horaPartes[0] ?? 0),
            Number(horaPartes[1] ?? 0)
        );
    }
}