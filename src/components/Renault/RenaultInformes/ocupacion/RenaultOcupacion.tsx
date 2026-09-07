import { useEffect, useRef, useState } from "react";
import LottieDataAnalisis from "../../../Lotties/LottieCompactar";
import OcupacionResumenCards from "./cards/OcupacionResumenCards";
import OcupacionStorageTable from "./cards/OcupacionStorageTable";
import { Lx03OcupacionReader } from "../../../../readers/Lx03OcupacionReader";
import { AlmacenesReader } from "../../../../readers/AlmacenesReader";
import { OcupacionBuilder, type OcupacionResumen} from "./builders/OcupacionBuilder";
import { CompactacionBuilder } from "./builders/CompactacionBuilder";
import type { CompactacionResumen } from "./Compactacion/CompactacionItem";
import CompactacionResumenCards from "./cards/CompactacionResumenCards";
import styles from "./RenaultOcupacion.module.css";
import type {AlmacenItem} from "./AlmacenItem";
import OcupacionRenaultHeader from "./Header/OcupacionRenaultHeader";
import { useRenaultAuth } from "../../../../components/hooks/useRenaultAuth";
import { RenaultOcupacionLogin } from "../../Loguin/RenaultOcupacionLogin";
import { INVENTARIO_WAREHOUSES } from "../inventarios/InventarioWarehouseConfig";

type Warehouse = "W1" | "W2";

const ALMACENES_FILE_ID = "1ZRPxkVmnJDQYNuAZp0SVTIVHeSm1Wsmx";

const RenaultOcupacion = () => {
    const { authenticated, login } = useRenaultAuth();
    const [warehouse, setWarehouse] = useState<Warehouse>("W1");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [ocupacion, setOcupacion] = useState<OcupacionResumen | null>(null);
    const [compactacion, setCompactacion] = useState<CompactacionResumen | null>(null);
    const [cache, setCache] = useState
    <Partial<Record<Warehouse, {ocupacion: OcupacionResumen; compactacion: CompactacionResumen;}>>>({});
    const almacenesCache = useRef<AlmacenItem[] | null>(null);
        
    useEffect(() => {
        const cargar = async () => {
            try {
                setError("");
                const cached = cache[warehouse];
                if (cached) {
                    setOcupacion(cached.ocupacion);
                    setCompactacion(cached.compactacion);
                    setLoading(false);
                    return;
                }setLoading(true);
                const lx03 = await Lx03OcupacionReader.read(INVENTARIO_WAREHOUSES[warehouse].lx03FileId);
                let almacenes = almacenesCache.current;
                if (!almacenes) {
                    almacenes = await AlmacenesReader.read(ALMACENES_FILE_ID);
                    almacenesCache.current = almacenes;
                }
                const resultado = OcupacionBuilder.build(lx03, almacenes);
                const resultadoCompactacion = CompactacionBuilder.build(lx03);
                setOcupacion(resultado);
                setCompactacion(resultadoCompactacion );
                setCache(actual => ({...actual, [warehouse]: {
                        ocupacion: resultado,
                        compactacion: resultadoCompactacion
                    }
                }));
            } catch (err) {
                console.error("Error cargando ocupación:", err);
                setError(err instanceof Error ? err.message : "No fue posible cargar el informe.");
            } finally {
                setLoading(false);
            }
        };
        void cargar();
    }, [warehouse]);
        if (!authenticated) {
        return <RenaultOcupacionLogin onLogin={login} />;
    }

    return (
        <div>
            <OcupacionRenaultHeader />
            <div className={styles.warehouseSelector}>
                <button type="button" className={warehouse === "W1" ? styles.warehouseActive : styles.warehouseButton}
                    onClick={() => setWarehouse("W1")}>
                    W1 · REP
                </button>

                <button type="button" className={warehouse === "W2" ? styles.warehouseActive : styles.warehouseButton}
                    onClick={() => setWarehouse("W2")}>
                    W2 · BsAs
                </button>
            </div>

            {loading ? (
                <div className={styles.loading}>
                    <LottieDataAnalisis />
                    <p> Analizando ocupación{" "} {warehouse}... </p>
                </div>
            ) : error ? (
                <div className={styles.error}>
                    {error}
                </div>
            ) : ocupacion && compactacion ? (
                <>
                    <OcupacionResumenCards resumen={ocupacion} />
                    <OcupacionStorageTable 
                        items={ocupacion.porStorage}
                        compactacion={compactacion.porStorage}
                        candidatos={compactacion.candidatos}
                        warehouse={warehouse} />
                    <CompactacionResumenCards resumen={compactacion}/>
                </>
            ) : null}
        </div>
    );
};

export default RenaultOcupacion;
