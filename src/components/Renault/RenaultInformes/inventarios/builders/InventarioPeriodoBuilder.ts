import type { InventarioSemana } from "../InventarioSemana";

export type TipoPeriodo =
    | "SEMANA"
    | "DOS_SEMANAS"
    | "MES";

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
            case "DOS_SEMANAS": return this.buildDosSemanas(semanas);
            case "MES": return this.buildMeses(semanas);
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
    /* DOS SEMANAS CONSECUTIVAS

     * Semana 1 + Semana 2
     * Semana 2 + Semana 3
     * Semana 3 + Semana 4
     * etc.*/
    private static buildDosSemanas(semanas: InventarioSemana[]): InventarioPeriodo[] {
        const resultado: InventarioPeriodo[] = [];
        for (let i = 0; i < semanas.length - 1; i++) {
            const primera = semanas[i];
            const segunda = semanas[i + 1];
            /* Confirmamos que sean semanas consecutivas. */
            const diferenciaDias = Math.round((segunda.desde.getTime() - primera.desde.getTime()) /
                    (1000 * 60 * 60 * 24));
            if (diferenciaDias !== 7) {
                continue;
            }
            resultado.push({
                key: `DOS-${primera.key}-${segunda.key}`,
                label: this.buildDosSemanasLabel(primera, segunda, semanas, i),
                desde: new Date(primera.desde),
                hasta: new Date(segunda.hasta),
                tipo: "DOS_SEMANAS"
            });
        }
        return resultado;
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
    /* LABEL SEMANA */
    private static buildSemanaLabel(semana: InventarioSemana, semanas: InventarioSemana[], index: number
    ): string {
        const numeroSemanaMes = semanas.slice(0, index + 1).filter(
                    item => item.desde.getMonth() === semana.desde.getMonth() &&
                        item.desde.getFullYear() === semana.desde.getFullYear()).length;
        return `${this.formatMonthName(semana.desde)} - Semana ${numeroSemanaMes}`;
    }
    /* LABEL DOS SEMANAS */
    private static buildDosSemanasLabel(
        primera: InventarioSemana,
        segunda: InventarioSemana,
        semanas: InventarioSemana[],
        indexPrimera: number): string {

        const numeroPrimera = semanas.slice(0, indexPrimera + 1)
                .filter(item => item.desde.getMonth() === primera.desde.getMonth() &&
                        item.desde.getFullYear() === primera.desde.getFullYear()).length;
        const indexSegunda = indexPrimera + 1;
        const numeroSegunda = semanas.slice(0, indexSegunda + 1).filter(item =>
                        item.desde.getMonth() === segunda.desde.getMonth() &&
                        item.desde.getFullYear() === segunda.desde.getFullYear()).length;
        /* Caso normal: ambas semanas pertenecen al mismo mes. */
        if (primera.desde.getMonth() === segunda.desde.getMonth() &&
            primera.desde.getFullYear() === segunda.desde.getFullYear()) {
            return `${this.formatMonthName(primera.desde)} - Semanas  ${numeroPrimera} y ${numeroSegunda}`;
        }
        /* Cruce entre meses.
         * Ej: Julio Semana 5 + Agosto Semana 1 */
        return `${this.formatMonthName(primera.desde)
        } Semana ${numeroPrimera} + ${this.formatMonthName(segunda.desde)} Semana ${numeroSegunda}`;
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