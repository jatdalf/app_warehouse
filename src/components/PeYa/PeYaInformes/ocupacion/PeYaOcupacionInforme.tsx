import {useEffect, useMemo, useState} from "react";
import { PeYaOcupacionReader } from "../../../../readers/PeYaOcupacionReader";
import type { OcupacionItem } from "../ocupacion/OcupacionItem";
import { OcupacionSummaryBuilder } from "../ocupacion/OcupacionSummaryBuilder";
import OcupacionChart from "./OcupacionChart";
import styles from "./PeYaOcupacionInforme.module.css";
import AnimatedNumber from "../../../../utils/AnimatedNumber";

interface MesDisponible {
    key: string;
    year: number;
    month: number;
    label: string;
}

const PeYaOcupacionInforme = () => {
    const [datos, setDatos] = useState<OcupacionItem[]>([]);
    const [selectedMonth, setSelectedMonth] = useState("");
    useEffect(() => {
        const cargar = async () => {
            const data = await PeYaOcupacionReader.read();
            setDatos(data);
        };
        void cargar();
    }, []);

    const mesesDisponibles = useMemo(() => {
            const meses = new Map<string, MesDisponible>();
            datos.forEach(item => {
                const year = item.fecha.getFullYear();
                const month = item.fecha.getMonth();
                const key = `${year}-${month}`;
                if (!meses.has(key)) {
                    const rawLabel = new Intl.DateTimeFormat("es-AR",{month: "long", year: "numeric"}
                        ).format(item.fecha);
                    const label = rawLabel.charAt(0).toUpperCase() + rawLabel.slice(1);
                    meses.set(key, {
                        key,
                        year,
                        month,
                        label
                    });
                }
            });

            return [...meses.values()].sort((a, b) => a.year !== b.year ? a.year - b.year : a.month - b.month);
        }, [datos]);
    /*
     * Seleccionamos:
     * 1. mes actual si tiene datos
     * 2. si no, último mes disponible
     */
    useEffect(() => {
        if (
            mesesDisponibles.length === 0 ||
            selectedMonth
        ) {
            return;
        }

        const hoy = new Date();
        const keyActual = `${hoy.getFullYear()}-${hoy.getMonth()}`;
        const actual = mesesDisponibles.find(mes =>  mes.key === keyActual);
        if (actual) {
            setSelectedMonth(actual.key);
            return;
        }
        const ultimo = mesesDisponibles[mesesDisponibles.length - 1];
        setSelectedMonth(ultimo.key);
    }, [mesesDisponibles, selectedMonth]);

    const datosMes = useMemo(() => {
            const mes = mesesDisponibles.find(item => item.key === selectedMonth);
            if (!mes) {
                return [];
            }
            return datos.filter(item => item.fecha.getFullYear() === mes.year &&
                item.fecha.getMonth() === mes.month);
        }, [
            datos,
            mesesDisponibles,
            selectedMonth
        ]);
    const resumen = useMemo( () => OcupacionSummaryBuilder.build(datosMes), [datosMes]);
    const mesSeleccionado = mesesDisponibles.find(mes => mes.key === selectedMonth);
    return (
        <div className={styles.container}>
            <div className={styles.controls}>
                <select value={selectedMonth} onChange={event =>
                        setSelectedMonth(event.target.value)
                    }
                >
                    {mesesDisponibles.map(mes => (
                            <option key={mes.key} value={mes.key}>
                                {mes.label}
                            </option>
                        )
                    )}
                </select>
            </div>
            <h2 className={styles.monthTitle}>
                Ocupación{" "}
                {mesSeleccionado?.label}
            </h2>

            <div className={styles.metricsGrid}>
                <div className={styles.metric}>
                    <strong>
                        <AnimatedNumber value={resumen.posicionesActuales}/>
                    </strong>
                    <span>
                        Posiciones finales
                    </span>
                </div>

                <div className={styles.metric}>
                    <strong>
                        <AnimatedNumber value={resumen.skuActuales}/>
                    </strong>
                    <span>
                        SKU finales
                    </span>
                </div>

                <div className={styles.metric}>
                    <strong>
                        <AnimatedNumber value={resumen.promedioPosiciones}/>
                    </strong>
                    <span>
                        Promedio posiciones
                    </span>
                </div>

                <div className={styles.metric}>
                    <strong>
                        <AnimatedNumber value={resumen.maximoPosiciones}/>
                    </strong>
                    <span>
                        Máximo del mes
                    </span>
                </div>

                <div className={styles.metric}>
                    <strong>
                        <AnimatedNumber value={resumen.diasExceso}/>
                    </strong>
                    <span>
                        Días sobre capacidad
                    </span>
                </div>
                <div className={styles.metric}>
                    <strong>
                        <AnimatedNumber value={resumen.promedioSobrecapacidad}/>
                    </strong>
                    <span>
                        Promedio de sobrecapacidad
                    </span>
                </div>
            </div>

            <OcupacionChart data={datosMes} />
        </div>
    );
};

export default PeYaOcupacionInforme;