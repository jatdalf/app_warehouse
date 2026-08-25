import { useMemo } from "react";
import type { InventarioSapLinea } from "../InventarioSapLinea";
import type { InventarioSemana } from "../InventarioSemana";
import styles from "./InventarioSapDailySummary.module.css";

interface Props {
    semana: InventarioSemana;
    lineas: InventarioSapLinea[];
}

interface DiaResumen {
    key: string;
    fecha: Date;
    ciclicos: number;
    operativos: number;
    total: number;
    diferenciaAbsoluta: number;
    diferenciaNeta: number;
}

const InventarioSapDailySummary: React.FC<Props> = ({semana, lineas}) => {
    const resumenDias = useMemo<DiaResumen[]>(() => {
        return semana.dias.map(dia => {
            const inicioDia = new Date(dia.fecha.getFullYear(), dia.fecha.getMonth(), dia.fecha.getDate());
            const finDia = new Date(dia.fecha.getFullYear(), dia.fecha.getMonth(), dia.fecha.getDate(),
                    23, 59, 59, 999);
            const lineasDia = lineas.filter(item => item.fecha >= inicioDia && item.fecha <= finDia);
            /* CICLICOS */
            const ciclicos = lineasDia.filter( item => item.referencia === "CICLICOS");
            /* Todo lo que no sea CICLICOS se agrupa como OPERATIVOS para este resumen. */
            const operativos = lineasDia.filter(item => item.referencia !== "CICLICOS");
            const diferenciaAbsoluta = ciclicos.reduce((total, item) => total + item.diferenciaValorAbsoluto, 0);
            const diferenciaNeta = ciclicos.reduce((total, item) => total + item.diferenciaValor, 0);
            return {
                key: `${dia.fecha.getFullYear()}-${dia.fecha.getMonth()}-${dia.fecha.getDate()}`,
                fecha: dia.fecha,
                ciclicos: ciclicos.length,
                operativos: operativos.length,
                total: lineasDia.length,
                diferenciaAbsoluta,
                diferenciaNeta
            };
        })
         // No mostramos días sin inventarios
        .filter(dia => dia.total > 0);
    }, [semana, lineas]);
    /* TOTAL SEMANAL */
    const total = useMemo(() => {
        return resumenDias.reduce(
            (acc, dia) => ({
                ciclicos: acc.ciclicos + dia.ciclicos,
                operativos: acc.operativos + dia.operativos,
                total: acc.total + dia.total,
                diferenciaAbsoluta: acc.diferenciaAbsoluta + dia.diferenciaAbsoluta,
                diferenciaNeta: acc.diferenciaNeta + dia.diferenciaNeta
            }),{
                ciclicos: 0,
                operativos: 0,
                total: 0,
                diferenciaAbsoluta: 0,
                diferenciaNeta: 0
            }
        );
    }, [resumenDias]);


    return (
        <section className={styles.container}>
            <h2 className={styles.title}>
                Resumen diario
            </h2>
            <div className={styles.tableWrapper}>
                <table className={styles.table}>
                    <thead>
                        <tr>
                            <th>Fecha</th>
                            <th>Cíclicos</th>
                            <th>Operativos</th>
                            <th>Total</th>
                            <th>Dif. Absoluta</th>
                            <th>Dif. Neta</th>
                        </tr>
                    </thead>
                    <tbody>
                        {resumenDias.map(dia => (
                            <tr key={dia.key}>
                                <td className={styles.dateCell}>
                                    <strong>{nombreDia(dia.fecha)}</strong>
                                    <span>{formatDate(dia.fecha)}</span>
                                </td>
                                <td>
                                    {dia.ciclicos.toLocaleString("es-AR")}
                                </td>
                                <td>
                                    {dia.operativos.toLocaleString("es-AR")}
                                </td>
                                <td className={styles.totalCell}>
                                    {dia.total.toLocaleString(
                                        "es-AR"
                                    )}
                                </td>


                                <td>
                                    {formatCurrency(
                                        dia.diferenciaAbsoluta
                                    )}
                                </td>


                                <td
                                    className={
                                        dia.diferenciaNeta < 0
                                            ? styles.negative
                                            : dia.diferenciaNeta > 0
                                                ? styles.positive
                                                : ""
                                    }
                                >
                                    {formatCurrency(
                                        dia.diferenciaNeta
                                    )}
                                </td>

                            </tr>

                        ))}


                        {/* TOTALIZADOR */}

                        <tr className={styles.totalRow}>

                            <td>
                                TOTAL SEMANA
                            </td>

                            <td>
                                {total.ciclicos.toLocaleString(
                                    "es-AR"
                                )}
                            </td>

                            <td>
                                {total.operativos.toLocaleString(
                                    "es-AR"
                                )}
                            </td>

                            <td>
                                {total.total.toLocaleString(
                                    "es-AR"
                                )}
                            </td>

                            <td>
                                {formatCurrency(
                                    total.diferenciaAbsoluta
                                )}
                            </td>

                            <td>
                                {formatCurrency(
                                    total.diferenciaNeta
                                )}
                            </td>

                        </tr>

                    </tbody>

                </table>

            </div>

        </section>
    );
};


function nombreDia(
    fecha: Date
): string {

    const texto =
        new Intl.DateTimeFormat(
            "es-AR",
            {
                weekday: "long"
            }
        ).format(fecha);

    return (
        texto.charAt(0).toUpperCase() +
        texto.slice(1)
    );
}


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


export default InventarioSapDailySummary;