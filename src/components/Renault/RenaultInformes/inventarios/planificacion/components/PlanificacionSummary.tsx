import { useMemo } from "react";
import type { WarehouseInventario } from "../../InventarioWarehouseConfig";
import type { MetodoPlanificacion } from "./PlanificacionMethodSelector";
import type { PlanificacionUbicacion } from "../../hooks/usePlanificacionUbicaciones";

import styles from "../RenaultInventarioPlanificacion.module.css";

interface PlanificacionSummaryProps {
    warehouse: WarehouseInventario;
    fecha: string;
    metodo: MetodoPlanificacion;
    target: number;
    ubicaciones: PlanificacionUbicacion[];
    ubicacionesSeleccionadas: Set<string>;
}

interface ResumenStorage {
    storage: string;
    llenas: number;
    vacias: number;
    total: number;
}

const esMaterialVacio = (material: string) => {
    return material.trim().toLowerCase() === "<< vacías >>";
};

export const PlanificacionSummary = ({
    warehouse,
    fecha,
    metodo,
    target,
    ubicaciones,
    ubicacionesSeleccionadas
}: PlanificacionSummaryProps) => {

    const resumen = useMemo(() => {
        const seleccionadas = ubicaciones.filter(
            item => ubicacionesSeleccionadas.has(item.key)
        );

        let llenas = 0;
        let vacias = 0;

        const mapaStorage =
            new Map<string, ResumenStorage>();

        seleccionadas.forEach(item => {
            const estaVacia =
                item.materiales.length === 0 ||
                item.materiales.every(
                    material =>
                        esMaterialVacio(material)
                );

            if (estaVacia) {
                vacias++;
            } else {
                llenas++;
            }

            const actual =
                mapaStorage.get(item.storage) ?? {
                    storage: item.storage,
                    llenas: 0,
                    vacias: 0,
                    total: 0
                };

            if (estaVacia) {
                actual.vacias++;
            } else {
                actual.llenas++;
            }

            actual.total++;

            mapaStorage.set(
                item.storage,
                actual
            );
        });

        const storages = [...mapaStorage.values()]
            .sort((a, b) =>
                a.storage.localeCompare(
                    b.storage,
                    undefined,
                    { numeric: true }
                )
            );

        const total = seleccionadas.length;

        const cumplimiento =
            target > 0
                ? (total / target) * 100
                : 0;

        return {
            total,
            llenas,
            vacias,
            cumplimiento,
            storages
        };
    }, [
        ubicaciones,
        ubicacionesSeleccionadas,
        target
    ]);

    if (resumen.total === 0) {
        return null;
    }

    const fechaFormateada = (() => {
        const [year, month, day] =
            fecha.split("-");

        return `${day}/${month}/${year}`;
    })();

    return (
        <section className={styles.summaryCard}>
            <div className={styles.summaryHeader}>
                <div>
                    <h2>Resumen de planificación</h2>

                    <span>
                        {warehouse} · {fechaFormateada}
                    </span>
                </div>

                <span className={styles.summaryMethod}>
                    {metodo === "UBICACION"
                        ? "Por ubicación"
                        : "Por material"}
                </span>
            </div>

            <div className={styles.summaryMetrics}>
                <div>
                    <span>Planificadas</span>
                    <strong>{resumen.total}</strong>
                </div>

                <div>
                    <span>Target</span>
                    <strong>{target}</strong>
                </div>

                <div>
                    <span>Cumplimiento</span>
                    <strong>
                        {resumen.cumplimiento.toLocaleString(
                            "es-AR",
                            {
                                minimumFractionDigits: 1,
                                maximumFractionDigits: 1
                            }
                        )}
                        %
                    </strong>
                </div>

                <div>
                    <span>Llenas</span>
                    <strong>{resumen.llenas}</strong>
                </div>

                <div>
                    <span>Vacías</span>
                    <strong>{resumen.vacias}</strong>
                </div>

                <div>
                    <span>Storages</span>
                    <strong>
                        {resumen.storages.length}
                    </strong>
                </div>
            </div>

            <div className={styles.summaryTableWrapper}>
                <table className={styles.summaryTable}>
                    <thead>
                        <tr>
                            <th>Storage</th>
                            <th>Llenas</th>
                            <th>Vacías</th>
                            <th>Total</th>
                        </tr>
                    </thead>

                    <tbody>
                        {resumen.storages.map(item => (
                            <tr key={item.storage}>
                                <td>{item.storage}</td>
                                <td>{item.llenas}</td>
                                <td>{item.vacias}</td>
                                <td>
                                    <strong>
                                        {item.total}
                                    </strong>
                                </td>
                            </tr>
                        ))}
                    </tbody>

                    <tfoot>
                        <tr>
                            <td>
                                <strong>TOTAL</strong>
                            </td>
                            <td>
                                <strong>
                                    {resumen.llenas}
                                </strong>
                            </td>
                            <td>
                                <strong>
                                    {resumen.vacias}
                                </strong>
                            </td>
                            <td>
                                <strong>
                                    {resumen.total}
                                </strong>
                            </td>
                        </tr>
                    </tfoot>
                </table>
            </div>
        </section>
    );
};