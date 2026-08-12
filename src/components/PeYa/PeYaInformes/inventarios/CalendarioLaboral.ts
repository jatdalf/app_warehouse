import type { FeriadoItem } from "./FeriadoItem";

export class CalendarioLaboral {
    private static readonly OBJETIVO_DIARIO = 10;

    static esFinDeSemana(fecha: Date): boolean {
        const dia = fecha.getDay();
        return (dia === 0 || dia === 6);
    }

    static esFeriado(fecha: Date, feriados: FeriadoItem[]): boolean {
        return feriados.some(feriado => this.mismaFecha(fecha, feriado.fecha));
    }

    static esDiaExigible(fecha: Date, feriados: FeriadoItem[]): boolean {
        return (!this.esFinDeSemana(fecha) && !this.esFeriado(fecha, feriados)
        );
    }

    static objetivoDelDia(fecha: Date, feriados: FeriadoItem[]): number {
        return this.esDiaExigible(fecha, feriados) ? this.OBJETIVO_DIARIO : 0;
    }

    static diasLaborables(desde: Date, hasta: Date, feriados: FeriadoItem[]): number {
        let cantidad = 0;
        const actual = this.soloFecha(desde);
        const fin = this.soloFecha(hasta);
        while (actual.getTime() <= fin.getTime()) {
            if (this.esDiaExigible(actual, feriados)
            ) {
                cantidad++;
            }
            actual.setDate(actual.getDate() + 1);
        }
        return cantidad;
    }

    static objetivoPeriodo(desde: Date, hasta: Date, feriados: FeriadoItem[]): number {
        return (this.diasLaborables(desde, hasta, feriados) * this.OBJETIVO_DIARIO);
    }

    private static mismaFecha(a: Date, b: Date): boolean {
        return (a.getFullYear() === b.getFullYear() && a.getMonth() === 
        b.getMonth() && a.getDate() === b.getDate());
    }

    private static soloFecha(fecha: Date): Date {
        return new Date(
            fecha.getFullYear(),
            fecha.getMonth(),
            fecha.getDate()
        );
    }
}