import { useEffect, useRef, useState} from "react";
import { Zsappr110Reader } from "../../../../../readers/Zsappr110Reader";
import { Lx22Reader } from "../../../../../readers/Lx22Reader";
import { RenaultVaciasReader } from "../../../../../readers/RenaultVaciasReader";
import { InventarioSapBuilder } from "../builders/InventarioSapBuilder";
import { INVENTARIO_WAREHOUSES, type WarehouseInventario } from "../InventarioWarehouseConfig";
import type { InventarioSapLinea } from "../InventarioSapLinea";
import type { VaciasItem } from "../vacias/VaciasItem";

type WarehouseCache = Partial<Record<WarehouseInventario, InventarioSapLinea[]>>;
type VaciasCache = Partial<Record<WarehouseInventario,VaciasItem[]>>;

export const useInventarioSapData = (warehouse: WarehouseInventario) => {
    const [lineas, setLineas] = useState<InventarioSapLinea[]>([]);
    const [vacias, setVacias] = useState<VaciasItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const cache = useRef<WarehouseCache>({});
    const vaciasCache = useRef<VaciasCache>({});

    useEffect(() => {
        const cargar = async () => {
            try {
                setLoading(true);
                setError("");
                const config = INVENTARIO_WAREHOUSES[warehouse];
                const lineasCached = cache.current[warehouse];
                const vaciasCached = vaciasCache.current[warehouse];
                if (lineasCached && vaciasCached) {
                    setLineas(lineasCached);
                    setVacias(vaciasCached);
                    return;
                }
                const [lineasResult, vaciasResult] = await Promise.all([
                    lineasCached ? Promise.resolve(lineasCached) : Promise.all([
                        Zsappr110Reader.read(config.zsappr110FileId), Lx22Reader.read(config.lx22FileId),
                        config.zsappr110ArchivoFileId ? Zsappr110Reader.read(config.zsappr110ArchivoFileId)
                            : Promise.resolve([]), config.lx22ArchivoFileId ? Lx22Reader
                            .read(config.lx22ArchivoFileId) : Promise.resolve([])
                        ]).then(([zsappr110Actual, lx22Actual, zsappr110Archivo, lx22Archivo]) => {
                            const zsappr110 = [...zsappr110Archivo, ...zsappr110Actual];
                            const lx22 = [...lx22Archivo, ...lx22Actual];
                            return InventarioSapBuilder.build(zsappr110, lx22);
                        }),
                    vaciasCached ? Promise.resolve(vaciasCached) : RenaultVaciasReader.read(config.vaciasFileId)
                ]);
                setLineas(lineasResult);
                setVacias(vaciasResult);
                cache.current[warehouse] = lineasResult;
                vaciasCache.current[warehouse] = vaciasResult;
            } catch (err) {
                console.error("Error cargando informe:", err);
                setError(err instanceof Error ? err.message : "No fue posible cargar el informe.");
            } finally {
                setLoading(false);
            }
        };void cargar();}, [warehouse]);
    return {lineas, vacias, loading, error};
};