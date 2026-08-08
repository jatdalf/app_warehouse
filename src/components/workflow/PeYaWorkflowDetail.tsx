import type { OrderItem } from "../../core/orders/OrderItem";
import type { PickingItem } from "../../core/picking/PickingItem";
import type { Remito } from "../../core/remitos/Remito";
import type { WarehouseProcess } from "../../core/warehouse/WarehouseProcess";
import OrdersDetail from "./sections/OrdersSection/OrdersDetail";
import PickingDetailPanel from "./sections/PickingSection/PickingDetailPanel";
import RemitoDetailPanel from "./sections/RemitoSection/RemitoDetailPanel";
import styles from "./PeYaWorkflow.module.css";

interface Props {
    openedDetail: string | null;
    orders: OrderItem[];
    process: WarehouseProcess;
    onPrintPickingST(st: string, items: PickingItem[]): void;
    onPrintRemito(remito: Remito): void;
}

const PeYaWorkflowDetail: React.FC<Props> = ({
    openedDetail,
    orders,
    process,
    onPrintPickingST, onPrintRemito}) => {
    if (openedDetail === "pedidos" && orders.length > 0) {
        return (
            <section className={styles.externalDetail}>
                <OrdersDetail orders={orders} />
            </section>
        );
    }
    if (openedDetail === "picking" && process.session.picking.length > 0) {
        return (
            <section className={styles.externalDetail}>
                <PickingDetailPanel
                    picking={process.session.picking}
                    onPrintPicking={onPrintPickingST}
                />
            </section>
        );
    }

    if (openedDetail === "remito" && process.session.remitos.length > 0) {
        return (
            <section className={styles.externalDetail}>
                <RemitoDetailPanel
                    remitos={process.session.remitos}
                    onPrintRemito={onPrintRemito}
                />
            </section>
        );
    }
    return null;
};

export default PeYaWorkflowDetail;