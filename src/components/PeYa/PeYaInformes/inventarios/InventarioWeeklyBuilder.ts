import type { InventarioItem } from "./InventarioItem";
import type { FeriadoItem } from "./FeriadoItem";
import { InventarioSummaryBuilder } from "./InventarioSummaryBuilder";

export interface InventarioWeeklyData {
    key: string;
    label: string;
    desde: Date;
    hasta: Date;
    realizados: number;
    esperados: number;
    cumplimiento: number;
    sinDiferencias: number;
    conDiferencias: number;
}

export class InventarioWeeklyBuilder {
    static build(
        inventarios: InventarioItem[],
        feriados: FeriadoItem[],
        desde: Date,
        hasta: Date
    ): InventarioWeeklyData[] {
        const resultado: InventarioWeeklyData[] = [];
        let inicio = this.inicioSemana(desde);
        const limite = this.finDelDia(hasta);
        while (inicio.getTime() <= limite.getTime()) {
            const fin = new Date(inicio);
            fin.setDate(fin.getDate() + 6);
            /* Recortamos la semana al período seleccionado.*/
            const desdeSemana = inicio < desde ? desde : inicio;
            const hastaSemana = fin > hasta ? hasta : fin;
            const summary = InventarioSummaryBuilder.build(
                inventarios,
                feriados,
                desdeSemana,
                hastaSemana
            );
            resultado.push({
                key: this.formatKey(desdeSemana),
                label: `${this.formatDay(desdeSemana)} - ${this.formatDay(hastaSemana)}`,
                desde: desdeSemana,
                hasta: hastaSemana,
                realizados: summary.realizados,
                esperados: summary.esperados,
                cumplimiento: summary.cumplimiento,
                sinDiferencias: summary.sinDiferencias,
                conDiferencias: summary.conDiferencias
            });

            inicio = new Date(inicio);
            inicio.setDate(inicio.getDate() + 7);
        }
        return resultado;
    }
    /* Semana lunes-domingo */
    private static inicioSemana(fecha: Date): Date {
        const result = new Date(
            fecha.getFullYear(),
            fecha.getMonth(),
            fecha.getDate()
        );
        const dia = result.getDay();
        const diferencia = dia === 0 ? -6 : 1 - dia;
        result.setDate( result.getDate() + diferencia);
        return result;
    }

    private static formatDay(fecha: Date): string {
        return fecha.getDate().toString().padStart(2, "0");
    }

    private static formatKey(fecha: Date): string {
        return [fecha.getFullYear(), fecha.getMonth() + 1, fecha.getDate()].join("-");
    }

    private static finDelDia(fecha: Date): Date {
        return new Date(
            fecha.getFullYear(),
            fecha.getMonth(),
            fecha.getDate(),
            23,
            59,
            59,
            999
        );
    }
}