import { PickingMethods } from "../../core/picking/strategies/PickingMethod";
import type { ExecutionCardProps } from "../WhGeneral/Process/ProcessDashboardProps";
import styles from "./ProcessCardContent.module.css";

const ProcessCardContent: React.FC<ExecutionCardProps> = ({
    method,
    onMethodChange,
    enabled,
    onExecute
}) => {
    return (
        <div className={styles.content}>
            <div className={styles.heading}>
                Seleccione método
            </div>
            <button
                type="button"
                title="Menor distancia recorrida por el operario."
                aria-pressed={
                    method === PickingMethods.LOCATION
                }
                className={`
                    ${styles.method}
                    ${
                        method === PickingMethods.LOCATION
                            ? styles.selected
                            : ""
                    }
                `}
                onClick={() =>
                    onMethodChange(
                        PickingMethods.LOCATION
                    )
                }
            >
                <span className={styles.methodIcon}>
                    🚹
                </span>

                <span>Recorrido</span>
            </button>

            <button
                type="button"
                title="Prioriza posiciones de piso y escalera."
                aria-pressed={
                    method === PickingMethods.ACCESSIBILITY
                }
                className={`
                    ${styles.method}
                    ${
                        method === PickingMethods.ACCESSIBILITY
                            ? styles.selected
                            : ""
                    }
                `}
                onClick={() =>
                    onMethodChange(
                        PickingMethods.ACCESSIBILITY
                    )
                }
            >
                <span className={styles.methodIcon}>
                    ⬇️
                </span>

                <span>Accesibilidad</span>
            </button>

            <button
                type="button"
                className={styles.executeButton}
                disabled={!enabled}
                onClick={onExecute}
            >
                Ejecutar
            </button>
        </div>
    );
};

export default ProcessCardContent;