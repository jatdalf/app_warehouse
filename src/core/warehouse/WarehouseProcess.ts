import { WarehouseSession } from "./WarehouseSession";
import { PeYaPipeline } from "../pipeline/PeYaPipeline";
import { ValidationEngine } from "../engines/ValidationEngine";
import { PickingEngine } from "../engines/PickingEngine";
import { RemitoEngine } from "../engines/RemitoEngine";
import { InforEngine } from "../engines/InforEngine";
import { StockEngine } from "../engines/StockEngine";
import type { OrderItem } from "../orders/OrderItem";
import type { StockItem } from "../stock/StockItem";

export class WarehouseProcess {

    readonly session = new WarehouseSession();

    readonly pipeline = new PeYaPipeline([
        new ValidationEngine(),
        new PickingEngine(),
        new RemitoEngine(),
        new InforEngine(),
        new StockEngine()
    ]);

    cargarPedidos(data: OrderItem[]) {
        this.session.pedidos = [...data];
    }

    cargarStock(data: StockItem[]) {
        this.session.stock = [...data];
    }

    async ejecutar() {
        return this.pipeline.execute(this.session);
    }
}