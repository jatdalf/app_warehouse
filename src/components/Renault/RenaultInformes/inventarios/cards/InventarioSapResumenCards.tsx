import { useMemo } from "react";
import type { InventarioSapLinea } from "../InventarioSapLinea";
import styles from "./InventarioSapResumenCards.module.css";

interface Props {
    lineas: InventarioSapLinea[];
}

const InventarioSapResumenCards: React.FC<Props> = ({
    lineas
}) => {

    const resumen = useMemo(() => {

        const total = lineas.length;

        const ciclicos =
            lineas.filter(
                item =>
                    item.referencia === "CICLICOS"
            ).length;

        const operativos =
            lineas.filter(
                item =>
                    item.referencia !== "CICLICOS"
            ).length;

        const porcentajeCiclicos =
            total > 0
                ? (ciclicos / total) * 100
                : 0;

        const porcentajeOperativos =
            total > 0
                ? (operativos / total) * 100
                : 0;

        return {
            total,
            ciclicos,
            operativos,
            porcentajeCiclicos,
            porcentajeOperativos
        };

    }, [lineas]);


    return (
        <div className={styles.cards}>

            <div className={styles.card}>
                <div className={styles.title}>
                    Inventarios realizados
                </div>

                <div className={styles.value}>
                    {resumen.total.toLocaleString("es-AR")}
                </div>

                <div className={styles.subtitle}>
                    Líneas inventariadas
                </div>
            </div>


            <div className={styles.card}>
                <div className={styles.title}>
                    Cíclicos
                </div>

                <div className={styles.value}>
                    {resumen.ciclicos.toLocaleString("es-AR")}
                </div>

                <div className={styles.percentage}>
                    {formatPercent(
                        resumen.porcentajeCiclicos
                    )} del total
                </div>
            </div>


            <div className={styles.card}>
                <div className={styles.title}>
                    Operativos
                </div>

                <div className={styles.value}>
                    {resumen.operativos.toLocaleString("es-AR")}
                </div>

                <div className={styles.percentage}>
                    {formatPercent(
                        resumen.porcentajeOperativos
                    )} del total
                </div>
            </div>

        </div>
    );
};


function formatPercent(
    value: number
): string {

    return value.toLocaleString(
        "es-AR",
        {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }
    ) + "%";
}


export default InventarioSapResumenCards;