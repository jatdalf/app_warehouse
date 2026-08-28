import type { CompactacionResumen } from "../Compactacion/CompactacionItem";
import styles from "./CompactacionResumenCards.module.css";

interface Props {
    resumen: CompactacionResumen;
}
const CompactacionResumenCards: React.FC<Props> = ({resumen}) => {

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h3>
                    Oportunidades de compactación
                </h3>
                <span className={styles.badge}>
                    Estimación
                </span>
            </div>

            <div className={styles.cards}>
                <div className={styles.card}>
                    <div className={styles.title}>
                        Materiales candidatos
                    </div>

                    <div className={styles.value}>
                        {
                            resumen
                                .totalMaterialesCandidatos
                                .toLocaleString(
                                    "es-AR"
                                )
                        }
                    </div>

                    <div className={styles.subtitle}>
                        Con oportunidad potencial
                    </div>
                </div>

                <div className={styles.card}>
                    <div className={styles.title}>
                        Ubicaciones liberables
                    </div>

                    <div className={styles.value}>
                        {
                            resumen
                                .totalUbicacionesLiberables
                                .toLocaleString(
                                    "es-AR"
                                )
                        }
                    </div>
                    <div className={styles.subtitle}>
                        Potencial teórico
                    </div>
                </div>
            </div>
        </div>
    );
};
export default CompactacionResumenCards;