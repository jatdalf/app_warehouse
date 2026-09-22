import type { InventarioSapLinea } from "../InventarioSapLinea";
import styles from "./InventarioSapDetalleTipo.module.css";

interface Props {
    lineas: InventarioSapLinea[];
}

interface DetalleTipo {
    tipo: string;
    cantidad: number;
    porcentaje: number;
    clasificacion: "Cíclico" | "Operativo";
}

const normalizarReferencia = (referencia: string): string => {
    return String(referencia ?? "")
        .trim()
        .toUpperCase();
};

const clasificarReferencia = (
    referencia: string
): "Cíclico" | "Operativo" => {
    return referencia === "CICLICOS"
        ? "Cíclico"
        : "Operativo";
};

const InventarioSapDetalleTipo = ({ lineas }: Props) => {
    const cantidades = new Map<string, number>();

    for (const linea of lineas) {
        const tipo = normalizarReferencia(linea.referencia);

        if (!tipo) {
            continue;
        }

        cantidades.set(
            tipo,
            (cantidades.get(tipo) ?? 0) + 1
        );
    }

    const total = Array.from(cantidades.values())
        .reduce((acc, cantidad) => acc + cantidad, 0);

    const detalle: DetalleTipo[] =
        Array.from(cantidades.entries())
            .map(([tipo, cantidad]) => ({
                tipo,
                cantidad,
                porcentaje:
                    total > 0
                        ? (cantidad / total) * 100
                        : 0,
                clasificacion:
                    clasificarReferencia(tipo)
            }))
            .sort((a, b) => b.cantidad - a.cantidad);

    return (
        <section className={styles.section}>
            <div className={styles.header}>
                <div>
                    <h3 className={styles.title}>
                        Detalle de inventarios por tipo
                    </h3>

                    <p className={styles.subtitle}>
                        Distribución según referencia de inventario
                    </p>
                </div>
            </div>

            <div className={styles.tableWrapper}>
                <table className={styles.table}>
                    <thead>
                        <tr>
                            <th>Tipo (Ref Inventario)</th>
                            <th>Cantidad</th>
                            <th>% del Total</th>
                            <th>Clasificación</th>
                        </tr>
                    </thead>

                    <tbody>
                        {detalle.map(item => (
                            <tr key={item.tipo}>
                                <td className={styles.tipo}>
                                    {item.tipo}
                                </td>

                                <td className={styles.numero}>
                                    {item.cantidad.toLocaleString("es-AR")}
                                </td>

                                <td className={styles.numero}>
                                    {item.porcentaje.toLocaleString(
                                        "es-AR",
                                        {
                                            minimumFractionDigits: 2,
                                            maximumFractionDigits: 2
                                        }
                                    )}
                                    %
                                </td>

                                <td>
                                    <span
                                        className={
                                            item.clasificacion === "Cíclico"
                                                ? styles.ciclico
                                                : styles.operativo
                                        }
                                    >
                                        {item.clasificacion}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>

                    <tfoot>
                        <tr>
                            <td>Total</td>

                            <td className={styles.numero}>
                                {total.toLocaleString("es-AR")}
                            </td>

                            <td className={styles.numero}>
                                {total > 0 ? "100,00%" : "0,00%"}
                            </td>

                            <td>—</td>
                        </tr>
                    </tfoot>
                </table>
            </div>
        </section>
    );
};

export default InventarioSapDetalleTipo;