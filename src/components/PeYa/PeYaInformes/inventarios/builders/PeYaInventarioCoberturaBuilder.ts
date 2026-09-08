import type { InventarioItem } from "../InventarioItem";

export interface PeYaInventarioCoberturaFiltro {
    year: number;
    mes: number | null;
}

export interface PeYaInventarioCoberturaResultado {
    totalPosiciones: number;
    posicionesInventariadas: number;
    posicionesPendientes: number;
    porcentajeCobertura: number;
    ubicacionesInventariadas: string[];
    ubicacionesPendientes: string[];
}

export class PeYaInventarioCoberturaBuilder {
    
    static build(
        inventarios: InventarioItem[],
        locations: string[],
        filtro: PeYaInventarioCoberturaFiltro
    ): PeYaInventarioCoberturaResultado {
        const universo = new Set(locations
                .map(ubicacion => ubicacion.trim().toUpperCase())
                .filter(ubicacion => ubicacion !== ""));

        const inventariosPeriodo =
            inventarios.filter(item => {
                if (
                    Number.isNaN(
                        item.fecha.getTime()
                    )
                ) {
                    return false;
                }

                if (
                    item.fecha.getFullYear() !==
                    filtro.year
                ) {
                    return false;
                }

                if (
                    filtro.mes !== null &&
                    item.fecha.getMonth() !==
                        filtro.mes
                ) {
                    return false;
                }

                return true;
            });
        const inventariadasSet = new Set<string>();

        inventariosPeriodo.forEach(item => {
            const ubicacion = item.ubicacion.trim().toUpperCase();
            /*
             * Solo contamos ubicaciones que
             * actualmente existen en Locations.
             */
            if (universo.has(ubicacion)) {
                inventariadasSet.add(
                    ubicacion
                );
            }
        });

        const ubicacionesInventariadas = [...inventariadasSet].sort((a, b) =>
                    a.localeCompare(b, undefined, { numeric: true } ) );

        const ubicacionesPendientes = [...universo].filter( ubicacion =>
                        !inventariadasSet.has(ubicacion)).sort((a, b) =>
                        a.localeCompare( b, undefined, {numeric: true}));

        const totalPosiciones = universo.size;
        const posicionesInventariadas = ubicacionesInventariadas.length;
        const posicionesPendientes = ubicacionesPendientes.length;
        const porcentajeCobertura = totalPosiciones > 0
                ? (posicionesInventariadas / totalPosiciones) * 100 : 0;

        return {
            totalPosiciones,
            posicionesInventariadas,
            posicionesPendientes,
            porcentajeCobertura,
            ubicacionesInventariadas,
            ubicacionesPendientes
        };
    }
}