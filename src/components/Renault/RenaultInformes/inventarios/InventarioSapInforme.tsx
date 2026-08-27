import React, {useEffect, useMemo, useRef, useState} from "react";
import { Zsappr110Reader } from "../../../../readers/Zsappr110Reader";
import { Lx22Reader } from "../../../../readers/Lx22Reader";
import { PeYaFeriadosReader } from "../../../../readers/PeYaFeriadosReader";
import { InventarioSapBuilder } from "./builders/InventarioSapBuilder";
import { InventarioSapWeeklyBuilder } from "./builders/InventarioSapWeeklyBuilder ";
import type { InventarioSapLinea } from "./InventarioSapLinea";
import type { InventarioSemana } from "./InventarioSemana";
import type { FeriadoItem } from "./FeriadoItem";
import InventarioSapCards from "./cards/InventarioSapCards";
import InventarioSapWeeklyChart from "./InventarioSapWeeklyChart";
import styles from "./InventarioSapInforme.module.css";
import InventarioSapDailySummary from "./Sumary/InventarioSapDailySummary";
import InventarioSapHallazgos from "./hallazgos/InventarioSapHallazgos";
import InventarioSapEstado from "./estados/InventarioSapEstado";
import LottieDataAnalisis from "../../../Lotties/LottieDataAnalisis"
import {InventarioPeriodoBuilder, type InventarioPeriodo, type TipoPeriodo} from "./builders/InventarioPeriodoBuilder";
import { InventarioSapDailyBuilder } from "./builders/InventarioSapDailyBuilder";
import {INVENTARIO_WAREHOUSES, type WarehouseInventario} from "./InventarioWarehouseConfig";

type WarehouseCache = Partial<Record<WarehouseInventario, InventarioSapLinea[]>>;

const InventarioSapInforme: React.FC = () => {
    const [lineas, setLineas] = useState<InventarioSapLinea[]>([]);
    const [feriados, setFeriados] = useState<FeriadoItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [tipoPeriodo, setTipoPeriodo] = useState<TipoPeriodo>("SEMANA");
    const [periodoSeleccionado, setPeriodoSeleccionado] = useState("");
    const [warehouse, setWarehouse] = useState<WarehouseInventario>("W1");
    const cache = useRef<WarehouseCache>({});
    const targetDiario = INVENTARIO_WAREHOUSES[warehouse].targetDiario;

    /* CARGA DE ARCHIVOS */
    useEffect(() => {const cargarFeriados = async () => {
        try {
            const data = await PeYaFeriadosReader.read();
            setFeriados(data);
        } catch (err) {
            console.error("Error cargando feriados:", err);
        }
    }; void cargarFeriados();}, []);
    useEffect(() => {const cargar = async () => {
        try {
            setLoading(true);
            setError("");
            const cached = cache.current[warehouse];
            if (cached) {
                setLineas(cached);
                return;
            }
            const config = INVENTARIO_WAREHOUSES[warehouse];
            const [zsappr110, lx22] = await Promise.all([Zsappr110Reader.read(config.zsappr110FileId),
                    Lx22Reader.read(config.lx22FileId)]);
            const lineasCruzadas = InventarioSapBuilder.build(zsappr110, lx22);
            // Mostramos los datos
            setLineas(lineasCruzadas);
            // Guardamos en memoria
            cache.current[warehouse] = lineasCruzadas;
        } catch (err) {
            console.error("Error cargando informe:", err);
            setError(err instanceof Error ? err.message : "No fue posible cargar el informe.");
        } finally {
            setLoading(false);
        }
    };void cargar();}, [warehouse]);

    /* RANGO TOTAL DISPONIBLE */
    const rango = useMemo(() => {
        if (lineas.length === 0) {
            return null;
        }
        const fechas = lineas.map(item => item.fecha.getTime()).filter(fecha => !Number.isNaN(fecha));
        if (fechas.length === 0) {
            return null;
        }
        return {
            desde: new Date(Math.min(...fechas)),
            hasta: new Date(Math.max(...fechas))
        };
    }, [lineas]);
    /* CONSTRUCCIÓN DE SEMANAS */
    const lineasCerradas = useMemo(() => {
        return lineas.filter(item => item.statusInventario.trim().toUpperCase() ===  "ELIMINADOS");
    }, [lineas]);
    const semanas = useMemo<InventarioSemana[]>(() => {
        if (!rango) {
            return [];
        }
        return InventarioSapWeeklyBuilder.build(lineasCerradas, feriados, rango.desde, rango.hasta, targetDiario);
    }, [lineasCerradas, feriados, rango, targetDiario]);
    const periodos = useMemo<InventarioPeriodo[]>(() => {
    return InventarioPeriodoBuilder.build(semanas, tipoPeriodo);}, [semanas, tipoPeriodo]);
    /* Al cargar seleccionamos automáticamente la última semana disponible. */
    useEffect(() => {
        if (periodos.length === 0) {
            return;
        }
        const existe = periodos.some(item => item.key === periodoSeleccionado);
        if (existe) {
            return;
        }
        /* Seleccionamos el último período disponible. */
        setPeriodoSeleccionado(periodos[ periodos.length - 1].key);}, [periodos, periodoSeleccionado]);
    const periodo = useMemo(() => {
        return periodos.find(item => item.key === periodoSeleccionado) ?? null;
    }, [periodos, periodoSeleccionado]);

    /* Líneas correspondientes exclusivament a la semana seleccionada.
     * Estas alimentarán las cards.*/
    const lineasPeriodo = useMemo(() => {
        if (!periodo) {
            return [];
        }
        const desde = thisStartOfDay(periodo.desde);
        const hasta = thisEndOfDay(periodo.hasta);
        return lineas.filter(item => item.fecha >= desde && item.fecha <= hasta);
    }, [lineas, periodo]);
    const lineasPeriodoCerradas = useMemo(() => {
        return lineasPeriodo.filter(item => item.statusInventario.trim().toUpperCase() === "ELIMINADOS");
    }, [lineasPeriodo]);

    const diasPeriodo = useMemo(() => {
    if (!periodo) {
        return [];
    }
    return InventarioSapDailyBuilder.build(lineasPeriodoCerradas, feriados, periodo.desde, periodo.hasta, targetDiario);
    }, [lineasPeriodoCerradas, feriados, periodo]);

    const periodoVisual = useMemo(() => {
        if (!periodo) {
            return null;
        }
        return {
            key: periodo.key,
            label: periodo.label,
            desde: periodo.desde,
            hasta: periodo.hasta,
            dias: diasPeriodo
        };}, [periodo, diasPeriodo]);

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
        return (
            <div className={styles.error}>
                ⚠️ {error}
            </div>
        );
    }

    if (semanas.length === 0) {
        return (
            <div className={styles.message}>                
                No hay inventarios para mostrar.
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

           {periodoVisual && (
            <>
                <InventarioSapCards lineas={lineasPeriodoCerradas}/>
                <InventarioSapWeeklyChart semana={periodoVisual}/>
                <InventarioSapEstado lineas={lineasPeriodo}/>
                <InventarioSapDailySummary semana={periodoVisual} lineas={lineasPeriodoCerradas}/>
                <InventarioSapHallazgos lineas={lineasPeriodoCerradas}/>
            </>
            )}
        </div>
    );
};
/* Helpers */

function thisStartOfDay(fecha: Date): Date {
    return new Date(fecha.getFullYear(), fecha.getMonth(), fecha.getDate());
}

function thisEndOfDay(fecha: Date): Date {
    return new Date(fecha.getFullYear(), fecha.getMonth(), fecha.getDate(), 23, 59, 59, 999);
}

export default InventarioSapInforme;