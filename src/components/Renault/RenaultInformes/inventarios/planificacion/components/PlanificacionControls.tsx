import type { WarehouseInventario } from "../../InventarioWarehouseConfig";
import styles from "../RenaultInventarioPlanificacion.module.css";

interface PlanificacionControlsProps {
    warehouse: WarehouseInventario;
    fecha: string;
    target: number;
    targetMaximo: number;
    onWarehouseChange: (warehouse: WarehouseInventario) => void;
    onFechaChange: (fecha: string) => void;
    onTargetChange: (target: number) => void;
}

export const PlanificacionControls = ({
    warehouse,
    fecha,
    target,
    targetMaximo,
    onWarehouseChange,
    onFechaChange,
    onTargetChange
}: PlanificacionControlsProps) => {
    return (
        <section className={styles.controls}>
            <label className={styles.controlGroup}>
                <span>Warehouse</span>
                <select value={warehouse}
                    onChange={event => onWarehouseChange(event.target.value as WarehouseInventario)} >
                    <option value="W1">W1 (Rep)</option>
                    <option value="W2">W2 (BsAs)</option>
                </select>
            </label>

            <label className={styles.controlGroup}>
                <span>Fecha del inventario</span>
                <input type="date" value={fecha}
                    onChange={event => onFechaChange(event.target.value)} />
            </label>

            <label className={styles.controlGroup}>
                <span>Target diario</span>
                <input
                    type="number"
                    min={1}
                    max={targetMaximo}
                    value={target}
                    onChange={event => onTargetChange(Math.max(1, Number(event.target.value) || 1))}
                />
            </label>
        </section>
    );
};