import { useEffect, useRef, useState } from "react";
import { Zsappr110Reader } from "../../../../../readers/Zsappr110Reader";
import { Lx22Reader } from "../../../../../readers/Lx22Reader";
import { RenaultVaciasReader } from "../../../../../readers/RenaultVaciasReader";
import { InventarioSapBuilder } from "../builders/InventarioSapBuilder";
import { INVENTARIO_WAREHOUSES, type WarehouseInventario } from "../InventarioWarehouseConfig";
import type { InventarioSapLinea } from "../InventarioSapLinea";
import type { VaciasItem } from "../vacias/VaciasItem";
import { Lx03OcupacionReader } from "../../../../../readers/Lx03OcupacionReader";
import type { Lx03OcupacionItem } from "../../ocupacion/Lx03OcupacionItem";

type MesCache = Record<string, InventarioSapLinea[]>;
type VaciasCache = Partial<Record<WarehouseInventario, VaciasItem[]>>;
type Lx03Cache = Partial<Record<WarehouseInventario, Lx03OcupacionItem[]>>;

export const useInventarioSapData = (warehouse: WarehouseInventario) => {
    const [lineas, setLineas] = useState<InventarioSapLinea[]>([]);
    const [vacias, setVacias] = useState<VaciasItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [mesIncorporado, setMesIncorporado] = useState<string | null>(null);
    const [historicoDesdeCache, setHistoricoDesdeCache] = useState(false);
    /* CACHE POR MES  */
    const cache = useRef<MesCache>({});
    const vaciasCache = useRef<VaciasCache>({});
    const [lx03, setLx03] = useState<Lx03OcupacionItem[]>([]);
    const lx03Cache = useRef<Lx03Cache>({});

    useEffect(() => {
        let cancelado = false;
        const cargarMes = async (mes: string): Promise<InventarioSapLinea[]> => {
            const cacheKey = `${warehouse}-${mes}`;
            const cached = cache.current[cacheKey];
            if (cached) {
                return cached;
            }
            const config = INVENTARIO_WAREHOUSES[warehouse];
            const archivos = config.meses[mes];
            if (!archivos) {
                return [];
            }
            const [zsappr110, lx22] =
                await Promise.all([Zsappr110Reader.read( archivos.zsappr110FileId ),
                    Lx22Reader.read( archivos.lx22FileId )]);
            const resultado = InventarioSapBuilder.build(zsappr110, lx22);
            cache.current[cacheKey] = resultado;
            return resultado;
        };
        
        const cargar = async () => {
            try {
                setLoading(true);
                setError("");
                setLineas([]);
                setMesIncorporado(null);  
                setHistoricoDesdeCache(false);
                const config = INVENTARIO_WAREHOUSES[warehouse];
                const meses = Object.keys(config.meses).sort();
                if (meses.length === 0) {
                    throw new Error("No hay meses configurados para este warehouse.");
                }
                const todosLosMesesEnCache = meses.every(mes => {
                    const cacheKey = `${warehouse}-${mes}`;
                    return !!cache.current[cacheKey];});
                const mesActual = meses[meses.length - 1];
                if (todosLosMesesEnCache) {
                    const lineasCached = meses.flatMap(mes => {
                        const cacheKey = `${warehouse}-${mes}`;
                        return (cache.current[cacheKey] ?? []);});
                    const vaciasCached = vaciasCache.current[warehouse];
                    const lx03Cached = lx03Cache.current[warehouse];
                    setLineas(lineasCached);
                    if (vaciasCached) {
                        setVacias(vaciasCached);
                    }
                    if (lx03Cached) {
                        setLx03(lx03Cached);
                    }
                    setHistoricoDesdeCache(true);
                    setLoading(false);
                    return;
                }
                const vaciasCached = vaciasCache.current[warehouse];
                const lx03Cached = lx03Cache.current[warehouse];
                const [lineasActuales, vaciasResult, lx03Result] = await Promise.all([
                cargarMes(mesActual), vaciasCached ? Promise.resolve(vaciasCached) : 
                RenaultVaciasReader.read(config.vaciasFileId), lx03Cached ? Promise.resolve(
                lx03Cached) : Lx03OcupacionReader.read(config.lx03FileId)]);
                if (cancelado) {
                    return;
                }
                vaciasCache.current[warehouse] = vaciasResult;
                lx03Cache.current[warehouse] = lx03Result;
                setLineas(lineasActuales);
                setVacias(vaciasResult);
                setLx03(lx03Result);
                setLoading(false);
                setMesIncorporado(mesActual);
                /* =================================
                 * HISTÓRICO EN SEGUNDO PLANO
                 * =================================
                 *
                 * Sacamos el último mes
                 * y recorremos hacia atrás.
                 *
                 * agosto
                 * julio
                 * junio
                 * ...
                 */
                const mesesHistoricos = meses.slice(0, -1).reverse();
                for (const mes of mesesHistoricos) {
                    if (cancelado) {
                        return;
                    }
                    try {
                        const lineasMes = await cargarMes(mes);
                        if (cancelado) {
                            return;
                        }
                        setLineas(actuales => [...lineasMes, ...actuales, ]);
                        setMesIncorporado(mes);
                    } catch (err) {
                        console.error(`Error cargando ${warehouse} ${mes}:`, err);
                    }
                }
            } catch (err) {
                if (cancelado) {
                    return;
                }
                console.error("Error cargando informe:", err);
                setError(err instanceof Error ? err.message : "No fue posible cargar el informe." );
                setLoading(false);
            }
        };
        void cargar();
        return () => {
            cancelado = true;
        };
    }, [warehouse]);
    return { lineas, vacias, lx03, loading, error, mesIncorporado, historicoDesdeCache };
};