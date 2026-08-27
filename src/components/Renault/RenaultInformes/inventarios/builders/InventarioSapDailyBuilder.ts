import type { InventarioSapLinea } from "../InventarioSapLinea";
import type { FeriadoItem } from "../FeriadoItem";
import type { InventarioDia } from "../InventarioDia";
import { CalendarioLaboral } from "../CalendarioLaboral";

export class InventarioSapDailyBuilder {
    static build(
        lineas: InventarioSapLinea[],
        feriados: FeriadoItem[],
        desde: Date,
        hasta: Date,
        targetDiario: number
    ): InventarioDia[] {
        const resultado: InventarioDia[] = [];
        let fecha = new Date(desde.getFullYear(), desde.getMonth(), desde.getDate());
        const limite = new Date(hasta.getFullYear(), hasta.getMonth(), hasta.getDate(), 23, 59, 59, 999);
        while (fecha.getTime() <= limite.getTime()) {
            const inicioDia = new Date(fecha.getFullYear(), fecha.getMonth(), fecha.getDate());
            const finDia = new Date( fecha.getFullYear(), fecha.getMonth(), fecha.getDate(), 23, 59, 59, 999);
            const lineasDia = lineas.filter(item => item.fecha >= inicioDia && item.fecha <= finDia);
            const porReferencia = lineasDia.reduce<Record<string, number>>((acc, item) => {
                    const referencia = item.referencia || "CICLICOS";
                    acc[referencia] = (acc[referencia] ?? 0) + 1;
                    return acc;
                },{}
            );
            const target = CalendarioLaboral.esDiaLaborable(fecha, feriados) ? targetDiario : 0;
            resultado.push({
                fecha: new Date(fecha),
                label: this.nombreDia(fecha),
                realizados: lineasDia.length,
                target,
                porReferencia
            });
            fecha = new Date(fecha);
            fecha.setDate(fecha.getDate() + 1);
        }
        return resultado;
    }
    private static nombreDia(fecha: Date): string {
        const nombre = new Intl.DateTimeFormat("es-AR",{weekday: "short"}).format(fecha).replace(".", "");
        return (nombre.charAt(0).toUpperCase() + nombre.slice(1));
    }
}