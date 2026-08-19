import type { InventarioItem } from "./InventarioItem";
import type { FeriadoItem } from "./FeriadoItem";
import { CalendarioLaboral } from "./CalendarioLaboral";

export interface InventarioSummary {
    realizados: number;
    sinDiferencias: number;
    conDiferencias: number;
    diasLaborables: number;
    esperados: number;
    cumplimiento: number;
}

export class InventarioSummaryBuilder {
    static build(inventarios: InventarioItem[], feriados: FeriadoItem[], desde: Date, hasta: Date, fechaCorte?: Date | null
    ): InventarioSummary {
        const limite = fechaCorte && fechaCorte.getTime() < hasta.getTime() ? this.finDelDia(fechaCorte) : this.finDelDia(hasta);
        const inicio = new Date(desde.getFullYear(), desde.getMonth(), desde.getDate());
        const inventariosPeriodo = inventarios.filter(item => {
            const fecha = item.fecha;
            return (fecha.getTime() >= inicio.getTime() && fecha.getTime() <= limite.getTime());
        });

        const realizados = inventariosPeriodo.length;
        const sinDiferencias = inventariosPeriodo.filter(item => item.quantityAdjusted === 0).length;
        const conDiferencias = inventariosPeriodo.filter(item => item.quantityAdjusted !== 0).length;
        let diasLaborables = 0;
        const cursor = new Date(inicio);
        while (cursor.getTime() <= limite.getTime()) {
            const diaSemana = cursor.getDay();
            const esFinDeSemana = diaSemana === 0 || diaSemana === 6;
            const esFeriado = CalendarioLaboral.esFeriado(cursor, feriados);
            if (!esFinDeSemana && !esFeriado) {
                diasLaborables++;
            }
            cursor.setDate(cursor.getDate() + 1);
        }
        /* PeYa = 10 inventarios por día laborable. */
        const esperados = diasLaborables * 10;
        const cumplimiento = esperados > 0 ? (realizados / esperados) * 100 : 0;
        return {
            realizados,
            sinDiferencias,
            conDiferencias,
            diasLaborables,
            esperados,
            cumplimiento
        };
    }
    private static finDelDia(fecha: Date): Date {
        return new Date(fecha.getFullYear(), fecha.getMonth(), fecha.getDate(), 23, 59, 59, 999);
    }
}