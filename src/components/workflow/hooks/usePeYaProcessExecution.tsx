import { PickingMethods } from "../../../core/picking/strategies/PickingMethod";
import type { PickingMethod } from "../../../core/picking/strategies/PickingMethod";
import type { StockItem } from "../../../core/stock/StockItem";
import type { OrderItem } from "../../../core/orders/OrderItem";
import type { WarehouseProcess } from "../../../core/warehouse/WarehouseProcess";
import { PickingSummaryBuilder } from "../../../core/picking/PickingSummaryBuilder";
import { RemitoSummaryBuilder } from "../../../core/remitos/RemitoSummaryBuilder";
import PickingSection from "../sections/PickingSection/PickingSection";
import RemitoSection from "../sections/RemitoSection/RemitoSection";
import { buildInforFileName } from "../../../utils/dateUtils";
import type { ProcessDashboardApi } from "../../WhGeneral/Process/useProcessDashboard";

interface Props {
    process: WarehouseProcess;
    stock: StockItem[];
    orders: OrderItem[];
    pickingMethod: PickingMethod;
    dashboard: ProcessDashboardApi;
}

export const usePeYaProcessExecution = ({
    process,
    stock,
    orders,
    pickingMethod,
    dashboard
}: Props) => {

    const handleExecute = async () => {
        dashboard.procesoRunning();
        dashboard.pickingRunning();
        dashboard.remitoRunning();
        dashboard.informeRunning();

        process.cargarStock(stock);
        process.cargarPedidos(orders);

        process.session.pickingMethod =
            pickingMethod;

        const result =
            await process.ejecutar();

        const remitoSummary =
            RemitoSummaryBuilder.build(
                process.session.remitos
            );

        dashboard.remitoRunning(
            [
                `${remitoSummary.documentos} documentos`,
                `${remitoSummary.destinos} destinos`,
                `${remitoSummary.bultos} bultos`
            ],
            <RemitoSection remitos={process.session.remitos}/>
        );

        if (
            result.success &&
            process.session.stats
        ) {
            const s =
                process.session.stats;

            const metodoTexto =
                pickingMethod ===
                PickingMethods.ACCESSIBILITY
                    ? "Accesibilidad"
                    : "Recorrido";

            const metodoIcono =
                pickingMethod ===
                PickingMethods.ACCESSIBILITY
                    ? "⬇️"
                    : "🚹";

            dashboard.procesoOk([
                `${s.pedidos} pedidos`,
                `${s.lineas} líneas`,
                `${s.bultosAsignados}/${s.bultosSolicitados} bultos`,
                "Método de picking",
                `${metodoIcono} ${metodoTexto.toLowerCase()}`
            ]);

            const pickingSummary =
                PickingSummaryBuilder.build(
                    process.session.picking
                );

            dashboard.pickingRunning(
                [
                    `${pickingSummary.sku} SKU`,
                    `${pickingSummary.lineas} líneas`,
                    `${pickingSummary.bultos} bultos`
                ],
                <PickingSection
                    picking={process.session.picking}
                    shortages={process.session.shortages}
                    stats={process.session.stats}
                />
            );
        }

        const movimientosInfor =
            process.session.movimientos;

        if (movimientosInfor.length > 0) {
            const fileName =
                buildInforFileName();

            dashboard.informeRunning([
                `${movimientosInfor.length} filas`,
                fileName
            ]);
        } else {
            dashboard.informeError([
                "No se generaron movimientos"
            ]);
        }
    };

    return {
        handleExecute
    };
};