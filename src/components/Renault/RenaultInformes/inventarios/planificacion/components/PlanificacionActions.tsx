import styles from "../RenaultInventarioPlanificacion.module.css";
interface PlanificacionActionsProps {
    guardando: boolean;
    cantidadSeleccionada: number;
    onGuardar: () => void;
}

export const PlanificacionActions = ({guardando, cantidadSeleccionada, onGuardar}: PlanificacionActionsProps) => {
    return (
        <section className={styles.actions}>
            <button type="button" className={styles.suggestButton} disabled >
                ✨ Sugerir ubicaciones
            </button>

            <button type="button" className={styles.saveButton}
                onClick={onGuardar} disabled={guardando || cantidadSeleccionada === 0} >
                {guardando ? "💾 Guardando..." : "💾 Guardar planificación"}
            </button>
        </section>
    );
};