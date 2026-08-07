import type { Remito } from "../../../../core/remitos/Remito";
import styles from "./RemitoDetailPanel.module.css";

interface Props {
    remitos: Remito[];
    onPrintRemito(remito: Remito): void;
}

const RemitoDetailPanel: React.FC<Props> = ({remitos, onPrintRemito}) => {
    return (
        <div className={styles.container}>
            <h2 className={styles.title}>
                Remitos
            </h2>

            <div className={styles.table}>
                <div className={styles.header}>
                    <div>Remito</div>
                    <div>Pedido</div>
                    <div>Destino</div>
                    <div>Bultos</div>
                    <div></div>
                </div>

                {remitos.map(remito => {
                    const bultos = remito.productos.reduce((total, producto) => total + producto.bultos, 0);

                    return (
                        <div
                            key={remito.numero}
                            className={styles.row}
                        >
                            <div>
                                {remito.numero}
                            </div>

                            <div>
                                {remito.pedido}
                            </div>

                            <div>
                                {remito.destinoNombre}
                            </div>

                            <div>
                                {bultos}
                            </div>

                            <div>
                                <button
                                    type="button"
                                    className={styles.printButton}
                                    onClick={() =>
                                        onPrintRemito(remito)
                                    }
                                >
                                    🖨️ Imprimir
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default RemitoDetailPanel;