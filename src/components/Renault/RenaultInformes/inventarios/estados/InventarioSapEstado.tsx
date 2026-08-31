import { useMemo } from "react";
import type { InventarioSapLinea } from "../InventarioSapLinea";
import styles from "./InventarioSapEstado.module.css";

interface Props {
    lineas: InventarioSapLinea[];
}

const InventarioSapEstado: React.FC<Props> = ({lineas}) => {
    const resumen = useMemo(() => {
        /* IMPORTANTE: contamos DOCUMENTOS DE INVENTARIO, no líneas. */
        const abiertos = lineas.filter( item => item.statusInventario.trim()
                        .toUpperCase() !== "ELIMINADOS");
        const cerrados = lineas.filter( item => item.statusInventario.trim()
                        .toUpperCase() === "ELIMINADOS");
        const cantidadAbiertos = abiertos.length;
        const cantidadCerrados = cerrados.length;
        const incidentes = 0;
        const total = cantidadAbiertos + cantidadCerrados;
        const resumenTiposAbiertos = abiertos.reduce<Record<string, number>>((acc, item) => {
            const tipo = item.referencia.trim().toUpperCase() || "SIN TIPO";
            acc[tipo] = (acc[tipo] || 0) + 1;
            return acc;
        },{});

        return {
            abiertos: cantidadAbiertos,
            cerrados: cantidadCerrados,
            incidentes,
            total,
            tiposAbiertos: resumenTiposAbiertos
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
                        <td>🚨 SE CREÓ INCIDENTE</td>
                        <td>{resumen.incidentes}</td>
                        <td>{porcentaje(resumen.incidentes)}</td>
                    </tr>
                    {/* ABIERTOS */}
                    <tr className={styles.abierto}>
                    <td>⏳ PENDIENTE / INVENTARIO ABIERTO</td>
                    <td>{resumen.abiertos > 0 ? (
                        <div className={styles.tooltipContainer}>
                        <span className={styles.cantidadAbiertos}>{resumen.abiertos}</span>
                            <div className={styles.tooltip}>
                                <div className={styles.tooltipTitle}>
                                    Inventarios pendientes
                                </div>
                                {Object.entries(resumen.tiposAbiertos).map(([tipo, cantidad]) => (
                                <div key={tipo} className={styles.tooltipRow} >
                                    <span>{tipo}</span>
                                    <strong>{cantidad}</strong>
                                </div>))}
                            </div>
                        </div>
                        ) : (0)}
                    </td>
                    <td>{porcentaje(resumen.abiertos)}</td>
                    </tr>
                    {/* CERRADOS */}
                    <tr className={styles.cerrado}>
                        <td>☑ INVENTARIOS CERRADOS</td>
                        <td>{resumen.cerrados}</td>
                        <td>{porcentaje(resumen.cerrados)}</td>
                    </tr>
                </tbody>
            </table>
        </section>
    );
};

export default InventarioSapEstado;