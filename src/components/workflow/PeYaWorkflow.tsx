import { useState } from "react";
import styles from "./PeYaWorkflow.module.css";
import PeYaHeader from "./PeYaHeader/PeYaHeader";
import ProcessDashboard from "../WhGeneral/Process/ProcessDashboard";
import { WarehouseProcess } from "../../core/warehouse/WarehouseProcess";
import type { StockItem } from "../../core/stock/StockItem";
import type { OrderItem } from "../../core/orders/OrderItem";
import { useProcessDashboard } from "../WhGeneral/Process/useProcessDashboard";
import { OrderSummaryBuilder } from "../../core/orders/OrderSummaryBuilder";
import { PickingMethods } from "../../core/picking/strategies/PickingMethod";
import type { PickingMethod } from "../../core/picking/strategies/PickingMethod";
import PeYaWorkflowDetail from "./PeYaWorkflowDetail";
import { usePeYaPrintActions } from "./hooks/usePeYaPrintActions";
import { usePeYaProcessExecution } from "./hooks/usePeYaProcessExecution";
import { usePeYaExportActions } from "./hooks/usePeYaExportActions";

const PeYaWorkflow: React.FC = () => {   
    const dashboard = useProcessDashboard();
    const [stock,setStock]=useState<StockItem[]>([]);
    const [stockFileName, setStockFileName] = useState("");
    const [orders,setOrders]=useState<OrderItem[]>([]);
    const [openedDetail, setOpenedDetail] = useState<string | null>(null);
    const [process] = useState(() => new WarehouseProcess());
    const [pickingMethod, setPickingMethod] = useState<PickingMethod>(PickingMethods.LOCATION);

    const { handleExecute } = usePeYaProcessExecution({
        process,
        stock,
        orders,
        pickingMethod,
        dashboard
    });

    function formatDate(value: number) {
        return new Date(value).toLocaleString("es-AR", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit"
            });
        }
    const {handlePrintPicking, handlePrintPickingST, handlePrintRemitos, handlePrintSingleRemito
    } = usePeYaPrintActions({process, orders, dashboard});

    const {handleExportInfor} = usePeYaExportActions({process, dashboard});

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
                dashboard.stockError([message]);
            }
            }}
            pickingProps={{enabled: process.session.picking.length > 0, onPrint: handlePrintPicking}}
            
            ordersProps={{onLoaded: (items) => {
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
                    dashboard.pedidosError([message]);
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
        <PeYaWorkflowDetail
            openedDetail={openedDetail}
            orders={orders}
            process={process}
            onPrintPickingST={handlePrintPickingST}
            onPrintRemito={handlePrintSingleRemito}
        />  
    </div>
    );    
};

export default PeYaWorkflow;