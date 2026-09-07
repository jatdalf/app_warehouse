import { useEffect, useRef, useState } from "react";
import { PeYaInventariosReader } from "../../../../../readers/PeYaInventariosReader";
import { PeYaFeriadosReader } from "../../../../../readers/PeYaFeriadosReader";
import type { InventarioItem } from "../InventarioItem";
import type { FeriadoItem } from "../FeriadoItem";
import { PEYA_INVENTARIOS_MESES, PEYA_LOCATIONS_FILE_ID } from "../PeYaInventariosConfig";
import { PeYaLocationsReader } from "../../../../../readers/PeYaLocationsReader";

type InventariosMesCache = Record<
    string,
    {
        items: InventarioItem[];
        createdAt: Date | null;
    }
>;

export const usePeYaInventariosData = () => {
    const [inventarios, setInventarios] = useState<InventarioItem[]>([]);
    const [feriados, setFeriados] = useState<FeriadoItem[]>([]);
    const [fechaActualizacion, setFechaActualizacion] = useState<Date | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [locations, setLocations] = useState<string[]>([]);
    const inventariosCache = useRef<InventariosMesCache>({});
    const feriadosCache = useRef<FeriadoItem[] | null>(null);
    const locationsCache = useRef<string[] | null>(null);

    useEffect(() => {
        let cancelado = false;
        const cargarMes = async (mes: string) => {
            const cached = inventariosCache.current[mes];
            if (cached) {
                return cached;
            }
            const config = PEYA_INVENTARIOS_MESES[mes];
            if (!config) {
                return {
                    items: [],
                    createdAt: null
                };
            }
            const fileId = config.inventariosFileId;
            if (!fileId) {
                return {
                    items: [],
                    createdAt: null
                };
            }
            const resultado = await PeYaInventariosReader.read(fileId);
            inventariosCache.current[mes] = resultado;
            return resultado;
        };
        const cargarFeriados = async () => {
            if (feriadosCache.current) {
                return feriadosCache.current;
            }
            const resultado = await PeYaFeriadosReader.read();
            feriadosCache.current = resultado;
            return resultado;
        };
        const cargarLocations = async () => {
            if (locationsCache.current) {
                return locationsCache.current;
            }
            const resultado = await PeYaLocationsReader.read(PEYA_LOCATIONS_FILE_ID);
            locationsCache.current = resultado;
            return resultado;
        };
        const cargar = async () => {
            try {
                setLoading(true);
                setError("");
                setInventarios([]);
                const meses = Object.keys(PEYA_INVENTARIOS_MESES).sort();
                const mesesConArchivo = meses.filter(
                        mes => PEYA_INVENTARIOS_MESES[mes].inventariosFileId !== null);
                if (mesesConArchivo.length === 0) {
                    throw new Error("No hay archivos de inventarios configurados.");
                }
                const [feriadosData, locationsData] = await Promise.all([
                    cargarFeriados(), cargarLocations()]);
                if (cancelado) {
                    return;
                }
                setFeriados(feriadosData);
                setLocations(locationsData);
                /* MES MÁS RECIENTE */
                const mesActual = mesesConArchivo[mesesConArchivo.length - 1];
                const inventariosActuales = await cargarMes(mesActual);
                if (cancelado) {
                    return;
                }
                setInventarios(inventariosActuales.items);
                setFechaActualizacion(inventariosActuales.createdAt);
                setLoading(false);
                /*
                 * HISTÓRICO
                 * EN SEGUNDO PLANO
                 */
                const mesesHistoricos =
                    mesesConArchivo
                        .slice(0, -1)
                        .reverse();

                for (
                    const mes
                    of mesesHistoricos
                ) {
                    if (cancelado) {
                        return;
                    }
                    try {
                        const resultado = await cargarMes(mes);
                        if (cancelado) {
                            return;
                        }
                        setInventarios(actuales => [...resultado.items, ...actuales]);
                    } catch (err) {
                        console.error(`Error cargando inventarios PeYa ${mes}:`, err);
                    }
                }
            } catch (err) {
                if (cancelado) {
                    return;
                }
                console.error("Error cargando inventarios PeYa:", err);
                setError(err instanceof Error
                        ? err.message : "No fue posible cargar los datos de inventarios.");
                setLoading(false);
            }
        };
        void cargar();
        return () => { cancelado = true; };
    }, []);
    return {inventarios, feriados,locations, fechaActualizacion, loading, error};
};