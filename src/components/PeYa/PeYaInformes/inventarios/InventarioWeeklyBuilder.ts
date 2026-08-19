import type { InventarioItem } from "./InventarioItem";
import type { FeriadoItem } from "./FeriadoItem";
import { InventarioSummaryBuilder } from "./InventarioSummaryBuilder";

export interface InventarioWeeklyItem {
    label: string;
    realizados: number;
    sinDiferencias: number;
    conDiferencias: number;
    diasHabiles: number;
    target: number;
}

export class InventarioWeeklyBuilder {
    private static formatWeekLabel(desde: Date, hasta: Date): string {
        const inicio = desde.getDate().toString().padStart(2, "0");
        const fin = hasta.getDate().toString().padStart(2, "0");
        const mes = new Intl.DateTimeFormat("es-AR", {month: "short"}).format(hasta).replace(".", "");
        const mesCapitalizado = mes.charAt(0).toUpperCase() + mes.slice(1);
        return `${inicio} - ${fin} ${mesCapitalizado}`;
    }

    static build(inventarios: InventarioItem[], feriados: FeriadoItem[], desde: Date, hasta: Date,
        fechaCorte?: Date | null): InventarioWeeklyItem[] {
        const resultado: InventarioWeeklyItem[] = [];
        let inicio = this.inicioSemana(desde);
        const limite = this.finDelDia(fechaCorte && fechaCorte.getTime() <
                    hasta.getTime() ? fechaCorte : hasta);
        while (inicio.getTime() <= limite.getTime()) {
            const fin = new Date(inicio);
            fin.setDate(fin.getDate() + 6);
            /* Recortamos la semana al período seleccionado. */
            const desdeSemana = inicio < desde ? desde : inicio;
            const hastaSemana = fin > limite ? limite : fin;
            const inventariosSemana = inventarios.filter(item => item.fecha >= desdeSemana &&
                    item.fecha <= this.finDelDia(hastaSemana));
            const realizados = inventariosSemana.length;
            const sinDiferencias = inventariosSemana.filter(item => item.quantityAdjusted === 0).length;
            const conDiferencias = inventariosSemana.filter(item => item.quantityAdjusted !== 0).length;
            const summary = InventarioSummaryBuilder.build(
                inventarios, feriados, desdeSemana, hastaSemana, fechaCorte);
            const diasHabiles = summary.diasLaborables;
            const target = diasHabiles * 10;
            const label = this.formatWeekLabel(desdeSemana, hastaSemana);
            resultado.push({label, realizados, sinDiferencias, conDiferencias, diasHabiles, target});
            inicio = new Date(inicio);
            inicio.setDate(inicio.getDate() + 7);
        }
        return resultado;
    }
    /*
     * Semana lunes-domingo.
     */
    private static inicioSemana(fecha: Date): Date {
        const result = new Date(fecha.getFullYear(), fecha.getMonth(), fecha.getDate());
        const dia = result.getDay();
        const diferencia = dia === 0 ? -6 : 1 - dia;
        result.setDate(result.getDate() + diferencia);
        return result;
    }

    private static finDelDia(fecha: Date): Date {
        return new Date(fecha.getFullYear(), fecha.getMonth(), fecha.getDate(), 23, 59, 59, 999);
    }
}