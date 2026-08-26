import { useMemo } from "react";
import type { InventarioSapLinea } from "../InventarioSapLinea";

import styles from "./InventarioSapEstado.module.css";

interface Props {
    lineas: InventarioSapLinea[];
}

const InventarioSapEstado: React.FC<Props> = ({
    lineas
}) => {

    const resumen = useMemo(() => {

        /*
         * IMPORTANTE:
         * contamos DOCUMENTOS DE INVENTARIO,
         * no líneas.
         */
        const abiertos = lineas.filter( item => item.statusInventario.trim()
                        .toUpperCase() !== "ELIMINADOS");
        const cerrados = lineas.filter( item => item.statusInventario.trim()
                        .toUpperCase() === "ELIMINADOS");
        const cantidadAbiertos = abiertos.length;
        const cantidadCerrados = cerrados.length;
        const incidentes = 0;
        const total = cantidadAbiertos + cantidadCerrados;

        return {
            abiertos: cantidadAbiertos,
            cerrados: cantidadCerrados,
            incidentes,
            total
        };

    }, [lineas]);


    const porcentaje = (cantidad: number) => {
        if (resumen.total === 0) {
            return "0,00%";
        }
        return (cantidad / resumen.total * 100).toLocaleString("es-AR",
            {minimumFractionDigits: 2, maximumFractionDigits: 2}) + "%";
    };


    return (
        <section className={styles.container}>
            <div className={styles.title}>
                🔓 INVENTARIOS ABIERTOS
                (PENDIENTES DE CIERRE)
            </div>
            <table className={styles.table}>
                <thead>
                    <tr>
                        <th>Razón</th>
                        <th>Cantidad</th>
                        <th>% del Total</th>
                    </tr>
                </thead>
                <tbody>
                    {/* INCIDENTES */}
                    <tr className={styles.incidente}>
                        <td>
                            🚨 SE CREÓ INCIDENTE
                        </td>
                        <td>
                            {resumen.incidentes}
                        </td>
                        <td>
                            {porcentaje(
                                resumen.incidentes
                            )}
                        </td>
                    </tr>
                    {/* ABIERTOS */}
                    <tr className={styles.abierto}>
                        <td>
                            ⏳ PENDIENTE / INVENTARIO ABIERTO
                        </td>
                        <td>
                            {resumen.abiertos}
                        </td>
                        <td>
                            {porcentaje(
                                resumen.abiertos
                            )}
                        </td>
                    </tr>
                    {/* CERRADOS */}
                    <tr className={styles.cerrado}>
                        <td>
                            ☑ INVENTARIOS CERRADOS
                        </td>
                        <td>
                            {resumen.cerrados}
                        </td>
                        <td>
                            {porcentaje(
                                resumen.cerrados
                            )}
                        </td>
                    </tr>
                </tbody>
            </table>
        </section>
    );
};

export default InventarioSapEstado;