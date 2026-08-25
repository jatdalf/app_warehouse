import type { FeriadoItem } from "./FeriadoItem";

export class CalendarioLaboral {
    static esFeriado(fecha: Date, feriados: FeriadoItem[] ): boolean {
        return feriados.some(feriado => this.mismaFecha(fecha, feriado.fecha)
        );
    }

    static esFinDeSemana(fecha: Date): boolean {
        const dia = fecha.getDay();
        return dia === 0 || dia === 6;
    }

    static esDiaLaborable(fecha: Date, feriados: FeriadoItem[]): boolean {
        return (!this.esFinDeSemana(fecha) && !this.esFeriado(fecha, feriados));
    }
    private static mismaFecha(a: Date, b: Date): boolean {
        return (a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() &&
            a.getDate() === b.getDate());
    }
}