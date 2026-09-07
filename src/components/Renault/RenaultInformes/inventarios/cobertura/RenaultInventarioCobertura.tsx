import { useEffect, useMemo, useState } from "react";
import { useInventarioSapData } from "../hooks/useInventarioSapData";
import { InventarioCoberturaBuilder } from "../builders/InventarioCoberturaBuilder";
import type { WarehouseInventario } from "../InventarioWarehouseConfig";
import CoberturaResumenCards from "../cards/CoberturaResumenCards";
import CoberturaDonut from "./CoberturaDonut";
import styles from "./RenaultInventarioCobertura.module.css";
import CoberturaStorageTable from "./CoberturaStorageTable";
import CoberturaPendientesDetail from "./CoberturaPendientesDetail";


const RenaultInventarioCobertura = () => {
    const [mes, setMes] = useState<number | null>(null);
    const [storage, setStorage] = useState<string | null>(null);
    const [warehouse, setWarehouse] = useState<WarehouseInventario>("W1");
    const { lineas, lx03, loading, error } = useInventarioSapData(warehouse);
    const [mostrarPendientes, setMostrarPendientes] = useState(false);

    const cobertura = useMemo(() => {
        return InventarioCoberturaBuilder.build(lineas, lx03, {year: 2026, mes, storage});
    }, [lineas, lx03, mes, storage]);

    const storages = useMemo(() => {
        return cobertura.resumenPorStorage
            .filter(item => item.totalPosiciones > 0)
            .map(item => ({
                storage: item.storage,
                totalPosiciones: item.totalPosiciones
            }))
            .sort((a, b) =>
                a.storage.localeCompare(
                    b.storage,
                    undefined,
                    {
                        numeric: true
                    }
                )
            );
    }, [cobertura]);

    useEffect(() => {
        if (!storage) {
            return;
        }

        const existe =
            storages.some(
                item =>
                    item.storage === storage
            );

        if (!existe) {
            setStorage(null);
        }
    }, [storage, storages]);

    const tituloPeriodo = mes === null ? "relevado anual acumulado 2026" : "relevado mensual 2026";
    if (!loading && !error && mostrarPendientes) {
    return (
            <CoberturaPendientesDetail
                items={cobertura.pendientes}
                warehouse={warehouse}
                mes={mes}
                storage={storage}
                onVolver={() => setMostrarPendientes(false)
                }
            />
        );
    }

    return (
    <div className={styles.page}>

        <div className={styles.topBar}>
            <h2 className={styles.title}>🧾🖋️ Ubicaciones inventariadas</h2>
            <div className={styles.topSpacer} />
        </div>

        <div className={styles.controls}>
            <label className={styles.controlGroup}>
                <span>Warehouse</span>
                <select
                    className={styles.select}
                    value={warehouse}
                    onChange={event => {
                        setWarehouse(event.target.value as WarehouseInventario);
                        setStorage(null);
                    }}
                >
                    <option value="W1">W1 (Rep)</option>
                    <option value="W2">W2 (BsAs)</option>
                </select>
            </label>
            <label className={styles.controlGroup}>
                <span>Visualizar</span>
                <select
                    className={styles.select}
                    value={mes === null ? "ANUAL" : String(mes)}
                    onChange={event => {
                        const value = event.target.value;
                        setMes(value === "ANUAL" ? null : Number(value));
                    }}
                >
                    <option value="ANUAL">Año acumulado</option>
                    <option value="2">Marzo</option>
                    <option value="3">Abril</option>
                    <option value="4">Mayo</option>
                    <option value="5">Junio</option>
                    <option value="6">Julio</option>
                    <option value="7">Agosto</option>
                    <option value="8">Septiembre</option>
                </select>
            </label>

            <label className={styles.controlGroup}>
                <span>Storage</span>
                <select
                    className={styles.select}
                    value={storage ?? "TODOS"}
                    onChange={event => {
                        const value = event.target.value;
                        setStorage(value === "TODOS" ? null : value);
                }}>
                    <option value="TODOS">Todos los storages</option>
                    {storages.map(item => (
                        <option key={item.storage} value={item.storage}>
                            {item.storage}
                            {" "}
                            ({item.totalPosiciones} posiciones)
                        </option>
                    ))}
                </select>
            </label>
        </div>
        {loading ? (
            <div className={styles.message}>
                Analizando cobertura...
            </div>
        ) : error ? (
            <div className={styles.error}>
                {error}
            </div>
        ) : (
            <main className={styles.content}>
                <div className={styles.sectionHeader}>
                    <h2 className={styles.sectionTitle}>{tituloPeriodo}</h2>
                    <p className={styles.availableData}>
                        Datos disponibles: marzo → septiembre
                    </p>
                </div>
                <CoberturaResumenCards
                    totalPosiciones={cobertura.totalPosiciones}
                    posicionesInventariadas={cobertura.posicionesInventariadas}
                    posicionesPendientes={cobertura.posicionesPendientes}
                    porcentajeCobertura={cobertura.porcentajeCobertura}
                    onPendientesClick={() => setMostrarPendientes(true)}/>
                <CoberturaDonut
                    inventariadas={cobertura.posicionesInventariadas}
                    pendientes={cobertura.posicionesPendientes}
                    porcentajeCobertura={cobertura.porcentajeCobertura}
                    onPendientesClick={() => setMostrarPendientes(true)}/>                    
                <CoberturaStorageTable items={cobertura.resumenPorStorage}/>
            </main>          
        )}
    </div>
    );
};

export default RenaultInventarioCobertura;