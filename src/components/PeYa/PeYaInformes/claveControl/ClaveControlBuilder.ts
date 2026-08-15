import type { IngresoItem } from "../ingresos/IngresoItem";
import type { EgresoItem } from "../egresos/EgresoItem";
import type { OcupacionItem } from "../ocupacion/OcupacionItem";
import type { FeriadoItem } from "../inventarios/FeriadoItem";
import { IngresosSummaryBuilder } from "../ingresos/IngresosSummaryBuilder";
import { EgresosSummaryBuilder } from "../egresos/EgresosSummaryBuilder";
import { OcupacionSummaryBuilder } from "../ocupacion/OcupacionSummaryBuilder";
import type { ClaveControlSummary } from "./ClaveControlSummary";

export class ClaveControlBuilder {
    static build( 
        ingresos: IngresoItem[],
        egresos: EgresoItem[],
        ocupacion: OcupacionItem[],
        feriados: FeriadoItem[]
    ): ClaveControlSummary {

        const resumenIngresos = IngresosSummaryBuilder.build(ingresos);
        const resumenEgresos = EgresosSummaryBuilder.build(egresos, feriados);
        const resumenOcupacion = OcupacionSummaryBuilder.build(ocupacion);

        return {
            /* Cantidad de pallets recibidos */
            ingresosPallets: resumenIngresos.pallets,
            /* Tarifa estándar */
            egresoNormal: resumenEgresos.bultosNormal,
            /* Domingo / feriado */
            egresoEspecial: resumenEgresos.bultosEspecial,
            /* Promedio mensual de posiciones sobre capacidad.*/
            palletAdicional: resumenOcupacion.promedioSobrecapacidad
        };
    }
}