import styles from "../RenaultInventarioPlanificacion.module.css";

export type MetodoPlanificacion = "UBICACION" | "MATERIAL";

interface PlanificacionMethodSelectorProps {
    metodo: MetodoPlanificacion;
    onMetodoChange: (metodo: MetodoPlanificacion) => void;
}

export const PlanificacionMethodSelector = ({metodo, onMetodoChange}: PlanificacionMethodSelectorProps) => {
    return (
        <section className={styles.methodSection}>
            <span className={styles.methodTitle}>Planificar por</span>
            <div className={styles.methodButtons}>
                <button type="button"
                    className={metodo === "UBICACION" ? styles.methodActive : styles.methodButton}
                    onClick={() => onMetodoChange("UBICACION")} >
                    🔠 Ubicación
                </button>

                <button
                    type="button"
                    className={metodo === "MATERIAL" ? styles.methodActive : styles.methodButton}
                    onClick={() => onMetodoChange("MATERIAL")} >
                    🆔 Material
                </button>
            </div>
        </section>
    );
};