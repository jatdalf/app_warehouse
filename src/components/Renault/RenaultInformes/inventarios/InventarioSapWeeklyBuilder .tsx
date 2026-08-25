import type { InventarioSapLinea } from "./InventarioSapLinea";
import type { FeriadoItem } from "./FeriadoItem";
import { CalendarioLaboral } from "./CalendarioLaboral";
import type { InventarioDia } from "./InventarioDia";
import type { InventarioSemana } from "./InventarioSemana";

export class InventarioSapWeeklyBuilder {
    static build(
        lineas: InventarioSapLinea[],
        feriados: FeriadoItem[],
        desde: Date,
        hasta: Date
    ): InventarioSemana[] {
        
        const resultado: InventarioSemana[] = [];
        let inicioSemana = this.inicioSemana(desde);
        while (inicioSemana.getTime() <= hasta.getTime()) {
            const finSemana = new Date(inicioSemana);
            finSemana.setDate(finSemana.getDate() + 6);
            const dias: InventarioDia[] = [];
            for (let offset = 0; offset < 7; offset++) {
                const fecha = new Date(inicioSemana);
                fecha.setDate(fecha.getDate() + offset);
                /* Si el día cae fuera del período consultado, no lo agregamos.*/
                if (fecha < desde || fecha > hasta) {
                    continue;
                }
                const inicioDia = new Date(fecha.getFullYear(), fecha.getMonth(), fecha.getDate());
                const finDia = new Date(fecha.getFullYear(), fecha.getMonth(), fecha.getDate(),
                        23, 59, 59, 999);
                const lineasDia = lineas.filter(item => item.fecha >= inicioDia && item.fecha <= finDia);
                const porReferencia = lineasDia.reduce<Record<string, number> >((acc, item) => {
                        const referencia = item.referencia || "CICLICOS";
                        acc[referencia] = (acc[referencia] ?? 0) + 1;
                        return acc;
                    }, {}
                );
                const target = CalendarioLaboral.esDiaLaborable(fecha, feriados) ? 135 : 0;
                dias.push({
                    fecha,
                    label: this.nombreDia(fecha),
                    realizados: lineasDia.length,
                    target,
                    porReferencia
                });
            }

            if (dias.length > 0) {
                resultado.push({
                    key: this.formatKey(inicioSemana),
                    label: this.formatWeekLabel(dias[0].fecha, dias[dias.length - 1].fecha),
                    desde: dias[0].fecha,
                    hasta: dias[dias.length - 1].fecha,
                    dias
                });
            }
            inicioSemana = new Date(inicioSemana);
            inicioSemana.setDate(inicioSemana.getDate() + 7);
        }
        return resultado;
    }

    private static inicioSemana(fecha: Date): Date {
        const result = new Date(fecha.getFullYear(), fecha.getMonth(), fecha.getDate());
        const dia = result.getDay();
        const diferencia = dia === 0 ? -6 : 1 - dia;
        result.setDate(result.getDate() + diferencia);
        return result;
    }

    private static nombreDia(fecha: Date): string {
        const nombre = new Intl.DateTimeFormat("es-AR", {weekday: "short"}).format(fecha).replace(".", "");
        return (nombre.charAt(0).toUpperCase() + nombre.slice(1));
    }

    private static formatWeekLabel(desde: Date, hasta: Date): string {
        const mes = new Intl.DateTimeFormat("es-AR", {month: "long"}).format(desde);
        return `${mes.charAt(0).toUpperCase() + mes.slice(1)} ${desde.getDate()} - ${hasta.getDate()}`;
    }

    private static formatKey(fecha: Date): string {
        return [fecha.getFullYear(), fecha.getMonth() + 1, fecha.getDate()].join("-");
    }
}