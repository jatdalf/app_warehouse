import type { InventarioSapLinea } from "../InventarioSapLinea";
import styles from "./InventarioSapCards.module.css";

interface Props {
    lineas: InventarioSapLinea[];
}

const InventarioSapCards: React.FC<Props> = ({lineas}) => {
    /* Las cards analizan solamente inventarios CICLICOS. */
    const ciclicos = lineas.filter(item => item.referencia === "CICLICOS");
    /* DIFERENCIAS */
    const diferencias = ciclicos.filter( item => item.diferenciaCantidad !== 0);
    const sobrantes = diferencias.filter(item => item.diferenciaCantidad > 0);
    const faltantes = diferencias.filter(item => item.diferenciaCantidad < 0);
    /* PORCENTAJES SOBRE LA CANTIDAD TOTAL DE LÍNEAS CÍCLICAS. */
    const porcentajeDiferencias = porcentaje(diferencias.length, ciclicos.length);
    const porcentajeSobrantes = porcentaje(sobrantes.length, ciclicos.length);
    const porcentajeFaltantes = porcentaje(faltantes.length, ciclicos.length);
    /* VALORES MONETARIOS */
    const valorInventariado = ciclicos.reduce((total, item) => total + item.stockValor, 0);
    const diferenciaAbsoluta = ciclicos.reduce((total, item) => total + item.diferenciaValorAbsoluto, 0);
    const diferenciaNeta = ciclicos.reduce((total, item) => total + item.diferenciaValor, 0);
    /* PORCENTAJES MONETARIOS */
    const porcentajeAbsoluto = porcentaje(diferenciaAbsoluta, valorInventariado);
    const porcentajeNeto = porcentaje(diferenciaNeta, valorInventariado);
    return (
        <div className={styles.cards}>
            {/* DIFERENCIAS */}
            <div className={styles.card}>
                <div className={styles.cardTitle}>
                    Diferencias en Cíclicos
                </div>
                <div className={styles.mainValue}>
                    {diferencias.length}
                </div>
                <div className={styles.mainLabel}>
                    diferencias encontradas
                </div>
                <div className={styles.percentage}>
                    {formatPercent(porcentajeDiferencias)}
                </div>
                <div className={styles.divider} />
                <div className={styles.differenceRows}>
                    <div className={styles.differenceRow}>
                        <span>Sobrantes</span>
                        <strong> + {sobrantes.length}</strong>
                        <span>{formatPercent(porcentajeSobrantes)}</span>
                    </div>

                    <div className={styles.differenceRow}>
                        <span>Faltantes</span>
                        <strong> - {faltantes.length}</strong>
                        <span> {formatPercent(porcentajeFaltantes)} </span>
                    </div>
                </div>
            </div>
            {/* DIFERENCIA ABSOLUTA */}
            <div className={styles.card}>
                <div className={styles.cardTitle}>
                    Diferencia Absoluta
                </div>
                <div className={styles.moneyValue}>
                    {formatCurrency(diferenciaAbsoluta)}
                </div>
                <div className={styles.percentage}>
                    {formatPercent(porcentajeAbsoluto)}
                </div>
                <div className={styles.cardDescription}>
                    Impacto total de las diferencias
                </div>
            </div>
            {/* DIFERENCIA NETA */}
            <div className={styles.card}>
                <div className={styles.cardTitle}>
                    Diferencia Neta
                </div>
                <div className={styles.moneyValue}>
                    {formatCurrency(diferenciaNeta)}
                </div>
                <div className={styles.percentage}>
                    {formatPercent(porcentajeNeto)}
                </div>
                <div className={styles.cardDescription}>
                    Balance entre sobrantes y faltantes
                </div>
            </div>
            {/* VALOR INVENTARIADO */}
            <div className={styles.card}>
                <div className={styles.cardTitle}>
                    Valor Inventariado
                </div>
                <div className={styles.moneyValue}>
                    {formatCurrency(valorInventariado)}
                </div>
                <div className={styles.cardDescription}>
                    Stock valorizado en inventarios cíclicos
                </div>
            </div>
        </div>
    );
};
/* HELPERS */

function porcentaje(valor: number, total: number): number {
    if (total === 0) {
        return 0;
    }
    return (valor / total) * 100;
}
function formatPercent(value: number): string {
    return (value.toLocaleString("es-AR", {minimumFractionDigits: 2, maximumFractionDigits: 2}) + "%");
}

function formatCurrency(value: number): string {
    return value.toLocaleString("es-AR",
        {
            style: "currency",
            currency: "ARS",
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }
    );
}

export default InventarioSapCards;