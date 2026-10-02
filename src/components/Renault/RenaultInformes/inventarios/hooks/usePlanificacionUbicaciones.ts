import { useMemo, useState } from "react";
import type { Lx03OcupacionItem } from "../../ocupacion/Lx03OcupacionItem";
import type { InventarioSapLinea } from "../../inventarios/InventarioSapLinea";

export interface PlanificacionUbicacion {
    key: string;
    storage: string;
    ubicacion: string;
    materiales: string[];
    ultimoInventario: Date | null;

}

const LIMITE_FILAS = 200;

export const usePlanificacionUbicaciones = (
    lx03: Lx03OcupacionItem[],
    lineas: InventarioSapLinea[],
    target: number
) => {
    const [ubicacionesSeleccionadas, setUbicacionesSeleccionadas] =
        useState<Set<string>>(new Set());

    const [storageFiltro, setStorageFiltro] = useState("TODOS");
    const [mostrarLlenas, setMostrarLlenas] = useState(true);
    const [mostrarVacias, setMostrarVacias] = useState(true);
    const [busqueda, setBusqueda] = useState("");

    /*
     * Última fecha de inventario conocida
     * para cada posición.
     */
    const ultimaFechaPorPosicion = useMemo(() => {
        const mapa = new Map<string, Date>();

        lineas.forEach(linea => {
            const posicion =
                linea.posicion?.trim().toUpperCase();

            if (!posicion) {
                return;
            }

            const fecha =
                linea.fecha instanceof Date
                    ? linea.fecha
                    : new Date(linea.fecha);

            if (Number.isNaN(fecha.getTime())) {
                return;
            }

            const fechaActual = mapa.get(posicion);

            if (
                !fechaActual ||
                fecha.getTime() > fechaActual.getTime()
            ) {
                mapa.set(posicion, fecha);
            }
        });

        return mapa;
    }, [lineas]);

    /*
     * Construimos el universo de ubicaciones desde LX03
     * y le agregamos la última fecha de inventario.
     */
    const ubicaciones = useMemo(() => {
        const mapa =
            new Map<string, PlanificacionUbicacion>();

        lx03.forEach(item => {
            const storage = item.storage.trim();
            const ubicacion =
                item.ubicacion.trim().toUpperCase();

            if (!storage || !ubicacion) {
                return;
            }

            const key = `${storage}|${ubicacion}`;

            const material =
                item.material?.trim() ?? "";

            const existente = mapa.get(key);

            if (!existente) {
                mapa.set(key, {
                    key,
                    storage,
                    ubicacion,
                    materiales: material
                        ? [material]
                        : [],
                    ultimoInventario:
                        ultimaFechaPorPosicion.get(
                            ubicacion
                        ) ?? null,
                });

                return;
            }

            if (
                material &&
                !existente.materiales.includes(material)
            ) {
                existente.materiales.push(material);
            }
        });

        /*
         * ORDEN:
         *
         * 1. Sin registros
         * 2. Fecha más antigua
         * 3. Storage
         * 4. Ubicación
         */
        return [...mapa.values()].sort((a, b) => {
            if (
                !a.ultimoInventario &&
                b.ultimoInventario
            ) {
                return -1;
            }

            if (
                a.ultimoInventario &&
                !b.ultimoInventario
            ) {
                return 1;
            }

            if (
                a.ultimoInventario &&
                b.ultimoInventario
            ) {
                const diferencia =
                    a.ultimoInventario.getTime() -
                    b.ultimoInventario.getTime();

                if (diferencia !== 0) {
                    return diferencia;
                }
            }

            const storageCompare =
                a.storage.localeCompare(
                    b.storage,
                    undefined,
                    { numeric: true }
                );

            if (storageCompare !== 0) {
                return storageCompare;
            }

            return a.ubicacion.localeCompare(
                b.ubicacion,
                undefined,
                { numeric: true }
            );
        });
    }, [lx03, ultimaFechaPorPosicion]);

    const storages = useMemo(() => {
        return [
            ...new Set(
                ubicaciones.map(item => item.storage)
            ),
        ].sort((a, b) =>
            a.localeCompare(
                b,
                undefined,
                { numeric: true }
            )
        );
    }, [ubicaciones]);

    const esMaterialVacio = (material: string) => {
        const valor =
            material.trim().toLowerCase();

        return valor === "<< vacías >>";
    };

    const ubicacionesFiltradas = useMemo(() => {
        const texto =
            busqueda.trim().toUpperCase();

        return ubicaciones.filter(item => {
            if (
                storageFiltro !== "TODOS" &&
                item.storage !== storageFiltro
            ) {
                return false;
            }

            const estaVacia =
                item.materiales.length === 0 ||
                item.materiales.every(material =>
                    esMaterialVacio(material)
                );

            const estaLlena = !estaVacia;

            if (!mostrarLlenas && estaLlena) {
                return false;
            }

            if (!mostrarVacias && estaVacia) {
                return false;
            }

            if (!texto) {
                return true;
            }

            return (
                item.ubicacion.includes(texto) ||
                item.storage
                    .toUpperCase()
                    .includes(texto) ||
                item.materiales.some(material =>
                    material
                        .toUpperCase()
                        .includes(texto)
                )
            );
        });
    }, [
        ubicaciones,
        storageFiltro,
        busqueda,
        mostrarLlenas,
        mostrarVacias,
    ]);

    const ubicacionesVisibles = useMemo(() => {
        return ubicacionesFiltradas.slice(
            0,
            LIMITE_FILAS
        );
    }, [ubicacionesFiltradas]);

    const toggleUbicacion = (key: string) => {
        setUbicacionesSeleccionadas(actuales => {
            const siguiente =
                new Set(actuales);

            if (siguiente.has(key)) {
                siguiente.delete(key);
            } else {
                siguiente.add(key);
            }

            return siguiente;
        });
    };

    const agregarUbicaciones = (
        cantidad: number
    ) => {
        setUbicacionesSeleccionadas(actuales => {
            const nuevas = new Set(actuales);

            const disponibles =
                ubicacionesVisibles.filter(
                    item =>
                        !nuevas.has(item.key)
                );

            disponibles
                .slice(0, cantidad)
                .forEach(item =>
                    nuevas.add(item.key)
                );

            return nuevas;
        });
    };

    const seleccionarVisibles = () => {
        setUbicacionesSeleccionadas(actuales => {
            const nuevas = new Set(actuales);

            ubicacionesVisibles.forEach(item => {
                nuevas.add(item.key);
            });

            return nuevas;
        });
    };

    const completarTarget = () => {
        setUbicacionesSeleccionadas(actuales => {
            const nuevas = new Set(actuales);

            const faltantes = Math.max(
                0,
                target - nuevas.size
            );

            if (faltantes === 0) {
                return nuevas;
            }

            const disponibles =
                ubicacionesFiltradas.filter(
                    item =>
                        !nuevas.has(item.key)
                );

            disponibles
                .slice(0, faltantes)
                .forEach(item =>
                    nuevas.add(item.key)
                );

            return nuevas;
        });
    };

    const sugerirUbicaciones = () => {
        const sugeridas = ubicacionesFiltradas.slice(0, target);
        setUbicacionesSeleccionadas(new Set(sugeridas.map(item => item.key)));
    };

    const limpiarSeleccion = () => {
        setUbicacionesSeleccionadas(
            new Set()
        );
    };

    const resetearPorCambioWarehouse = () => {
        setUbicacionesSeleccionadas(
            new Set()
        );

        setStorageFiltro("TODOS");
        setBusqueda("");
    };

    const cargarSeleccion = (
        posiciones: {
            storage: string;
            ubicacion: string;
        }[]
    ) => {
        const claves = posiciones.map(
            posicion =>
                `${posicion.storage.trim()}|${posicion.ubicacion
                    .trim()
                    .toUpperCase()}`
        );

        setUbicacionesSeleccionadas(
            new Set(claves)
        );
    };

    return {
        ubicaciones,
        ubicacionesFiltradas,
        ubicacionesVisibles,
        ubicacionesSeleccionadas,
        storages,
        storageFiltro,
        setStorageFiltro,
        mostrarLlenas,
        setMostrarLlenas,
        mostrarVacias,
        setMostrarVacias,
        busqueda,
        setBusqueda,
        limiteFilas: LIMITE_FILAS,
        toggleUbicacion,
        agregarUbicaciones,
        seleccionarVisibles,
        completarTarget,
        limpiarSeleccion,
        resetearPorCambioWarehouse,
        cargarSeleccion,
        sugerirUbicaciones,
    };
};