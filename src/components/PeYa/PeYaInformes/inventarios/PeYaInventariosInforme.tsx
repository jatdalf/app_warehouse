import {useEffect, useMemo, useState} from "react";
import { PeYaInventariosReader } from "../../../../readers/PeYaInventariosReader";
import { PeYaFeriadosReader } from "../../../../readers/PeYaFeriadosReader";
import type { InventarioItem } from "../inventarios/InventarioItem";
import type { FeriadoItem } from "../inventarios/FeriadoItem";
import { InventarioSummaryBuilder } from "../inventarios/InventarioSummaryBuilder";
import { InventarioWeeklyBuilder } from "../inventarios/InventarioWeeklyBuilder";
import styles from "./PeYaInventariosInforme.module.css";

interface MesDisponible {
    key: string;
    year: number;
    month: number;
    label: string;
}
const PeYaInventariosInforme = () => {
    const [inventarios, setInventarios] = useState<InventarioItem[]>([]);
    const [feriados, setFeriados] = useState<FeriadoItem[]>([]);
    const [selectedMonth, setSelectedMonth] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    /* =========================================
       CARGA DE ARCHIVOS
       ========================================= */
    useEffect(() => {
        const cargar = async () => {
            try {
                setLoading(true);
                const [inventariosData, feriadosData] = await Promise.all([
                    PeYaInventariosReader.read(),
                    PeYaFeriadosReader.read()
                ]);
                setInventarios(inventariosData);
                setFeriados(feriadosData);
            } catch (err) {
                console.error(err);
                setError("No fue posible cargar los datos de inventarios.");
            } finally {
                setLoading(false);
            }
        };
        void cargar();
    }, []);
    /* =========================================
       MESES DISPONIBLES
       ========================================= */
    const mesesDisponibles = useMemo(() => {
        const meses = new Map< string, MesDisponible >();
        inventarios.forEach(item => {
            if (Number.isNaN(item.fecha.getTime())) {
                return;
            }
            const year = item.fecha.getFullYear();
            const month = item.fecha.getMonth();
            const key = `${year}-${month}`;
            if (!meses.has(key)) {
                const rawLabel = new Intl.DateTimeFormat("es-AR",
                        {
                            month: "long",
                            year: "numeric"
                        }
                    ).format(item.fecha );
                const label = rawLabel.charAt(0).toUpperCase() + rawLabel.slice(1);
                meses.set(key,{
                        key,
                        year,
                        month,
                        label
                    }
                );
            }
        });
        return [...meses.values()].sort((a, b) => a.year !== b.year ? a.year - b.year : a.month - b.month);
    }, [inventarios]);

    /* =========================================
       MES INICIAL
       ========================================= */
    useEffect(() => {
        if (mesesDisponibles.length === 0 || selectedMonth) {
            return;
        }
        const hoy = new Date();
        const keyActual = `${hoy.getFullYear()}-${hoy.getMonth()}`;
        const mesActual = mesesDisponibles.find(mes => mes.key === keyActual);
        if (mesActual) {
            setSelectedMonth(
                mesActual.key
            );
            return;
        }
        /*
         * Si el archivo no contiene el mes actual,
         * seleccionamos el último disponible.
         */
        const ultimo = mesesDisponibles[mesesDisponibles.length - 1];
        setSelectedMonth(ultimo.key);
    }, [mesesDisponibles, selectedMonth]);

    /* =========================================
       PERÍODO SELECCIONADO
       ========================================= */
    const periodo = useMemo(() => {
        const mes = mesesDisponibles.find( item => item.key === selectedMonth);
        if (!mes) {
            return null;
        }
        const desde = new Date(mes.year, mes.month, 1);
        const hasta = new Date(mes.year, mes.month + 1, 0, 23, 59, 59, 999);
        return {
            desde,
            hasta,
            mes
        };
    }, [mesesDisponibles, selectedMonth]);

    /* =========================================
       RESUMEN DEL MES
       ========================================= */
    const resumen = useMemo(() => {
        if (!periodo) {
            return null;
        }
        return InventarioSummaryBuilder.build(inventarios, feriados, periodo.desde, periodo.hasta);
    }, [inventarios, feriados, periodo]);

    /* =========================================
       DATOS SEMANALES
       ========================================= */
    const datosSemanales = useMemo(() => {
        if (!periodo) {
            return [];
        }
        return InventarioWeeklyBuilder.build(inventarios, feriados, periodo.desde, periodo.hasta);

    }, [inventarios, feriados, periodo]);

    /* =========================================
       ESTADOS
       ========================================= */
    if (loading) {
        return (
            <div className={styles.message}>
                Cargando informe de inventarios...
            </div>
        );
    }

    if (error) {
        return (
            <div className={styles.error}>
                {error}
            </div>
        );
    }

    if (!resumen || !periodo) {
        return (
            <div className={styles.message}>
                No hay información disponible.
            </div>
        );
    }
    let diferencias = 0;
    if (resumen.realizados > 0) {
        diferencias = (resumen.conDiferencias / resumen.realizados) * 100;
    }
    const target = resumen.realizados - resumen.esperados;
    /* =========================================
       RENDER
       ========================================= */
    return (
        <div className={styles.container}>
            {/* SELECTOR */}
            <div className={styles.controls}>
                <select value={selectedMonth}
                    onChange={event => setSelectedMonth(event.target.value)}>
                    {mesesDisponibles.map(mes => (
                            <option key={mes.key} value={mes.key}>
                                {mes.label}
                            </option>
                        )
                    )}
                </select>
            </div>

            {/* TITULO */}
            <h2 className={styles.title}>
                Inventarios{" "} {periodo.mes.label}
            </h2>
            {/* METRICAS */}
            <div className={styles.metricsGrid}>
                <div className={styles.metric}>
                    <strong>{resumen.realizados}</strong>
                    <span>Inventarios realizados</span>
                </div>
                <div className={styles.metric}>
                    <strong>{resumen.sinDiferencias}</strong>
                    <span>Sin diferencias</span>
                </div>
                <div className={styles.metric}>
                    <strong>{resumen.conDiferencias}</strong>
                    <span>Con diferencias</span>
                </div>
                <div className={styles.metric}>
                    <strong>{diferencias.toLocaleString("es-AR",{maximumFractionDigits: 1})}</strong>
                    <span>% de desvio</span>
                </div>
                {/* segunda linea */}
                <div className={styles.metric}>
                    <strong>{resumen.diasLaborables}</strong>
                    <span>Días laborables</span>
                </div>
                <div className={styles.metric}>
                    <strong>{resumen.esperados}</strong>
                    <span>Inventarios esperados</span>
                </div>
                <div className={`${styles.metric} ${target < 0 ? styles.metricWarning : ""}`} >
                    <strong>{target}</strong>
                    <span>Target</span>
                </div>
                <div className={styles.metric}>
                    <strong>
                        {resumen.cumplimiento.toLocaleString("es-AR",{maximumFractionDigits: 1})}
                        %
                    </strong>
                    <span>
                        Cumplimiento
                    </span>
                </div>
            </div>
            {/* TEMPORALMENTE PARA VALIDAR
                EL CALCULO SEMANAL */}
            <div className={styles.weeklyDebug}>
                <h3>
                    Resumen semanal
                </h3>
                {datosSemanales.map( semana => (
                    <div key={semana.key} className={styles.weekRow}>
                        <span>
                            {semana.label}
                        </span>
                        <span>
                            Esperados:{" "}
                            <strong>
                                {semana.esperados}
                            </strong>
                        </span>
                        <span>
                            Realizados:{" "}
                            <strong>
                                {semana.realizados}
                            </strong>
                        </span>
                        <span>
                            {semana.cumplimiento.toLocaleString("es-AR",{maximumFractionDigits: 1})}
                            %
                        </span>
                    </div>
                    )
                )}
            </div>
        </div>
    );
};


export default PeYaInventariosInforme;