import type { InventarioSemana } from "../InventarioSemana";

export type TipoPeriodo = | "SEMANA" | "MES" | "ANIO";

export interface InventarioPeriodo {
    key: string;
    label: string;
    desde: Date;
    hasta: Date;
    tipo: TipoPeriodo;
}

export class InventarioPeriodoBuilder {
    static build(semanas: InventarioSemana[], tipo: TipoPeriodo): InventarioPeriodo[] {
        switch (tipo) {
            case "SEMANA": return this.buildSemanas(semanas);            
            case "MES": return this.buildMeses(semanas);
            case "ANIO": return this.buildAnios(semanas);
            default: return [];
        }
    }
    /* SEMANAS INDIVIDUALES */
    private static buildSemanas(semanas: InventarioSemana[]): InventarioPeriodo[] {
        return semanas.map((semana, index) => ({
                key: `SEMANA-${semana.key}`,
                label: this.buildSemanaLabel(semana, semanas, index),
                desde: new Date(semana.desde),
                hasta: new Date(semana.hasta),
                tipo: "SEMANA"
            })
        );
    }
    /* MESES */
    private static buildMeses(semanas: InventarioSemana[]): InventarioPeriodo[] {
        const meses = new Map<string, InventarioPeriodo>();
        semanas.forEach(semana => {
                const year = semana.desde.getFullYear();
                const month = semana.desde.getMonth();
                const key = `${year}-${month}`;
                if (!meses.has(key)) {
                    const desde = new Date(year, month, 1);
                    const hasta = new Date(year, month + 1, 0, 23, 59, 59, 999);
                    meses.set(key,
                        {
                            key: `MES-${key}`,
                            label: this.formatMonth(desde),
                            desde,
                            hasta,
                            tipo: "MES"
                        }
                    );
                }
            }
        );
        return [...meses.values()].sort((a, b) => a.desde.getTime() - b.desde.getTime());
    }

    private static buildAnios(semanas: InventarioSemana[]): InventarioPeriodo[] {
        const anios = new Map<string, InventarioPeriodo>();
        semanas.forEach(semana => {
            const year = semana.desde.getFullYear();
            const key = String(year);
            if (!anios.has(key)) {
                anios.set(key, {
                    key: `ANIO-${year}`,
                    label: `Año ${year}`,
                    desde: new Date(year, 0, 1),
                    hasta: new Date(year, 11, 31, 23, 59, 59, 999),
                    tipo: "ANIO"
                });
            }
        });
        return [...anios.values()].sort((a, b) => a.desde.getTime() - b.desde.getTime());
    }

    /* LABEL SEMANA */
    private static buildSemanaLabel(semana: InventarioSemana, semanas: InventarioSemana[], index: number
    ): string {
        const numeroSemanaMes = semanas.slice(0, index + 1).filter(
                    item => item.desde.getMonth() === semana.desde.getMonth() &&
                        item.desde.getFullYear() === semana.desde.getFullYear()).length;
        return `${this.formatMonthName(semana.desde)} - Semana ${numeroSemanaMes}`;
    }

    /* FORMATOS */
    private static formatMonth(fecha: Date): string {
        const texto = new Intl.DateTimeFormat("es-AR", {month: "long", year: "numeric"}).format(fecha);
        return (texto.charAt(0).toUpperCase() + texto.slice(1));
    }
    private static formatMonthName(fecha: Date): string {
        const texto = new Intl.DateTimeFormat("es-AR", {month: "long"}).format(fecha);
        return (texto.charAt(0).toUpperCase() + texto.slice(1));
    }
}