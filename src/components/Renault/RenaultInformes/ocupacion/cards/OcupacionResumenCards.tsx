import type { OcupacionResumen } from "../builders/OcupacionBuilder";
import styles from "./OcupacionResumenCards.module.css";

interface Props {
    resumen: OcupacionResumen;
}

const OcupacionResumenCards: React.FC<Props> = ({
    resumen
}) => {

    return (
        <div className={styles.cards}>

            <div className={styles.card}>
                <div className={styles.title}>
                    Ubicaciones totales
                </div>

                <div className={styles.value}>
                    {resumen.totalUbicaciones.toLocaleString("es-AR")}
                </div>

                <div className={styles.subtitle}>
                    Ubicaciones físicas
                </div>
            </div>


            <div className={styles.card}>
                <div className={styles.title}>
                    Ocupadas
                </div>

                <div className={styles.value}>
                    {resumen.ocupadas.toLocaleString("es-AR")}
                </div>

                <div className={styles.percentage}>
                    {formatPercent(
                        resumen.porcentajeOcupacion
                    )} del total
                </div>
            </div>


            <div className={styles.card}>
                <div className={styles.title}>
                    Libres
                </div>

                <div className={styles.value}>
                    {resumen.libres.toLocaleString("es-AR")}
                </div>

                <div className={styles.percentage}>
                    {formatPercent(
                        resumen.porcentajeLibre
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


export default OcupacionResumenCards;