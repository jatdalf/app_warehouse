import type { Lx03OcupacionItem} from "../Lx03OcupacionItem";
import type {
    CompactacionCandidato,
    CompactacionResumen,
    CompactacionStorage,
    CompactacionMovimiento,
    CompactacionPropuestaUbicacion
} from "../Compactacion/CompactacionItem";
export class CompactacionBuilder {
    private static construirPropuesta(
        ubicaciones: {
            ubicacion: string;
            cantidad: number;
        }[],
        capacidad: number
    ): {
        propuesta: CompactacionPropuestaUbicacion[];
        movimientos: CompactacionMovimiento[];
    } {

        const estado =
            ubicaciones
                .map(item => ({
                    ubicacion:
                        item.ubicacion,

                    cantidadActual:
                        item.cantidad,

                    cantidadPropuesta:
                        item.cantidad
                }))
                .sort(
                    (a, b) =>
                        b.cantidadPropuesta -
                        a.cantidadPropuesta
                );


        const movimientos:
            CompactacionMovimiento[] = [];


        /*
            Intentamos vaciar primero
            las ubicaciones con menor stock.
        */

        for (
            let origenIndex =
                estado.length - 1;

            origenIndex >= 0;

            origenIndex--
        ) {

            const origen =
                estado[origenIndex];


            if (
                origen.cantidadPropuesta <= 0
            ) {
                continue;
            }


            /*
                Buscamos destinos empezando
                por los más llenos.
            */

            for (
                let destinoIndex = 0;

                destinoIndex <
                origenIndex;

                destinoIndex++
            ) {

                const destino =
                    estado[destinoIndex];


                const espacioDisponible =
                    capacidad -
                    destino.cantidadPropuesta;


                if (
                    espacioDisponible <= 0
                ) {
                    continue;
                }


                const cantidadMover =
                    Math.min(
                        origen.cantidadPropuesta,
                        espacioDisponible
                    );


                if (
                    cantidadMover <= 0
                ) {
                    continue;
                }


                destino.cantidadPropuesta +=
                    cantidadMover;


                origen.cantidadPropuesta -=
                    cantidadMover;


                movimientos.push({
                    desde:
                        origen.ubicacion,

                    hacia:
                        destino.ubicacion,

                    cantidad:
                        cantidadMover
                });


                if (
                    origen.cantidadPropuesta === 0
                ) {
                    break;
                }
            }
        }


        const propuesta =
            estado.map(item => ({

                ubicacion:
                    item.ubicacion,

                cantidadActual:
                    item.cantidadActual,

                cantidadPropuesta:
                    item.cantidadPropuesta,

                liberada:
                    item.cantidadPropuesta === 0
            }));


        return {
            propuesta,
            movimientos
        };
    }
    static build(items: Lx03OcupacionItem[]): CompactacionResumen {
        /*  Materiales agrupados por:
            STORAGE + MATERIAL */

        const grupos =
            new Map<
                string,
                Lx03OcupacionItem[]
            >();


        for (const item of items) {

            if (
                !this.esStorageFisico(
                    item.storage
                )
            ) {
                continue;
            }


            if (
                this.esUbicacionVacia(
                    item.material
                )
            ) {
                continue;
            }


            /*
                Ignoramos cantidades
                nulas o negativas.
            */

            if (item.cantidad <= 0) {
                continue;
            }


            const storage =
                item.storage
                    .trim()
                    .toUpperCase();

            const material =
                item.material
                    .trim()
                    .toUpperCase();


            const key =
                `${storage}|${material}`;


            const grupo =
                grupos.get(key) ?? [];


            grupo.push({
                ...item,
                storage,
                material
            });


            grupos.set(
                key,
                grupo
            );
        }


        const candidatos:
            CompactacionCandidato[] = [];


        /*
            Analizar cada material
        */

        for (
            const grupo of
            grupos.values()
        ) {

            /*
                Primero consolidamos por ubicación.

                Esto evita contar dos veces
                una ubicación si LX03 tiene
                más de una línea.
            */

            const cantidadesPorUbicacion =
                new Map<string, number>();


            for (const item of grupo) {

                const ubicacion =
                    item.ubicacion
                        .trim()
                        .toUpperCase();


                const actual =
                    cantidadesPorUbicacion.get(
                        ubicacion
                    ) ?? 0;


                cantidadesPorUbicacion.set(
                    ubicacion,
                    actual + item.cantidad
                );
            }


            /*
                Si sólo ocupa una ubicación,
                no hay nada que compactar.
            */

            if (
                cantidadesPorUbicacion.size <= 1
            ) {
                continue;
            }


            const ubicaciones =
                Array.from(
                    cantidadesPorUbicacion.entries()
                )
                .map(
                    (
                        [
                            ubicacion,
                            cantidad
                        ]
                    ) => ({
                        ubicacion,
                        cantidad
                    })
                )
                .sort(
                    (a, b) =>
                        b.cantidad -
                        a.cantidad
                );


            /*
                Máxima cantidad que ya observamos
                físicamente en una ubicación
                para este material/storage.
            */

            const capacidadObservada =
                Math.max(
                    ...ubicaciones.map(
                        item =>
                            item.cantidad
                    )
                );


            if (
                capacidadObservada <= 0
            ) {
                continue;
            }


            const cantidadTotal =
                ubicaciones.reduce(
                    (
                        total,
                        item
                    ) =>
                        total +
                        item.cantidad,
                    0
                );


            const ubicacionesActuales =
                ubicaciones.length;


            /*
                Mínimo TEÓRICO de ubicaciones
                utilizando la capacidad máxima
                observada.
            */

            const ubicacionesNecesarias =
                Math.ceil(
                    cantidadTotal /
                    capacidadObservada
                );


            const ubicacionesLiberables =
                ubicacionesActuales -
                ubicacionesNecesarias;

            const {propuesta, movimientos} = this.construirPropuesta(ubicaciones, capacidadObservada);
            /*
                Sólo nos interesan casos
                donde realmente exista
                oportunidad.
            */

            if (
                ubicacionesLiberables <= 0
            ) {
                continue;
            }
            candidatos.push({
            storage: grupo[0].storage,
            material: grupo[0].material,
            cantidadTotal,
            capacidadObservada,
            ubicacionesActuales,
            ubicacionesNecesarias,
            ubicacionesLiberables,
            ubicaciones,
            propuesta,
            movimientos});
        }
        /* Ordenamos primero las mejores oportunidades. */
        candidatos.sort((a, b) => {
            if (b.ubicacionesLiberables !== a.ubicacionesLiberables) {
                return (b.ubicacionesLiberables - a.ubicacionesLiberables);
            }
            return (b.ubicacionesActuales - a.ubicacionesActuales);
        });
        /* Resumen por Storage */
        const storageMap =
            new Map<
                string,
                CompactacionStorage
            >();


        for (
            const candidato of
            candidatos
        ) {

            const actual =
                storageMap.get(
                    candidato.storage
                ) ?? {
                    storage:
                        candidato.storage,

                    materialesCandidatos: 0,

                    ubicacionesLiberables: 0
                };


            actual.materialesCandidatos += 1;

            actual.ubicacionesLiberables +=
                candidato
                    .ubicacionesLiberables;


            storageMap.set(
                candidato.storage,
                actual
            );
        }


        const porStorage =
            Array.from(
                storageMap.values()
            )
            .sort(
                (a, b) =>
                    b.ubicacionesLiberables -
                    a.ubicacionesLiberables
            );


        const totalUbicacionesLiberables =
            candidatos.reduce(
                (
                    total,
                    item
                ) =>
                    total +
                    item.ubicacionesLiberables,
                0
            );


        return {

            totalMaterialesCandidatos:
                candidatos.length,

            totalUbicacionesLiberables,

            porStorage,

            candidatos
        };
    }


    private static esStorageFisico(
        storage: string
    ): boolean {

        const value =
            storage.trim();


        if (!/^\d+$/.test(value)) {
            return true;
        }


        const numero =
            Number(value);


        return !(
            numero >= 900 &&
            numero <= 999
        );
    }


    private static esUbicacionVacia(
        material: string
    ): boolean {

        return (
            material
                .trim()
                .toLocaleLowerCase("es")
                .replace(/\s+/g, " ")
            === "<< vacías >>"
        );
    }
}