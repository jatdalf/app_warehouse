import type { OrderItem } from "../../core/orders/OrderItem";

export interface RemitoGroup{
    st:string;
    destino:string;
    items:OrderItem[];
}