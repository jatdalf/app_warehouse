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
import { PickingPrintEngine } from "../../core/engines/PickingPrintEngine";
import PickingDetailPanel from "./sections/PickingSection/PickingDetailPanel";
import type { PickingItem } from "../../core/picking/PickingItem";
import { WarehouseSession } from "../../core/warehouse/WarehouseSession";
import RemitoDetailPanel from "./sections/RemitoSection/RemitoDetailPanel";
import type { Remito } from "../../core/remitos/Remito";
import { generarSalidaInfor } from "../../services/inforExcel";
import { buildInforFileName } from "../../utils/dateUtils";

const PeYaWorkflow: React.FC = () => {   
    const dashboard = useProcessDashboard();
    const [stock,setStock]=useState<StockItem[]>([]);
    const [stockFileName, setStockFileName] = useState("");
    const [orders,setOrders]=useState<OrderItem[]>([]);
    const [openedDetail, setOpenedDetail] = useState<string | null>(null);
    const [process] = useState(() => new WarehouseProcess());
    const [pickingMethod, setPickingMethod] = useState<PickingMethod>(PickingMethods.LOCATION);

    const handleExecute = async () => {
        dashboard.procesoRunning();
        dashboard.pickingRunning();
        dashboard.remitoRunning();
        dashboard.informeRunning();
        process.cargarStock(stock);
        process.cargarPedidos(orders);     
        process.session.pickingMethod = pickingMethod;   
        const result = await process.ejecutar();
        const remitoSummary = RemitoSummaryBuilder.build(process.session.remitos);
        dashboard.remitoRunning(
            [
                `${remitoSummary.documentos} documentos`,
                `${remitoSummary.destinos} destinos`,
                `${remitoSummary.bultos} bultos`
            ],
            <RemitoSection remitos={process.session.remitos} />
        );
        if (result.success && process.session.stats) {
            const s = process.session.stats;
            const metodoTexto = pickingMethod === PickingMethods.ACCESSIBILITY
                    ? "Accesibilidad"
                    : "Recorrido";
            const metodoIcono = pickingMethod === PickingMethods.ACCESSIBILITY
                    ? "⬇️"
                    : "🚹";
            dashboard.procesoOk([
                `${s.pedidos} pedidos`,
                `${s.lineas} líneas`,
                `${s.bultosAsignados}/${s.bultosSolicitados} bultos`,
                "Método de picking",
                `${metodoIcono} ${metodoTexto.toLowerCase()}`
            ]);
        const pickingSummary = PickingSummaryBuilder.build(process.session.picking);
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
        const movimientosInfor = process.session.movimientos;
        if (movimientosInfor.length > 0) {
            const fileName = buildInforFileName();
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
    function formatDate(value: number) {
        return new Date(value).toLocaleString("es-AR", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit"
            });
        }
    const handlePrintPicking = async () => {
        const engine = new PickingPrintEngine();
        const result = await engine.execute(process.session);
        if (result.success) {
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
    const handlePrintRemitos = () => {
        const remitosParaVista = process.session.remitos.map(remito => ({
                st: remito.pedido, remito: remito.numero
            }));
        const printData = {data: orders, remitos: remitosParaVista};
        sessionStorage.setItem("peya-remito-print-data", JSON.stringify(printData));
        window.open("/PeYaRemito", "_blank");
        const remitoSummary = RemitoSummaryBuilder.build(process.session.remitos);
        dashboard.remitoOk([
            `${remitoSummary.documentos} documentos`,
            `${remitoSummary.destinos} destinos`,
            `${remitoSummary.bultos} bultos`
        ]);
    };
    const handlePrintPickingST = async (st: string, items: PickingItem[]) => {
        const tempSession = new WarehouseSession();
        tempSession.picking = [...items];
        const engine = new PickingPrintEngine();
        const result = await engine.execute(tempSession);
        if (!result.success) {
            console.error(`No fue posible imprimir el picking ${st}`);
        }
    };
    const handlePrintSingleRemito = (remito: Remito) => {
        const orderRows = orders.filter(item => item.st === remito.pedido);
        const printData = {
            data: orderRows,
            remitos: [
                {
                    st: remito.pedido,
                    remito: remito.numero
                }
            ]
        };
        sessionStorage.setItem("peya-remito-print-data", JSON.stringify(printData));
        window.open("/PeYaRemito", "_blank");
    };
    const handleExportInfor = async () => {
        const movimientosInfor = process.session.movimientos;
        if (movimientosInfor.length === 0) {
            dashboard.informeError(["No hay movimientos para exportar"]);
            return;
        }
        const fileName = buildInforFileName();
        try {
            await generarSalidaInfor(movimientosInfor, fileName);
            dashboard.informeOk([
                `${movimientosInfor.length} filas`,
                fileName
            ]);
        } catch (error) {
            console.error(error);
            dashboard.informeError(["No fue posible generar el archivo"]);
        }
    };

    return (        
    <div className={styles.container}>
        <PeYaHeader />
        <ProcessDashboard steps={dashboard.steps} onOpenedChange={setOpenedDetail} stockProps={{
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
            pickingProps={{
                enabled: process.session.picking.length > 0, onPrint: handlePrintPicking
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
                onMethodChange: setPickingMethod, enabled: stock.length > 0 && orders.length > 0,
                onExecute: handleExecute
            }}
            remitoProps={{
                enabled: process.session.remitos.length > 0, onPrint: handlePrintRemitos
            }}
            exportProps={{
                enabled: process.session.movimientos.length > 0,
                onExport: handleExportInfor
            }}
        />
        {openedDetail === "pedidos" && orders.length > 0 && (
            <section className={styles.externalDetail}>
                <OrdersDetail orders={orders} />
            </section>
            )}
        {openedDetail === "picking" && process.session.picking.length > 0 && (
            <section className={styles.externalDetail}>
                <PickingDetailPanel
                    picking={process.session.picking}
                    onPrintPicking={handlePrintPickingST}
                />
            </section>
        )}      
        {openedDetail === "remito" && process.session.remitos.length > 0 && (
            <section className={styles.externalDetail}>
                <RemitoDetailPanel
                    remitos={process.session.remitos}
                    onPrintRemito={handlePrintSingleRemito}
                />
            </section>
        )}     
    </div>
    );    
};

export default PeYaWorkflow;