import type { OcupacionStorage } from "../builders/OcupacionBuilder";
import styles from "./OcupacionStorageTable.module.css";

interface Props {
    items: OcupacionStorage[];
}

const OcupacionStorageTable: React.FC<Props> = ({
    items
}) => {

    return (
        <section className={styles.container}>

            <h2 className={styles.title}>
                Ocupación por Storage
            </h2>

            <div className={styles.tableWrapper}>

                <table className={styles.table}>

                    <thead>
                        <tr>
                            <th>Storage</th>
                            <th>Descripción</th>
                            <th>Total</th>
                            <th>Ocupadas</th>
                            <th>Libres</th>
                            <th>% Ocupación</th>
                            <th>Capacidad</th>
                        </tr>
                    </thead>

                    <tbody>

                        {items.map(item => (

                            <tr key={item.storage}>

                                <td className={styles.storage}>
                                    {item.storage}
                                </td>

                                <td className={styles.description}>
                                    {item.descripcion}
                                </td>

                                <td>
                                    {formatNumber(
                                        item.totalUbicaciones
                                    )}
                                </td>

                                <td>
                                    {formatNumber(
                                        item.ocupadas
                                    )}
                                </td>

                                <td>
                                    {formatNumber(
                                        item.libres
                                    )}
                                </td>

                                <td className={styles.percent}>
                                    {formatPercent(
                                        item.porcentajeOcupacion
                                    )}
                                </td>

                                <td>
                                    <div className={styles.capacity}>

                                        <div className={styles.bar}>
                                            <div
                                                className={styles.barOccupied}
                                                style={{
                                                    width:
                                                        `${item.porcentajeOcupacion}%`
                                                }}
                                            />
                                        </div>

                                        <div className={styles.capacityText}>
                                            {formatNumber(item.ocupadas)}
                                            {" / "}
                                            {formatNumber(
                                                item.totalUbicaciones
                                            )}
                                        </div>

                                    </div>
                                </td>

                            </tr>

                        ))}

                    </tbody>

                </table>

            </div>

        </section>
    );
};


function formatNumber(
    value: number
): string {

    return value.toLocaleString(
        "es-AR"
    );
}


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


export default OcupacionStorageTable;