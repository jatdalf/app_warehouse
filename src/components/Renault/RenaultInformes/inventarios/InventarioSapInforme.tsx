import { GestionMeses, RegistroEntrega, IconoAccion } from "./InventarioAcciones";
import React, { useMemo, useState } from "react";
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
import InventarioSapDetalleTipo from "./detalle/InventarioSapDetalleTipo";
import { VaciasSapBuilder } from "./builders/VaciasSapBuilder";
import ReingenieriaInforme from "./reingenieria/ReingenieriaInforme";


const InventarioSapInforme: React.FC = () => {
    const feriados = useFeriados();
    const [tipoPeriodo, setTipoPeriodo] = useState<TipoPeriodo>("SEMANA");
    const [warehouse, setWarehouse] = useState<WarehouseInventario>("W1");
    const targetDiario = INVENTARIO_WAREHOUSES[warehouse].targetDiario;
    const [selecciones, setSelecciones] = useState<Partial<Record<WarehouseInventario, string[]>>>({});
    const meses = useMemo(() => Object.keys(INVENTARIO_WAREHOUSES[warehouse].meses).sort(), [warehouse]);
    const mesesElegidos = useMemo(() => selecciones[warehouse] ?? meses.slice(-2), [warehouse, meses, selecciones]);
    const { documentos, lineas, vacias, loading, reingenieria, error } = useInventarioSapData(warehouse, mesesElegidos);
    const { periodos, periodoSeleccionado, setPeriodoSeleccionado, periodo,
        periodoVisual, lineasPeriodo, lineasPeriodoCerradas, mesesPeriodo
    } = useInventarioPeriodos({lineas, feriados, tipoPeriodo, targetDiario});
  

const vaciasCombinadas = useMemo(() => [...vacias, ...VaciasSapBuilder.build(lineas),],[vacias, lineas],);
     /* ESTADOS DE PANTALLA */
    if (loading) {
        return (
            <div className={styles.message}>
                <LottieDataAnalisis />
                Cargando informe de inventarios...
            </div>
        );
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
                <option value="MES">Mes</option>
                <option value="ANIO">Año</option>
            </select>
            <label htmlFor="periodo">Período</label>
            <select id="periodo" value={periodoSeleccionado}
                onChange={e => setPeriodoSeleccionado(e.target.value)}>
                {periodos.map(item => (
                    <option key={item.key} value={item.key}>{item.label}</option>
                ))}
            </select>
            <GestionMeses key={warehouse} warehouse={warehouse} meses={meses} seleccion={mesesElegidos}
                aplicar={nuevos => setSelecciones(prev => ({ ...prev, [warehouse]: nuevos }))} />
        </div>
        {/* <p>Meses incluidos: {mesesElegidos.join(" · ")}. Los totales solo abarcan los meses cargados.</p> */}
           {error && <p className={styles.error} role="alert">{error}</p>}
           {!error && periodoVisual && periodo && (
            <>
            
                <InventarioSapResumenCards lineas={lineasPeriodoCerradas}/>
                <InventarioSapCards lineas={lineasPeriodoCerradas}/>
            
<div className={styles.actionsButtonHolder}>
<RegistroEntrega key={warehouse} documentos={documentos} warehouse={warehouse} />               
<button type="button" className={styles.coverageButton} onClick={() =>
        window.open("/RenaultInformes/inventarios/cobertura", "_blank") }>
    <IconoAccion tipo="avance"/>
    <span className={styles.coverageButtonContent}>
        <strong>Ver avance de inventarios</strong>
        <small>Cobertura anual y por storage</small>
    </span>
    <span className={styles.coverageButtonArrow}>↗</span>
</button>
<button type="button" className={styles.printButton} onClick={() => window.print()}>
    <IconoAccion tipo="impresora"/><span className={styles.coverageButtonContent}><strong>Imprimir informe en PDF</strong><small>Resumen de inventarios</small></span>
</button>
</div> 
            <div className={styles.printSection}>
                <InventarioSapWeeklyChart semana={periodoVisual} tipoPeriodo={tipoPeriodo} mesesPeriodo={mesesPeriodo}/>
            </div> 
            <div className={styles.printSection}>
                <InventarioSapDailySummary semana={periodoVisual} lineas={lineasPeriodoCerradas}/>
            </div>
            <div className={styles.printSection}>
                <InventarioSapDetalleTipo lineas={lineasPeriodoCerradas}/>
            </div>
            <div className={styles.printSection}>
                <InventarioSapEstado lineas={lineasPeriodo}/>
            </div>
            <div className={styles.printSection}>
                <VaciasInforme items={vaciasCombinadas} desde={periodo.desde} hasta={periodo.hasta}/>
            </div>
            <div className={styles.printSection}>
                <ReingenieriaInforme data={reingenieria} desde={periodo.desde} hasta={periodo.hasta}/>
            </div>
                <InventarioSapHallazgos lineas={lineasPeriodoCerradas}/>
            </>
            )}
        </div>
    );
};

export default InventarioSapInforme;