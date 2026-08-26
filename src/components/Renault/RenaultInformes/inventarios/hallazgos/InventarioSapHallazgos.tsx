import { useMemo } from "react";
import type { InventarioSapLinea } from "../InventarioSapLinea";
import styles from "./InventarioSapHallazgos.module.css";

interface Props {
    lineas: InventarioSapLinea[];
}

const InventarioSapHallazgos: React.FC<Props> = ({lineas}) => {
    const ciclicos = useMemo(() => lineas.filter(item => item.referencia === "CICLICOS"), [lineas]);

    const sobrantes = useMemo(() => ciclicos.filter(item =>
                        item.diferenciaCantidad > 0
                )
                .sort(
                    (a, b) =>
                        b.diferenciaValor -
                        a.diferenciaValor
                ),
        [ciclicos]
    );


    const faltantes = useMemo(
        () =>
            ciclicos
                .filter(
                    item =>
                        item.diferenciaCantidad < 0
                )
                .sort(
                    (a, b) =>
                        Math.abs(b.diferenciaValor) -
                        Math.abs(a.diferenciaValor)
                ),
        [ciclicos]
    );


    return (
        <section className={styles.container}>

            {/* SOBRANTES */}

            {sobrantes.length > 0 && (
                <div className={styles.block}>

                    <h2 className={styles.title}>
                        Sobrantes encontrados
                    </h2>

                    <div className={styles.tableWrapper}>

                        <table className={`${styles.table} ${styles.sobrantes}`}>

                            <thead>
                                <tr>
                                    <th>#</th>
                                    <th>Doc. Inv</th>
                                    <th>Material</th>
                                    <th>Descripción</th>
                                    <th>Fecha</th>
                                    <th>Dif. en valor</th>
                                    <th>Tipo Inv</th>
                                    <th>Observación</th>
                                </tr>
                            </thead>

                            <tbody>
                                {sobrantes.map(
                                    (item, index) => (

                                        <tr key={`${item.documento}-${item.id}`}>

                                            <td>
                                                {index + 1}
                                            </td>

                                            <td>
                                                {item.documento}
                                            </td>

                                            <td>
                                                {item.material}
                                            </td>

                                            <td className={styles.description}>
                                                {item.descripcion}
                                            </td>

                                            <td>
                                                {formatDate(item.fecha)}
                                            </td>

                                            <td className={styles.moneyPositive}>
                                                {formatCurrency(
                                                    item.diferenciaValor
                                                )}
                                            </td>

                                            <td>
                                                EIC
                                            </td>

                                            <td>
                                                Encontrada en inv. Ciclico
                                            </td>

                                        </tr>
                                    )
                                )}
                            </tbody>

                        </table>

                    </div>

                </div>
            )}


            {/* FALTANTES */}

            {faltantes.length > 0 && (
                <div className={styles.block}>

                    <h2 className={styles.title}>
                        Faltantes encontrados
                    </h2>

                    <div className={styles.tableWrapper}>

                        <table className={`${styles.table} ${styles.faltantes}`}>

                            <thead>
                                <tr>
                                    <th>#</th>
                                    <th>Doc. Inv</th>
                                    <th>Material</th>
                                    <th>Descripción</th>
                                    <th>Fecha</th>
                                    <th>Dif. en valor</th>
                                    <th>Tipo Inv</th>
                                    <th>Observación</th>
                                </tr>
                            </thead>

                            <tbody>
                                {faltantes.map(
                                    (item, index) => (

                                        <tr key={`${item.documento}-${item.id}`}>

                                            <td>
                                                {index + 1}
                                            </td>

                                            <td>
                                                {item.documento}
                                            </td>

                                            <td>
                                                {item.material}
                                            </td>

                                            <td className={styles.description}>
                                                {item.descripcion}
                                            </td>

                                            <td>
                                                {formatDate(item.fecha)}
                                            </td>

                                            <td className={styles.moneyNegative}>
                                                {formatCurrency(
                                                    item.diferenciaValor
                                                )}
                                            </td>

                                            <td>
                                                PIC
                                            </td>

                                            <td>
                                                Perdida en inv. Ciclico
                                            </td>

                                        </tr>
                                    )
                                )}
                            </tbody>

                        </table>

                    </div>

                </div>
            )}

        </section>
    );
};


function formatDate(
    fecha: Date
): string {

    return fecha.toLocaleDateString(
        "es-AR",
        {
            day: "2-digit",
            month: "2-digit",
            year: "numeric"
        }
    );
}


function formatCurrency(
    value: number
): string {

    return value.toLocaleString(
        "es-AR",
        {
            style: "currency",
            currency: "ARS",
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }
    );
}


export default InventarioSapHallazgos;