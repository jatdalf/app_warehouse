import type { OrderItem } from "../orders/OrderItem";
import type { StockItem } from "../stock/StockItem";
import type { PickingItem } from "../picking/PickingItem";

export class WarehouseSession{
    pedidos:OrderItem[]=[];
    stock:StockItem[]=[];
    picking:PickingItem[]=[];
    remitos:any[]=[];
    movimientos:any[]=[];
    constructor(){}
}