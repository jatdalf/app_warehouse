import styles from "../cobertura/RenaultInventarioCobertura.module.css";

interface CoberturaResumenCardsProps {
    totalPosiciones: number;
    posicionesInventariadas: number;
    posicionesPendientes: number;
    porcentajeCobertura: number;
    onPendientesClick?: () => void;
}

const CoberturaResumenCards = ({
    totalPosiciones,
    posicionesInventariadas,
    posicionesPendientes,
    porcentajeCobertura,
    onPendientesClick
}: CoberturaResumenCardsProps) => {
    const porcentajePendiente = 100 - porcentajeCobertura;

    return (
        <div className={styles.coberturaCards}>
            <div className={styles.coberturaCard}>
                <span className={styles.coberturaCardTitle}>
                    Total posiciones
                </span>

                <strong className={styles.coberturaCardValue}>
                    {totalPosiciones.toLocaleString("es-AR")}
                </strong>

                <span className={styles.coberturaCardText}>
                    Posiciones inventariables
                </span>
            </div>

            <div className={styles.coberturaCard}>
                <span className={styles.coberturaCardTitle}>
                    Inventariadas
                </span>

                <strong className={styles.coberturaCardValue}>
                    {posicionesInventariadas.toLocaleString("es-AR")}
                </strong>

                <span className={styles.coberturaCardPercent}>
                    {porcentajeCobertura.toFixed(2)}%
                </span>

                <span className={styles.coberturaCardText}>
                    del universo seleccionado
                </span>
            </div>

            <div className={`${styles.coberturaCard} ${styles.clickableCard}`}
             onClick={onPendientesClick} role="button" tabIndex={0} onKeyDown={event => {
                if (event.key === "Enter" || event.key === " ") {
                    onPendientesClick?.();
                }}}>
                <span className={styles.coberturaCardTitle}>
                    Pendientes
                </span>

                <strong className={styles.coberturaCardValue}>
                    {posicionesPendientes.toLocaleString("es-AR")}
                </strong>

                <span className={styles.coberturaCardPercent}>
                    {porcentajePendiente.toFixed(2)}%
                </span>

                <span className={styles.coberturaCardText}>
                    aún sin inventariar
                </span>
            </div>

        </div>
    );
};

export default CoberturaResumenCards;