import type { InventarioSapLinea } from "../InventarioSapLinea";
import type { VaciasItem } from "../vacias/VaciasItem";

export class VaciasSapBuilder {
    static build(lineas: InventarioSapLinea[]): VaciasItem[] {
        const posiciones = new Map<
            string,
            { fecha: Date; ocupado: boolean }
        >();

        for (const linea of lineas) {
            const referencia = linea.referencia.trim().toUpperCase();
            const estado = linea.statusInventario.trim().toUpperCase();

            if (
                !["VACIA", "VACIAS"].includes(referencia) ||
                estado !== "ELIMINADOS"
            ) {
                continue;
            }

            const documento = linea.documento.trim().replace(/^0+/, "");
            const posicion = linea.posicion.trim().toUpperCase();

            if (
                !documento ||
                !posicion ||
                Number.isNaN(linea.fecha.getTime())
            ) {
                continue;
            }

            const clave = `${documento}|${posicion}`;
            const ocupado = linea.material.trim() !== "";
            const existente = posiciones.get(clave);

            if (existente) {
                // Varios materiales en una ubicación cuentan como
                // una sola ubicación ocupada.
                existente.ocupado ||= ocupado;
            } else {
                posiciones.set(clave, {
                    fecha: linea.fecha,
                    ocupado,
                });
            }
        }

        const dias = new Map<string, VaciasItem>();

        for (const posicion of posiciones.values()) {
            const fecha = new Date(
                posicion.fecha.getFullYear(),
                posicion.fecha.getMonth(),
                posicion.fecha.getDate(),
            );

            const clave = [
                fecha.getFullYear(),
                fecha.getMonth(),
                fecha.getDate(),
            ].join("-");

            const dia = dias.get(clave) ?? {
                fecha,
                relevadas: 0,
                ocupado: 0,
            };

            dia.relevadas += 1;
            dia.ocupado += Number(posicion.ocupado);

            dias.set(clave, dia);
        }

        return [...dias.values()].sort(
            (a, b) => a.fecha.getTime() - b.fecha.getTime(),
        );
    }
}