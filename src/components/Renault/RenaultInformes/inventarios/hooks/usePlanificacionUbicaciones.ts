import { useMemo, useState } from "react";
import type { Lx03OcupacionItem } from "../../ocupacion/Lx03OcupacionItem";

export interface PlanificacionUbicacion {
    key: string;
    storage: string;
    ubicacion: string;
    materiales: string[];
}

const LIMITE_FILAS = 200;

export const usePlanificacionUbicaciones = (
    lx03: Lx03OcupacionItem[],
    target: number
) => {
    const [ubicacionesSeleccionadas, setUbicacionesSeleccionadas] = useState<Set<string>>(new Set());
    const [storageFiltro, setStorageFiltro] = useState("TODOS");
    const [mostrarLlenas, setMostrarLlenas] = useState(true);
    const [mostrarVacias, setMostrarVacias] = useState(true);
    const [busqueda, setBusqueda] = useState("");
    const ubicaciones = useMemo(() => {
        const mapa = new Map<string, PlanificacionUbicacion>();
        lx03.forEach(item => {
            const storage = item.storage.trim();
            const ubicacion = item.ubicacion.trim().toUpperCase();
            if (!storage || !ubicacion) {
                return;
            }
            const key = `${storage}|${ubicacion}`;
            const existente = mapa.get(key);
            if (!existente) {
                mapa.set(key, {
                    key,
                    storage,
                    ubicacion,
                    materiales: item.material ? [item.material.trim()] : []
                });
                return;
            }
            const material = item.material.trim();
            if (material && !existente.materiales.includes(material)) {
                existente.materiales.push(material);
            }
        });

        return [...mapa.values()].sort((a, b) => {
            const storageCompare = a.storage.localeCompare(b.storage, undefined, { numeric: true });
            if (storageCompare !== 0) {
                return storageCompare;
            }
            return a.ubicacion.localeCompare(b.ubicacion, undefined, { numeric: true });
        });
    }, [lx03]);

    const storages = useMemo(() => {
        return [...new Set(ubicaciones.map(item => item.storage))].sort((a, b) =>
            a.localeCompare(b, undefined, { numeric: true }));
    }, [ubicaciones]);

    const esMaterialVacio = (material: string) => {
        const valor = material.trim().toLowerCase();
        return valor === "<< vacías >>";
    };

    const ubicacionesFiltradas = useMemo(() => {
        const texto = busqueda.trim().toUpperCase();
        return ubicaciones.filter(item => {
            if (storageFiltro !== "TODOS" && item.storage !== storageFiltro) {
                return false;
            }
            const estaVacia = item.materiales.length === 0 ||
                item.materiales.every(material => esMaterialVacio(material));
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
            return (item.ubicacion.includes(texto) || item.storage.toUpperCase().includes(texto) ||
                item.materiales.some(material => material.toUpperCase().includes(texto)));
        });
    }, [ubicaciones, storageFiltro, busqueda, mostrarLlenas, mostrarVacias]);

    const ubicacionesVisibles = useMemo(() => {
        return ubicacionesFiltradas.slice(0, LIMITE_FILAS);
    }, [ubicacionesFiltradas]);

    const toggleUbicacion = (key: string) => {
        setUbicacionesSeleccionadas(actuales => {
            const siguiente = new Set(actuales);
            if (siguiente.has(key)) {
                siguiente.delete(key);
            } else {
                siguiente.add(key);
            }
            return siguiente;
        });
    };

    const agregarUbicaciones = (cantidad: number) => {
        setUbicacionesSeleccionadas(actuales => {
            const nuevas = new Set(actuales);
            const disponibles = ubicacionesVisibles.filter(item => !nuevas.has(item.key));
            disponibles.slice(0, cantidad).forEach(item => nuevas.add(item.key));
            return nuevas;
        });
    };

    const seleccionarVisibles = () => {
        setUbicacionesSeleccionadas(actuales => {
            const nuevas = new Set(actuales);
            ubicacionesVisibles.forEach(item => {nuevas.add(item.key);});
            return nuevas;
        });
    };

    const completarTarget = () => {
        setUbicacionesSeleccionadas(actuales => {
            const nuevas = new Set(actuales);
            const faltantes = Math.max(0, target - nuevas.size);
            if (faltantes === 0) {
                return nuevas;
            }
            const disponibles = ubicacionesFiltradas.filter(item => !nuevas.has(item.key));
            disponibles.slice(0, faltantes).forEach(item => nuevas.add(item.key));
            return nuevas;
        });
    };

    const limpiarSeleccion = () => {
        setUbicacionesSeleccionadas(new Set());
    };

    const resetearPorCambioWarehouse = () => {
        setUbicacionesSeleccionadas(new Set());
        setStorageFiltro("TODOS");
        setBusqueda("");
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
        resetearPorCambioWarehouse
    };
};