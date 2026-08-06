import { useState } from "react";
import styles from "./PeYaWorkflow.module.css";
import PeYaHeader from "./PeYaHeader/PeYaHeader";
import ProcessDashboard from "../WhGeneral/Process/ProcessDashboard";
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
import OrdersDetail from "./sections/OrdersSection/OrdersDetail";
import InforSection from "./sections/InforSection/InforSection";

const PeYaWorkflow: React.FC = () => {   
    const dashboard = useProcessDashboard();
    const [stock,setStock]=useState<StockItem[]>([]);
    const [stockFileName, setStockFileName] = useState("");
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
            const metodoTexto =
                pickingMethod === PickingMethods.ACCESSIBILITY
                    ? "Accesibilidad"
                    : "Recorrido";
            dashboard.procesoOk([                
                `${s.pedidos} pedidos`,
                `${s.lineas} líneas`,
                `${s.bultosAsignados}/${s.bultosSolicitados} bultos`,
                `Método: ${metodoTexto}`,
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
            const movimientosInfor = process.session.movimientos;
            if (movimientosInfor.length > 0) {
                dashboard.informeOk(
                    [
                        `${movimientosInfor.length} filas`,
                        "Infor00000.xlsx"
                    ],
                    <InforSection
                        data={movimientosInfor}
                    />
                );
            } else {
                dashboard.informeError([
                    "No se generaron movimientos"
                ]);
            }
        }
    };  
    function formatDate(value: number) {
        return new Date(value).toLocaleString("es-AR", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit"
        });
    }

    return (        
    <div className={styles.container}>
        <PeYaHeader />
        <ProcessDashboard steps={dashboard.steps} stockProps={{
            fileName: stockFileName,
            onLoaded: (items, fileName, lastModified) => {
                setStock(items);
                setStockFileName(fileName);
                const sku = new Set(items.map(item => item.articulo)).size;
                dashboard.stockOk([
                    fileName,
                    formatDate(lastModified),
                    `${items.length} posiciones`, 
                    `${sku} SKU`
                ]);
            },
            onError: (message) => {
                setStock([]);
                setStockFileName("");
                dashboard.stockError([
                    message
                ]);
            }
        }}
        ordersProps={{
            onLoaded: (items) => {
                setOrders(items);
                const resumen = OrderSummaryBuilder.build(items);
                const pedidos = new Set(items.map(item => item.st)).size;
                dashboard.pedidosOk(
                    [
                        `${pedidos} pedidos`,
                        `${resumen.sku} SKU`,
                        `${resumen.lineas} líneas`,
                        `${resumen.bultos} bultos`
                    ],
                    <OrdersDetail orders={items} />
                );
            },
            onError: (message) => {
                setOrders([]);
                dashboard.pedidosError([
                    message
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
    </div>
    );
};

export default PeYaWorkflow;