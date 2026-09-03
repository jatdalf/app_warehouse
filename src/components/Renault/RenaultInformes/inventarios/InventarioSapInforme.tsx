import React, {useState} from "react";
import { useFeriados } from "./hooks/useFeriados";
import { useInventarioSapData } from "./hooks/useInventarioSapData";
import InventarioSapCards from "./cards/InventarioSapCards";
import InventarioSapWeeklyChart from "./InventarioSapWeeklyChart";
import styles from "./InventarioSapInforme.module.css";
import InventarioSapDailySummary from "./Sumary/InventarioSapDailySummary";
import InventarioSapHallazgos from "./hallazgos/InventarioSapHallazgos";
import InventarioSapEstado from "./estados/InventarioSapEstado";
import LottieDataAnalisis from "../../../Lotties/LottieDataAnalisis"
import {INVENTARIO_WAREHOUSES, type WarehouseInventario} from "./InventarioWarehouseConfig";
import InventarioSapResumenCards from "./cards/InventarioSapResumenCards";
import VaciasInforme from "./vacias/VaciasInforme";
import type { TipoPeriodo } from "./builders/InventarioPeriodoBuilder";
import { useInventarioPeriodos } from "./hooks/useInventarioPeriodos";

const InventarioSapInforme: React.FC = () => {
    const feriados = useFeriados();
    const [tipoPeriodo, setTipoPeriodo] = useState<TipoPeriodo>("SEMANA");
    const [warehouse, setWarehouse] = useState<WarehouseInventario>("W1");
    const targetDiario = INVENTARIO_WAREHOUSES[warehouse].targetDiario;
    const { lineas, vacias, loading, error} = useInventarioSapData(warehouse);
    const { periodos, periodoSeleccionado, setPeriodoSeleccionado, periodo,
        periodoVisual, lineasPeriodo, lineasPeriodoCerradas
    } = useInventarioPeriodos({lineas, feriados, tipoPeriodo, targetDiario});

     /* ESTADOS DE PANTALLA */
    if (loading) {
        return (
            <div className={styles.message}>
                <LottieDataAnalisis />
                Cargando informe de inventarios...
            </div>
        );
    }
    if (error) {
        return (<div className={styles.error}>⚠️ {error}</div>);
    }

    return (
        <div className={styles.container}>
            {/* SELECTOR DE SEMANA */}
        <div className={styles.controls}>
            <label htmlFor="warehouse">Warehouse</label>
            <select id="warehouse" value={warehouse}
                onChange={e => setWarehouse(e.target.value as WarehouseInventario)} >
                <option value="W1">W1 (Rep)</option>
                <option value="W2"> W2 (BsAs)</option>
            </select>
            <label htmlFor="tipoPeriodo">Visualizar por</label>
            <select id="tipoPeriodo" value={tipoPeriodo}
                onChange={e => setTipoPeriodo(e.target.value as TipoPeriodo)}>
                <option value="SEMANA">Semana</option>
                <option value="DOS_SEMANAS">2 semanas</option>
                <option value="MES">Mes</option>
            </select>
            <label htmlFor="periodo">Período</label>
            <select id="periodo" value={periodoSeleccionado}
                onChange={e => setPeriodoSeleccionado(e.target.value)}>
                {periodos.map(item => (
                    <option key={item.key} value={item.key}>{item.label}</option>
                ))}
            </select>
        </div>
           {periodoVisual && periodo && (
            <>
                <InventarioSapResumenCards lineas={lineasPeriodoCerradas}/>
                <InventarioSapCards lineas={lineasPeriodoCerradas}/>
                <InventarioSapWeeklyChart semana={periodoVisual}/>
                <InventarioSapDailySummary semana={periodoVisual} lineas={lineasPeriodoCerradas}/>
                <InventarioSapEstado lineas={lineasPeriodo}/>
                <VaciasInforme items={vacias} desde={periodo.desde} hasta={periodo.hasta} />
                <InventarioSapHallazgos lineas={lineasPeriodoCerradas}/>
            </>
            )}
        </div>
    );
};

export default InventarioSapInforme;