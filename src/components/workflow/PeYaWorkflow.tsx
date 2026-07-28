import { useState } from "react";
import styles from "./PeYaWorkflow.module.css";
import PeYaHeader from "./PeYaHeader/PeYaHeader";
import StockSection from "./sections/StockImportSection/StockImportSection"
import OrdersSection from "./sections/OrdersSection/OrdersSection"
import ExecutionSection from "./sections/ExecutionSection/ExecutionSection";
import PickingSection from "./sections/PickingSection/PickingSection";
import { WarehouseProcess } from "../../core/warehouse/WarehouseProcess";
import type { StockItem } from "../../core/stock/StockItem";
import type { OrderItem } from "../../core/orders/OrderItem";


const PeYaWorkflow: React.FC = () => {   

    const [stock,setStock]=useState<StockItem[]>([]);
    const [orders,setOrders]=useState<OrderItem[]>([]);
    const [process] = useState(() => new WarehouseProcess());
    const [finished, setFinished] = useState(false);
    
    const handleExecute = async () => {
        process.cargarStock(stock);
        process.cargarPedidos(orders);        
        const result = await process.ejecutar();        
        setFinished(result.success);
    };

    return (
        <div className={styles.container}>
            <PeYaHeader />
            <StockSection onLoaded={setStock}/>
            <OrdersSection onLoaded={setOrders}/>
            <ExecutionSection enabled={stock.length > 0 && orders.length > 0}
                onExecute={handleExecute}
            />
            {finished && (
                <PickingSection
                    picking={process.session.picking}
                    shortages={process.session.shortages}
                    stats={process.session.stats}
                />
            )}
        </div>
    );
};

export default PeYaWorkflow;