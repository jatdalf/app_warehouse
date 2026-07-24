import { useState } from "react";
import styles from "./PeYaWorkflow.module.css";
import PeYaHeader from "./PeYaHeader/PeYaHeader";
import StockSection from "./sections/StockSection/StockSection"
import OrdersSection from "./sections/OrdersSection/OrdersSection"
import ExecutionSection from "./sections/ExecutionSection/ExecutionSection";
import { WarehouseProcess } from "../../core/warehouse/WarehouseProcess";
import type { StockItem } from "../../core/stock/StockItem";
import type { OrderItem } from "../../core/orders/OrderItem";

const PeYaWorkflow: React.FC = () => {   

    const [stock,setStock]=useState<StockItem[]>([]);
    const [orders,setOrders]=useState<OrderItem[]>([]);
    const handleExecute = async () => {
        const process = new WarehouseProcess();
        process.cargarStock(stock);
        process.cargarPedidos(orders);
        await process.ejecutar();
        const result = await process.ejecutar();
        console.log(result);
        console.log(process.session);
    };


    return (
        <div className={styles.container}>
            <PeYaHeader />
            <StockSection onLoaded={setStock}/>
            <OrdersSection onLoaded={setOrders}/>
            <ExecutionSection enabled={stock.length > 0 && orders.length > 0}
                onExecute={handleExecute}
            />
            {/*               
            <ResultsSection />
            <ActionsSection /> */}
        </div>
    );
};

export default PeYaWorkflow;