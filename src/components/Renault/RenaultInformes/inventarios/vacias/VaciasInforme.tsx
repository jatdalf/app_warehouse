import { useMemo } from "react";
import type { VaciasItem } from "./VaciasItem";
import { VaciasSummaryBuilder } from "../builders/VaciasSummaryBuilder";
import styles from "./VaciasInforme.module.css";

interface Props {
    items: VaciasItem[];
    desde: Date;
    hasta: Date;
}

const VaciasInforme = ({items, desde, hasta}: Props) => {
    const itemsPeriodo = useMemo(() => {
        const inicio = new Date(desde.getFullYear(), desde.getMonth(), desde.getDate());
        const fin = new Date(hasta.getFullYear(), hasta.getMonth(), hasta.getDate(), 23, 59, 59, 999);
        return items.filter(item => item.fecha >= inicio && item.fecha <= fin);
    }, [items, desde, hasta]);

    const resumen = useMemo( () => VaciasSummaryBuilder.build(itemsPeriodo), [itemsPeriodo]);
    const porcentaje = (valor: number) => valor.toLocaleString("es-AR",
            {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            }
        ) + "%";

    if (itemsPeriodo.length === 0) {
        return (
            <section className={styles.container}>
                <div className={styles.title}>Relevamiento de ubicaciones vacías</div>
                <div className={styles.empty}>No hay relevamientos registrados para este período.</div>
            </section>
        );
    }

    return (
        <section className={styles.container}>
            <div className={styles.titleRow}>
                <div>
                    <h3>Relevamiento de ubicaciones vacías</h3>
                    <p>Control de ubicaciones relevadas e intrusos detectados</p>
                </div>
                <div className={styles.kpis}>
                    <div className={styles.kpiOk}>
                        <span>Exactitud</span>
                        <strong>{porcentaje(resumen.porcentajeOk)}</strong>
                    </div>

                    <div className={styles.kpiIntruso}>
                        <span>Intrusos detectados</span>
                        <strong>{resumen.totalIntruso.toLocaleString("es-AR")}</strong>
                    </div>
                </div>
            </div>

            <div className={styles.tableWrapper}>
                <table className={styles.table}>
                    <thead>
                        <tr>
                            <th>Fecha</th>
                            <th>Total Ubicaciones</th>
                            <th>OK</th>
                            <th>Intruso / Ocupado</th>
                            <th>% OK</th>
                            <th>% Intruso</th>
                        </tr>
                    </thead>
                    <tbody>
                        {resumen.lineas.map((item, index) => (
                                <tr key={`${item.fecha.getTime()}-${index}`}>
                                    <td>{item.fecha.toLocaleDateString("es-AR")}</td>
                                    <td>{item.totalUbicaciones.toLocaleString("es-AR")}</td>
                                    <td className={styles.ok}>{item.ok.toLocaleString("es-AR")}</td>
                                    <td className={item.intruso > 0 ? styles.intruso : undefined}>
                                        {item.intruso.toLocaleString("es-AR")}
                                    </td>
                                    <td className={styles.ok}>{porcentaje(item.porcentajeOk)}</td>
                                    <td className={item.porcentajeIntruso > 0 ? styles.intruso : undefined}>
                                        {porcentaje(item.porcentajeIntruso)}
                                    </td>
                                </tr>
                            )
                        )}
                        <tr className={styles.totalRow}>
                            <td>
                                TOTAL
                            </td>
                            <td>
                                {resumen.totalUbicaciones
                                    .toLocaleString("es-AR")}
                            </td>
                            <td>
                                {resumen.totalOk
                                    .toLocaleString("es-AR")}
                            </td>
                            <td>
                                {resumen.totalIntruso
                                    .toLocaleString("es-AR")}
                            </td>
                            <td>
                                {porcentaje(resumen.porcentajeOk)}
                            </td>
                            <td>
                                {porcentaje(resumen.porcentajeIntruso)}
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </section>
    );
};

export default VaciasInforme;