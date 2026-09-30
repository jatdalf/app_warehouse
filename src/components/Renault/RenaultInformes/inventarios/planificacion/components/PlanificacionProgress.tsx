import styles from "../RenaultInventarioPlanificacion.module.css";

interface PlanificacionProgressProps {
    cantidadPlanificada: number;
    target: number;
    porcentaje: number;
    diferenciaTarget: number;
    estado: {clase: string; texto: string;};
}

export const PlanificacionProgress = ({
    cantidadPlanificada,
    target,
    porcentaje,
    diferenciaTarget,
    estado
}: PlanificacionProgressProps) => {
    return (
        <section className={styles.progressCard}>
            <div className={styles.progressHeader}>
                <div>
                    <span className={styles.progressLabel}>Ubicaciones planificadas</span>
                    <strong className={styles.progressNumber}>{cantidadPlanificada}</strong>
                </div>

                <div className={styles.targetInfo}>Target<strong>{target}</strong></div>
            </div>

            <div className={styles.progressTrack}>
                <div className={`${styles.progressFill} ${estado.clase}`}
                    style={{ width: `${Math.min(porcentaje, 100)}%` }} />
            </div>

            <div className={styles.progressFooter}>
                <strong>
                    {porcentaje.toLocaleString("es-AR", {minimumFractionDigits: 1, maximumFractionDigits: 1})}
                    %
                </strong>
                <span>{estado.texto}</span>
            </div>

            <div className={styles.targetMessage}>
                {diferenciaTarget < 0 ? (
                    <>
                        Faltan{" "}
                        <strong>{Math.abs(diferenciaTarget)}</strong>{" "}
                        ubicaciones para alcanzar el objetivo.
                    </>
                ) : diferenciaTarget === 0 ? (
                    <>
                        Objetivo diario alcanzado.
                    </>
                ) : (
                    <>
                        <strong>{diferenciaTarget}</strong>{" "}
                        ubicaciones por encima del objetivo.
                    </>
                )}
            </div>
        </section>
    );
};