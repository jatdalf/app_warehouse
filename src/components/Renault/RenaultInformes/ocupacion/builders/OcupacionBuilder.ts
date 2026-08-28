import type { Lx03OcupacionItem } from "../Lx03OcupacionItem";
import type { AlmacenItem } from "../AlmacenItem";

export interface OcupacionStorage {
    storage: string;
    descripcion: string;

    totalUbicaciones: number;
    ocupadas: number;
    libres: number;

    porcentajeOcupacion: number;
    porcentajeLibre: number;
}

export interface OcupacionResumen {
    totalUbicaciones: number;
    ocupadas: number;
    libres: number;

    porcentajeOcupacion: number;
    porcentajeLibre: number;

    porStorage: OcupacionStorage[];
}

export class OcupacionBuilder {

    static build(
        items: Lx03OcupacionItem[],
        almacenes: AlmacenItem[]
    ): OcupacionResumen {

        /*
            1. Crear mapa de descripciones
        */

        const descripcionPorStorage =
            new Map<string, string>();

        for (const almacen of almacenes) {

            const key =
                almacen.storage
                    .trim()
                    .toUpperCase();

            descripcionPorStorage.set(
                key,
                almacen.descripcion
            );
        }


        /*
            2. Excluir almacenes virtuales
               900 ... 999
        */

        const fisicos =
            items.filter(
                item =>
                    this.esStorageFisico(
                        item.storage
                    )
            );


        /*
            3. Consolidar ubicaciones únicas
        */

        const ubicaciones =
            new Map<
                string,
                {
                    storage: string;
                    ubicacion: string;
                    ocupada: boolean;
                }
            >();


        for (const item of fisicos) {

            const storage =
                item.storage
                    .trim()
                    .toUpperCase();

            const ubicacion =
                item.ubicacion
                    .trim()
                    .toUpperCase();

            const key =
                this.buildUbicacionKey(
                    storage,
                    ubicacion
                );


            const esVacia =
                this.esUbicacionVacia(
                    item.material
                );


            const existente =
                ubicaciones.get(key);


            /*
                Primera aparición
            */

            if (!existente) {

                ubicaciones.set(
                    key,
                    {
                        storage,
                        ubicacion,
                        ocupada: !esVacia
                    }
                );

                continue;
            }


            /*
                Si aparece material real,
                la ubicación se considera ocupada
            */

            if (!esVacia) {
                existente.ocupada = true;
            }
        }


        /*
            4. Agrupar por storage
        */

        const storageMap =
            new Map<
                string,
                {
                    total: number;
                    ocupadas: number;
                    libres: number;
                }
            >();


        for (
            const ubicacion of
            ubicaciones.values()
        ) {

            const actual =
                storageMap.get(
                    ubicacion.storage
                ) ?? {
                    total: 0,
                    ocupadas: 0,
                    libres: 0
                };


            actual.total += 1;


            if (ubicacion.ocupada) {
                actual.ocupadas += 1;
            } else {
                actual.libres += 1;
            }


            storageMap.set(
                ubicacion.storage,
                actual
            );
        }


        /*
            5. Armar detalle por storage
        */

        const porStorage:
            OcupacionStorage[] =
            Array
                .from(
                    storageMap.entries()
                )
                .map(
                    (
                        [
                            storage,
                            datos
                        ]
                    ) => {

                        const descripcion =
                            descripcionPorStorage.get(
                                storage
                            )
                            ?? "Sin descripción";


                        return {
                            storage,
                            descripcion,

                            totalUbicaciones:
                                datos.total,

                            ocupadas:
                                datos.ocupadas,

                            libres:
                                datos.libres,

                            porcentajeOcupacion:
                                this.calcularPorcentaje(
                                    datos.ocupadas,
                                    datos.total
                                ),

                            porcentajeLibre:
                                this.calcularPorcentaje(
                                    datos.libres,
                                    datos.total
                                )
                        };
                    }
                )
                .sort(
                    (a, b) =>
                        a.storage.localeCompare(
                            b.storage,
                            "es",
                            {
                                numeric: true
                            }
                        )
                );


        /*
            6. Totales generales
        */

        const totalUbicaciones =
            porStorage.reduce(
                (
                    total,
                    item
                ) =>
                    total +
                    item.totalUbicaciones,
                0
            );


        const ocupadas =
            porStorage.reduce(
                (
                    total,
                    item
                ) =>
                    total +
                    item.ocupadas,
                0
            );


        const libres =
            porStorage.reduce(
                (
                    total,
                    item
                ) =>
                    total +
                    item.libres,
                0
            );


        return {
            totalUbicaciones,

            ocupadas,

            libres,

            porcentajeOcupacion:
                this.calcularPorcentaje(
                    ocupadas,
                    totalUbicaciones
                ),

            porcentajeLibre:
                this.calcularPorcentaje(
                    libres,
                    totalUbicaciones
                ),

            porStorage
        };
    }


    private static esStorageFisico(
        storage: string
    ): boolean {

        const value =
            storage.trim();


        /*
            Sólo excluimos storage
            completamente numérico
        */

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

        const normalizado =
            material
                .trim()
                .toLocaleLowerCase("es")
                .replace(/\s+/g, " ");


        return (
            normalizado ===
            "<< vacías >>"
        );
    }


    private static buildUbicacionKey(
        storage: string,
        ubicacion: string
    ): string {

        return [
            storage
                .trim()
                .toUpperCase(),

            ubicacion
                .trim()
                .toUpperCase()
        ].join("|");
    }


    private static calcularPorcentaje(
        valor: number,
        total: number
    ): number {

        if (total === 0) {
            return 0;
        }


        return (
            valor /
            total
        ) * 100;
    }
}