import styles from "../RenaultInventarioPlanificacion.module.css";
interface PlanificacionActionsProps {
    guardando: boolean;
    cantidadSeleccionada: number;
    onGuardar: () => void;
    onDescargarExcel: () => void;
    onSugerirUbicaciones: () => void;
}

export const PlanificacionActions = ({guardando, cantidadSeleccionada, onGuardar, onDescargarExcel, onSugerirUbicaciones
}: PlanificacionActionsProps) => {
    return (
        <section className={styles.actions}>
            <button type="button" className={styles.suggestButton} onClick={onSugerirUbicaciones}>
                ✨ Sugerir ubicaciones
            </button>

            <button type="button" className={styles.saveButton}
                onClick={onGuardar} disabled={guardando || cantidadSeleccionada === 0} >
                {guardando ? "💾 Guardando..." : "💾 Guardar planificación"}
            </button>

            <button
                type="button"
                className={styles.excelButton}
                onClick={onDescargarExcel}
                disabled={cantidadSeleccionada === 0}
            >
                📥 Descargar Excel
            </button>
        </section>
    );
};