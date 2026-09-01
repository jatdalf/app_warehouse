import type { EgresoItem } from "../egresos/EgresoItem";
import type { OcupacionItem } from "../ocupacion/OcupacionItem";
import type { FeriadoItem } from "../inventarios/FeriadoItem";

import { CalendarioLaboral } from "../inventarios/CalendarioLaboral";
import { EgresoBillingCalendar } from "../egresos/EgresoBillingCalendar";


export interface OcupacionDetalleLinea {
    fecha: Date;
    posiciones: number;
    capacidad: number;
    exceso: number;
}


export interface OcupacionDetalle {
    lineas: OcupacionDetalleLinea[];

    totalExceso: number;
    cantidadRegistros: number;

    promedioSobrecapacidad: number;
}


export interface EgresoDetalleLinea {
    st: string;
    sku: string;

    bultos: number;

    fechaOriginal: Date;
    fechaEntrega: Date;

    tipo:
        | "NORMAL"
        | "DOMINGO"
        | "FERIADO";

    especial: boolean;
}


export class ClaveControlDetalleBuilder {

    /* =========================================
       PALLET ADICIONAL
       ========================================= */

    static buildOcupacion(
        items: OcupacionItem[]
    ): OcupacionDetalle {

        const lineas =
            [...items]
                .sort(
                    (a, b) =>
                        a.fecha.getTime() -
                        b.fecha.getTime()
                )
                .map(item => {

                    const capacidad = 100;

                    const exceso =
                        Math.max(
                            item.posiciones -
                            capacidad,
                            0
                        );

                    return {
                        fecha: item.fecha,
                        posiciones: item.posiciones,
                        capacidad,
                        exceso
                    };
                });


        const totalExceso =
            lineas.reduce(
                (total, item) =>
                    total +
                    item.exceso,
                0
            );


        const cantidadRegistros =
            lineas.length;


        const promedioSobrecapacidad =
            cantidadRegistros > 0
                ? Math.round(
                    totalExceso /
                    cantidadRegistros
                )
                : 0;


        return {
            lineas,
            totalExceso,
            cantidadRegistros,
            promedioSobrecapacidad
        };
    }


    /* =========================================
       EGRESOS
       ========================================= */

    static buildEgresos(
        items: EgresoItem[],
        feriados: FeriadoItem[]
    ): EgresoDetalleLinea[] {

        return items.map(item => {

            /*
             * IMPORTANTE:
             * misma lógica que
             * EgresosSummaryBuilder.
             */

            const fechaEntrega =
                EgresoBillingCalendar.fechaEntrega(
                    item.fecha
                );


            const esDomingo =
                fechaEntrega.getDay() === 0;


            const esFeriado =
                CalendarioLaboral.esFeriado(
                    fechaEntrega,
                    feriados
                );


            let tipo:
                EgresoDetalleLinea["tipo"] =
                    "NORMAL";


            if (esFeriado) {
                tipo = "FERIADO";
            } else if (esDomingo) {
                tipo = "DOMINGO";
            }


            return {
                st: item.st,
                sku: item.sku,

                bultos:
                    item.bultos,

                fechaOriginal:
                    item.fecha,

                fechaEntrega,

                tipo,

                especial:
                    esDomingo ||
                    esFeriado
            };
        });
    }
}