import type { OrderItem } from "../orders/OrderItem";
import type { StockItem } from "../stock/StockItem";
import { WarehouseSession } from "./WarehouseSession";
import { InforEngine } from "../engines/InforEngine";

export class WarehouseProcess {
    private session = new WarehouseSession();
    private inforEngine = new InforEngine();
    cargarPedidos(data: OrderItem[]) {
        this.session.pedidos = [...data];
    }
    cargarStock(stock: StockItem[]) {
        this.session.stock = [...stock];
    }
    getPedidos() {
        return this.session.pedidos;
    }
    getStock() {
        return this.session.stock;
    }
    async generarInfor() {
        return this.inforEngine.execute(this.session);
    }
}