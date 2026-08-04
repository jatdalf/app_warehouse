import styles from "./ExecutionPanel.module.css";
import { PickingMethods } from "../../core/picking/strategies/PickingMethod";
import type { PickingMethod } from "../../core/picking/strategies/PickingMethod";

interface Props {
    method: PickingMethod;
    onMethodChange(method: PickingMethod): void;
    enabled: boolean;
    onExecute(): void;
}

const ExecutionPanel: React.FC<Props> = ({
    method,
    onMethodChange,
    enabled,
    onExecute
}) => {

    return (
        <div className={styles.panel}>
            <h3 className={styles.title}>
                Configuración del proceso
            </h3>
            <div className={styles.subtitle}>
                Método de Picking
            </div>
            <div className={styles.methods}>
                <div
                    className={`${styles.method}
                        ${method === PickingMethods.LOCATION
                            ? styles.selected
                            : ""
                        }`}
                    onClick={() => onMethodChange(PickingMethods.LOCATION)}
                >
                    <div className={styles.methodTitle}>
                        🚹 Optimizar recorrido
                    </div>
                    <div className={styles.methodDescription}>
                        Menor distancia recorrida por el operario.
                    </div>
                </div>
                <div
                    className={`${styles.method}
                        ${method === PickingMethods.ACCESSIBILITY
                            ? styles.selected
                            : ""
                        }`}
                    onClick={() =>
                        onMethodChange(
                            PickingMethods.ACCESSIBILITY
                        )
                    }
                >
                    <div className={styles.methodTitle}>
                        ⬇️ Optimizar accesibilidad
                    </div>
                    <div className={styles.methodDescription}>
                        Prioriza posiciones de piso y escalera.
                    </div>
                </div>
            </div>

            <button
                className={styles.executeButton}
                disabled={!enabled}
                onClick={onExecute}
            >
                Ejecutar proceso
            </button>
        </div>
    );
};

export default ExecutionPanel;