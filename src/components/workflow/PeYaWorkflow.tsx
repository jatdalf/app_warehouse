import { useState } from "react";
import styles from "./PeYaWorkflow.module.css";
import PeYaHeader from "./PeYaHeader/PeYaHeader";
import ProcessDashboard from "../WhGeneral/Process/ProcessDashboard";
import OrdersSection from "./sections/OrdersSection/OrdersSection"
import PickingSection from "./sections/PickingSection/PickingSection";
import { WarehouseProcess } from "../../core/warehouse/WarehouseProcess";
import type { StockItem } from "../../core/stock/StockItem";
import type { OrderItem } from "../../core/orders/OrderItem";
import { useProcessDashboard } from "../WhGeneral/Process/useProcessDashboard";
import { OrderSummaryBuilder } from "../../core/orders/OrderSummaryBuilder";
import { PickingSummaryBuilder } from "../../core/picking/PickingSummaryBuilder";
import { RemitoSummaryBuilder } from "../../core/remitos/RemitoSummaryBuilder";
import RemitoSection from "./sections/RemitoSection/RemitoSection";
import { PickingMethods } from "../../core/picking/strategies/PickingMethod";
import type { PickingMethod } from "../../core/picking/strategies/PickingMethod";

import ExecutionPanel from "../ExecutionPanel/ExecutionPanel";

const PeYaWorkflow: React.FC = () => {   
    const dashboard = useProcessDashboard();
    const [stock,setStock]=useState<StockItem[]>([]);
    const [orders,setOrders]=useState<OrderItem[]>([]);
    const [process] = useState(() => new WarehouseProcess());
    const [pickingMethod, setPickingMethod] = useState<PickingMethod>(PickingMethods.LOCATION);
    const handleExecute = async () => {
        dashboard.procesoRunning();
        process.cargarStock(stock);
        process.cargarPedidos(orders);     
        process.session.pickingMethod = pickingMethod;   
        const result = await process.ejecutar();
        const remitoSummary = RemitoSummaryBuilder.build(process.session.remitos);
        dashboard.remitoOk(
            [
                `${remitoSummary.documentos} documentos`,
                `${remitoSummary.destinos} destinos`,
                `${remitoSummary.bultos} bultos`
            ],
            <RemitoSection remitos={process.session.remitos} />
        );
        if (result.success && process.session.stats) {
            const s = process.session.stats;
            dashboard.procesoOk([
                `${s.pedidos} pedidos`,
                `${s.lineas} líneas`,
                `${s.bultosAsignados}/${s.bultosSolicitados} bultos`
            ]);
        const pickingSummary = PickingSummaryBuilder.build(process.session.picking);
        dashboard.pickingOk(
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
    };  

    return (        
    <div className={styles.container}>
        <PeYaHeader />
        <ProcessDashboard steps={dashboard.steps} stockProps={{
            onLoaded: (items) => {
                setStock(items);
                const sku = new Set( items.map(i => i.articulo)).size;
                dashboard.stockOk([
                    `${items.length} posiciones`,
                    `${sku} SKU`
                    ]);
                }
            }}
            ordersProps={{
                onLoaded: (items) => {
                    setOrders(items);
                    const resumen = OrderSummaryBuilder.build(items);
                    dashboard.pedidosOk([
                        `${resumen.sku} SKU`,
                        `${resumen.lineas} líneas`,
                        `${resumen.bultos} bultos`
                    ]);
                }
            }}

            executionProps={{
                method: pickingMethod,
                onMethodChange: setPickingMethod,
                enabled:
                    stock.length > 0 &&
                    orders.length > 0,
                onExecute: handleExecute
            }}
        />
        <ExecutionPanel
            method={pickingMethod}
            onMethodChange={setPickingMethod}
            enabled={
                stock.length > 0 &&
                orders.length > 0
            }
            onExecute={handleExecute}
        />

        <OrdersSection onLoaded={(items) => {
            setOrders(items);
            const resumen = OrderSummaryBuilder.build(items);
            dashboard.pedidosOk([
                `${resumen.sku} SKU`,
                `${resumen.lineas} líneas`,
                `${resumen.bultos} bultos`
            ]);
        }}/>
    </div>
    );
};

export default PeYaWorkflow;