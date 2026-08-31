import {useEffect, useMemo, useState} from "react";
import { PeYaIngresosReader } from "../../../../readers/PeYaIngresosReader";
import { IngresosSummaryBuilder } from "../../PeYaInformes/ingresos/IngresosSummaryBuilder";
import type { IngresoItem } from "../../../PeYa/PeYaInformes/ingresos/IngresoItem";
import styles from "./PeYaIngresosInforme.module.css";
import { IngresosMonthlyBuilder } from "../ingresos/IngresosMonthlyBuilder";
import IngresoChart from "./IngresoChart";
import AnimatedNumber from "../../../../utils/AnimatedNumber";

const PeYaIngresosInforme = () => {
    const [ingresos, setIngresos] = useState<IngresoItem[]>([]);
    const [selectedMonth, setSelectedMonth] = useState("");
    const datosMensuales = useMemo(() => IngresosMonthlyBuilder.build(ingresos),[ingresos]);
    
    useEffect(() => {
        const cargar = async () => {
            const data = await PeYaIngresosReader.read();
            setIngresos(data);
        }; void cargar(); }, []);

    const mesesDisponibles = useMemo(() => {
    return datosMensuales.map(item => {
        const fecha = new Date(item.year, item.month, 1);
        const rawLabel = new Intl.DateTimeFormat("es-AR", {month: "long", year: "numeric"}).format(fecha);
        const label = rawLabel.charAt(0).toUpperCase() + rawLabel.slice(1);
        return {
            key: item.key,
            year: item.year,
            month: item.month,
            label
        };
    });}, [datosMensuales]);

    useEffect(() => {
        if (mesesDisponibles.length === 0 || selectedMonth) {
            return;
        }
        const hoy = new Date();
        const keyActual = `${hoy.getFullYear()}-${hoy.getMonth()}`;
        const mesActual = mesesDisponibles.find(mes => mes.key === keyActual);
        if (mesActual) {
            setSelectedMonth(mesActual.key);
            return;
        }
        const ultimo = mesesDisponibles[mesesDisponibles.length - 1];
        setSelectedMonth(ultimo.key);
    }, [mesesDisponibles, selectedMonth]);

    const total = useMemo(() => IngresosSummaryBuilder.build(ingresos), [ingresos]);

    const ingresosMes = useMemo(() => {
            const mes = mesesDisponibles.find(item => item.key === selectedMonth);
            if (!mes) {
                return [];
            }
            return ingresos.filter(item => {
                if (Number.isNaN(item.dateReceived.getTime())) {
                    return false;
                }
                return (
                    item.dateReceived.getFullYear() === mes.year &&
                    item.dateReceived.getMonth() === mes.month
                );
            });
        }, [
            ingresos,
            mesesDisponibles,
            selectedMonth
        ]);

    const resumenMes = useMemo(() => IngresosSummaryBuilder.build( ingresosMes),[ingresosMes]);
    const mesSeleccionado = mesesDisponibles.find(item => item.key === selectedMonth);

    return (
        <div className={styles.container}>
            <div className={styles.reportGrid}>
                <section className={styles.summaryCard}>
                    <h2>
                        Ingresos Totales
                    </h2>
                    <div className={styles.metrics}>
                        <div>
                            <AnimatedNumber value={total.sku}/> SKU
                        </div>
                        <div>
                            <AnimatedNumber value={total.unidades}/> unidades
                        </div>
                        <div>
                            <AnimatedNumber value={total.pallets}/> pallets
                        </div>
                    </div>
                </section>

                <section className={styles.summaryCard}>

                    <select
                        value={selectedMonth}
                        onChange={event =>
                            setSelectedMonth(event.target.value)
                        }
                    >
                        {mesesDisponibles.map( mes => (
                                <option
                                    key={mes.key}
                                    value={mes.key}
                                >
                                    {mes.label}
                                </option>
                            )
                        )}
                    </select>

                    <h2>
                        Ingresos{" "}
                        {mesSeleccionado?.label}
                    </h2>
                    <div className={styles.metrics}>
                        <div>
                            <AnimatedNumber value={resumenMes.sku}/> SKU
                        </div>
                        <div>
                            <AnimatedNumber value={resumenMes.unidades}/> unidades
                        </div>
                        <div>
                            <AnimatedNumber value={resumenMes.pallets}/> pallets
                        </div>
                    </div>
                </section>
            </div>
            <section className={styles.chartsSection}>
                <h2 className={styles.chartsTitle}>
                    Evolución mensual de ingresos
                </h2>
                <div className={styles.chartsGrid}>
                    <IngresoChart titulo="SKU recibidos" data={datosMensuales} dataKey="sku"/>
                    <IngresoChart titulo="Unidades recibidas" data={datosMensuales} dataKey="unidades"/>
                    <IngresoChart titulo="Pallets almacenados" data={datosMensuales} dataKey="pallets"/>
                </div>
            </section>
        </div>
    );
};

export default PeYaIngresosInforme;