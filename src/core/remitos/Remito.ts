import type { Destino } from "./Destino";
import type { Producto } from "./Producto";

/*
 * Modelo de dominio de un remito listo para impresión.
 * Es independiente del cliente (PedidosYa, Dulcor, etc.).
 */

export interface Remito {
    // Identificación
    numero: string;
    copia: "ORIGINAL" | "DUPLICADO" | "TRIPLICADO";
    fecha: string;

    // Pedido
    pedido: string;

    // Cliente destino
    destinoNombre: string;
    destino: Destino;

    // Mercadería
    productos: Producto[];
}