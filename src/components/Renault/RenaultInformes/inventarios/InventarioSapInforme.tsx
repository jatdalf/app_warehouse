import React, { useEffect, useMemo, useState } from "react";
import { Zsappr110Reader } from "../../../../readers/Zsappr110Reader";
import { Lx22Reader } from "../../../../readers/Lx22Reader";
import { PeYaFeriadosReader } from "../../../../readers/PeYaFeriadosReader";
import { InventarioSapBuilder } from "./InventarioSapBuilder";
import { InventarioSapWeeklyBuilder } from "./InventarioSapWeeklyBuilder ";
import type { InventarioSapLinea } from "./InventarioSapLinea";
import type { InventarioSemana } from "./InventarioSemana";
import type { FeriadoItem } from "./FeriadoItem";
import InventarioSapCards from "./cards/InventarioSapCards";
import InventarioSapWeeklyChart from "./InventarioSapWeeklyChart";
import styles from "./InventarioSapInforme.module.css";
import InventarioSapDailySummary from "./Sumary/InventarioSapDailySummary";

const InventarioSapInforme: React.FC = () => {
    const [lineas, setLineas] = useState<InventarioSapLinea[]>([]);
    const [feriados, setFeriados] = useState<FeriadoItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [semanaSeleccionada, setSemanaSeleccionada] = useState("");
    /* CARGA DE ARCHIVOS */
    useEffect(() => {
        const cargar = async () => {
            try {
                setLoading(true);
                setError("");
                const [zsappr110, lx22, feriadosData] = await Promise.all([
                    Zsappr110Reader.read(),
                    Lx22Reader.read(),
                    PeYaFeriadosReader.read()
                ]);

                const lineasCruzadas = InventarioSapBuilder.build(zsappr110, lx22);
                setLineas(lineasCruzadas);
                setFeriados(feriadosData);
            } catch (err) {
                console.error("Error cargando informe de inventarios:", err);
                setError(err instanceof Error
                        ? err.message : "No fue posible cargar el informe de inventarios.");
            } finally {
                setLoading(false);
            }
        };
        void cargar();
    }, []);

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
    const semanas = useMemo<InventarioSemana[]>(() => {
        if (!rango) {
            return [];
        }
        return InventarioSapWeeklyBuilder.build(lineas, feriados, rango.desde, rango.hasta);
    }, [lineas, feriados, rango]);
    /* Al cargar seleccionamos automáticamente la última semana disponible. */
    useEffect(() => {
        if (semanas.length === 0 || semanaSeleccionada) {
            return;
        }
        setSemanaSeleccionada(semanas[semanas.length - 1].key);
    }, [semanas, semanaSeleccionada]);
    /* SEMANA ACTUAL */
    const semana = useMemo(() => {
            return semanas.find(item => item.key === semanaSeleccionada) ?? null;
        }, [ semanas,  semanaSeleccionada ]);
    /* Líneas correspondientes exclusivament a la semana seleccionada.
     * Estas alimentarán las cards.*/
    const lineasSemana = useMemo(() => {
            if (!semana) {
                return [];
            }
            const desde = thisStartOfDay(semana.desde);
            const hasta = thisEndOfDay(semana.hasta);
            return lineas.filter(item => item.fecha >= desde && item.fecha <= hasta);
        }, [lineas, semana]);
    /* ESTADOS DE PANTALLA */
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
                <label htmlFor="semana">
                    Visualizar
                </label>
                <select id="semana" value={semanaSeleccionada} 
                    onChange={e => setSemanaSeleccionada(e.target.value)}>
                    {semanas.map((item, index) => (
                            <option key={item.key} value={item.key}>
                                {buildComboLabel(item, semanas, index)}
                            </option>
                        )
                    )}
                </select>
            </div>
            {semana && (
                <>
                    {/* CARDS */}
                    <InventarioSapCards lineas={lineasSemana} />
                    {/* CHART */}
                    <InventarioSapWeeklyChart semana={semana} />
                    <InventarioSapDailySummary semana={semana} lineas={lineasSemana}/>
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
/* Genera:
 * Agosto - Semana 1
 * Agosto - Semana 2
 * Agosto - Semana 3
 * ... */
function buildComboLabel(semana: InventarioSemana, semanas: InventarioSemana[], index: number): string {
    const mes = new Intl.DateTimeFormat("es-AR", {month: "long"}).format(semana.desde);
    const mismoMesHastaAhora = semanas.slice(0, index + 1).filter(item =>
                item.desde.getMonth() === semana.desde.getMonth() &&
                item.desde.getFullYear() === semana.desde.getFullYear()).length;

    const mesCapitalizado = mes.charAt(0).toUpperCase() + mes.slice(1);
    return `${mesCapitalizado} - Semana ${mismoMesHastaAhora}`;
}

export default InventarioSapInforme;