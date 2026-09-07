import styles from "../cobertura/RenaultInventarioCobertura.module.css";
import type { InventarioCoberturaStorage } from "../cobertura/InventarioCoberturaResultado";

interface CoberturaStorageTableProps {
    items: InventarioCoberturaStorage[];
}

const CoberturaStorageTable = ({
    items
}: CoberturaStorageTableProps) => {

    const ordenados =
        [...items].sort(
            (a, b) =>
                a.porcentajeCobertura -
                b.porcentajeCobertura
        );

    return (
        <div className={styles.storageSection}>

            <div className={styles.storageHeader}>
                <h3 className={styles.storageTitle}>
                    Avance por storage
                </h3>

                <span className={styles.storageSubtitle}>
                    Menor cobertura primero
                </span>
            </div>

            <div className={styles.tableWrapper}>

                <table className={styles.storageTable}>

                    <thead>
                        <tr>
                            <th>Storage</th>
                            <th>Total</th>
                            <th>Inventariadas</th>
                            <th>Pendientes</th>
                            <th>Cobertura</th>
                            <th>% WH</th>
                        </tr>
                    </thead>

                    <tbody>

                        {ordenados.map(item => (

                            <tr key={item.storage}>

                                <td
                                    className={
                                        styles.storageName
                                    }
                                >
                                    {item.storage}
                                </td>

                                <td>
                                    {item.totalPosiciones
                                        .toLocaleString("es-AR")}
                                </td>

                                <td>
                                    {item.posicionesInventariadas
                                        .toLocaleString("es-AR")}
                                </td>

                                <td>
                                    {item.posicionesPendientes
                                        .toLocaleString("es-AR")}
                                </td>

                                <td>
                                    <div
                                        className={
                                            styles.coverageCell
                                        }
                                    >
                                        <div
                                            className={
                                                styles.progressTrack
                                            }
                                        >
                                            <div
                                                className={
                                                    styles.progressFill
                                                }
                                                style={{
                                                    width:
                                                        `${Math.min(
                                                            100,
                                                            item.porcentajeCobertura
                                                        )}%`
                                                }}
                                            />
                                        </div>

                                        <span>
                                            {item.porcentajeCobertura
                                                .toFixed(2)}
                                            %
                                        </span>
                                    </div>
                                </td>

                                <td>
                                    {item.porcentajeWarehouse
                                        .toFixed(2)}
                                    %
                                </td>

                            </tr>

                        ))}

                    </tbody>

                </table>

            </div>

        </div>
    );
};

export default CoberturaStorageTable;