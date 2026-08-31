import {useEffect, useMemo, useRef, useState} from "react";
import { PeYaEgresosReader } from "../../../../readers/PeYaEgresosReader";
import type { EgresoItem } from "../egresos/EgresoItem";
import { EgresosSummaryBuilder } from "../egresos/EgresosSummaryBuilder";
import styles from "./PeYaEgresosInforme.module.css";
import { PeYaFeriadosReader } from "../../../../readers/PeYaFeriadosReader";
import type { FeriadoItem } from "../inventarios/FeriadoItem";
import AnimatedNumber from "../../../../utils/AnimatedNumber";
import { EgresosMonthlyBuilder } from "../egresos/EgresosMonthlyBuilder";
import EgresosMonthlyChart from "./EgresosMonthlyChart";
import EgresosDetail from "./EgresosDetail";
import LottieLoading from "../../../Lotties/LottieLoading";

interface MesDisponible {
    key: string;
    year: number;
    month: number;
    label: string;
}

const PeYaEgresosInforme = () => {
    const [egresos, setEgresos] = useState<EgresoItem[]>([]);
    const [fechaActualizacion, setFechaActualizacion] = useState<Date | null>(null);
    const [selectedMonth, setSelectedMonth] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [feriados, setFeriados] = useState<FeriadoItem[]>([]);
    const [showDetail, setShowDetail] = useState(false);
    /* =========================================
       CARGA
       ========================================= */
    useEffect(() => {
        const cargar = async () => {
        try {
            setLoading(true);
            setError("");
            const [egresosData, feriadosData] = await Promise.all([
                PeYaEgresosReader.read(), PeYaFeriadosReader.read()
            ]);
            setEgresos(egresosData.items );
            setFechaActualizacion(egresosData.modifiedAt);
            setFeriados(feriadosData);
        } catch (err) {
            console.error(err);
            const mensaje = err instanceof Error ? err.message : "No fue posible cargar el informe de egresos.";
            setError(mensaje);
        } finally {
            setLoading(false);
        }
    };void cargar();}, []);

    const detailRef = useRef<HTMLDivElement | null>(null);
    useEffect(() => {
        if (!showDetail) {
            return;
        }
        const timer = window.setTimeout(() => {
            detailRef.current?.scrollIntoView({behavior: "smooth", block: "start"});
        }, 100);
        return () => { window.clearTimeout(timer);
    };}, [showDetail]);
    /* =========================================
       MESES DISPONIBLES
       ========================================= */
    const mesesDisponibles = useMemo(() => {
        const meses = new Map< string, MesDisponible >();
        egresos.forEach(item => {
            if (Number.isNaN( item.fecha.getTime())) {
                return;
            }
            const year = item.fecha.getFullYear();
            const month = item.fecha.getMonth();
            const key = `${year}-${month}`;

            if (!meses.has(key)) {
                const rawLabel = new Intl.DateTimeFormat(
                    "es-AR",{month: "long", year: "numeric"}).format(item.fecha);
                const label = rawLabel.charAt(0).toUpperCase() + rawLabel.slice(1);
                meses.set(key,{key, year, month, label});
            }
        });
        return [...meses.values()].sort((a, b) => a.year !== b.year ? a.year - b.year : a.month - b.month);
    }, [egresos]);

    /* =========================================
       MES INICIAL
       ========================================= */
    useEffect(() => {
        if (mesesDisponibles.length === 0 || selectedMonth) {
            return;
        }
        const hoy = new Date();
        const keyActual = `${hoy.getFullYear()}-${hoy.getMonth()}`;
        const actual = mesesDisponibles.find(mes => mes.key === keyActual);

        if (actual) {
            setSelectedMonth(actual.key);
            return;
        }

        const ultimo = mesesDisponibles[mesesDisponibles.length - 1];
        setSelectedMonth(ultimo.key);
    }, [ mesesDisponibles, selectedMonth]);

    /* =========================================
       DATOS DEL MES
       ========================================= */
    const mesSeleccionado = mesesDisponibles.find( mes => mes.key === selectedMonth);
    const egresosMes = useMemo(() => {
        if (!mesSeleccionado) {
            return [];
        }
        return egresos.filter(item => item.fecha.getFullYear() === mesSeleccionado.year &&
                item.fecha.getMonth() === mesSeleccionado.month
        );
    }, [ egresos, mesSeleccionado]);

    const resumen = useMemo( () => EgresosSummaryBuilder.build(egresosMes, feriados), [egresosMes, feriados]);

    /* =========================================
       FECHA DE ACTUALIZACION
       ========================================= */
    const fechaActualizacionTexto = fechaActualizacion ? fechaActualizacion.toLocaleDateString("es-AR",
        {
            day: "2-digit",
            month: "2-digit",
            year: "numeric"
        }) : "";
    /* Chart */
    const datosMensuales = useMemo(() => EgresosMonthlyBuilder.build(egresos, feriados), [egresos, feriados]);
    
    /* =========================================
       ESTADOS
       ========================================= */
    if (loading) {
        return (
            <div className={styles.message}>
                Cargando informe de egresos...
                <div className={styles.loading}>
                    <LottieLoading />
                </div>
            </div>
        );
    } if (error) {
        return (
            <div className={styles.error}>
                ⚠️ {error}
            </div>
        );
    }

    /* =========================================
       RENDER
       ========================================= */
    return (
        <div className={styles.container}>
            {/* SELECTOR */}
            <div className={styles.controls}>
                <select value={selectedMonth} onChange={event => setSelectedMonth(event.target.value)} >
                    {mesesDisponibles.map(mes => (
                            <option key={mes.key} value={mes.key} >
                                {mes.label}
                            </option>
                        )
                    )}
                </select>
            </div>

            {/* TITULO */}
            <h2 className={styles.title}>
                Egresos{" "}
                {mesSeleccionado?.label}
            </h2>
            {fechaActualizacion && (
                <div className={styles.lastUpdate}>
                    (última actualización{" "}
                    {fechaActualizacionTexto})
                </div>
            )}

            {/* METRICAS */}
    <div className={styles.egresosTopRow}>
        <div className={styles.metricsGrid}>
        <div className={styles.metricTooltip} onClick={() => setShowDetail(true)}>
            <div className={styles.metric}>
            <strong><AnimatedNumber value={resumen.ordenes} /></strong>
            <span>Órdenes despachadas</span>
            </div>
            <span className={styles.tooltip}>Click para ver detalles</span>
        </div>
        <div className={styles.metricTooltip} onClick={() => setShowDetail(true)}>
            <div className={styles.metric}>
            <strong><AnimatedNumber value={resumen.sku} /></strong>
            <span>SKU despachados</span>
            </div>
            <span className={styles.tooltip}>Click para ver detalles</span>
        </div>

        <div className={styles.metricTooltip} onClick={() => setShowDetail(true)}>
            <div className={styles.metric}>
            <strong><AnimatedNumber value={resumen.bultos} /></strong>
            <span>Bultos despachados</span>
            </div>
            <span className={styles.tooltip}>Click para ver detalles</span>
        </div>

        </div>

        <div className={styles.bultosBreakdown}>
            <div className={styles.connector}>
                <div className={styles.connectorLine} />
            </div>

            <div className={styles.bultosChildren}>
                <div className={styles.metricTooltip} onClick={() => setShowDetail(true)}>
                    <div className={styles.metric}>
                    <strong><AnimatedNumber value={resumen.bultosNormal} /></strong>
                    <span>Días hábiles + sábado</span>
                    </div>
                    <span className={styles.tooltip}>Click para ver detalles</span>
                </div>

                <div className={styles.metricTooltip} onClick={() => setShowDetail(true)}>
                    <div className={styles.metric}>
                    <strong><AnimatedNumber value={resumen.bultosEspecial} /></strong>
                    <span>Domingos + feriados</span>
                    </div>
                    <span className={styles.tooltip}>Click para ver detalles</span>
                </div>
            </div>
        </div>
        </div>
        <div className={styles.egresosChart}>
            <EgresosMonthlyChart data={datosMensuales}/>
        </div>
        <div ref={detailRef}>{showDetail && (
        <EgresosDetail
            egresos={egresos}
            feriados={feriados}
            initialMonth={selectedMonth}
            onClose={() => setShowDetail(false)}/>)}
        </div>
    </div>
    );
};

export default PeYaEgresosInforme;